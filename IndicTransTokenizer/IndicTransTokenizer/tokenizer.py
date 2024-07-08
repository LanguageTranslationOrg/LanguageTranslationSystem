import os
import json
import torch

import warnings
from transformers import BatchEncoding
from typing import Dict, List, Tuple, Union
from sentencepiece import SentencePieceProcessor

_PATH = os.path.dirname(os.path.realpath(__file__))


class IndicTransTokenizer:
    def __init__(
        self,
        direction=None,
        model_name=None,
        unk_token="<unk>",
        bos_token="<s>",
        eos_token="</s>",
        pad_token="<pad>",
        model_max_length=256,
    ):
        self.model_max_length = model_max_length

        self.supported_langs = [
            "asm_Beng",
            "awa_Deva",
            "ben_Beng",
            "bho_Deva",
            "brx_Deva",
            "doi_Deva",
            "eng_Latn",
            "gom_Deva",
            "gon_Deva",
            "guj_Gujr",
            "hin_Deva",
            "hne_Deva",
            "kan_Knda",
            "kas_Arab",
            "kas_Deva",
            "kha_Latn",
            "lus_Latn",
            "mag_Deva",
            "mai_Deva",
            "mal_Mlym",
            "mar_Deva",
            "mni_Beng",
            "mni_Mtei",
            "npi_Deva",
            "ory_Orya",
            "pan_Guru",
            "san_Deva",
            "sat_Olck",
            "snd_Arab",
            "snd_Deva",
            "tam_Taml",
            "tel_Telu",
            "urd_Arab",
            "unr_Deva",
        ]

        deprecation_message = (
            "This IndicTransTokenizer is deprecated.\n"
            "The official Tokenizer is available on HF and can be used as follows:\n"
            "```\nfrom transformers import AutoTokenizer\n"
            "tokenizer = AutoTokenizer.from_pretrained(model_name)\n```"
        )

        warnings.warn(deprecation_message, category=DeprecationWarning, stacklevel=2)

        if model_name is None and direction is None:
            raise ValueError("Either model_name or direction must be provided!")

        if model_name is not None:
            direction = self.get_direction(model_name)  # model_name overrides direction

        self.src_vocab_fp = os.path.join(_PATH, direction, "dict.SRC.json")
        self.tgt_vocab_fp = os.path.join(_PATH, direction, "dict.TGT.json")
        self.src_spm_fp = os.path.join(_PATH, direction, "model.SRC")
        self.tgt_spm_fp = os.path.join(_PATH, direction, "model.TGT")

        self.unk_token = unk_token
        self.pad_token = pad_token
        self.eos_token = eos_token
        self.bos_token = bos_token

        self.encoder = self._load_json(self.src_vocab_fp)
        if self.unk_token not in self.encoder:
            raise KeyError("<unk> token must be in vocab")
        assert self.pad_token in self.encoder
        self.encoder_rev = {v: k for k, v in self.encoder.items()}

        self.decoder = self._load_json(self.tgt_vocab_fp)
        if self.unk_token not in self.encoder:
            raise KeyError("<unk> token must be in vocab")
        assert self.pad_token in self.encoder
        self.decoder_rev = {v: k for k, v in self.decoder.items()}

        # load SentencePiece model for pre-processing
        self.src_spm = self._load_spm(self.src_spm_fp)
        self.tgt_spm = self._load_spm(self.tgt_spm_fp)

        self.unk_token_id = self.encoder[self.unk_token]
        self.pad_token_id = self.encoder[self.pad_token]
        self.eos_token_id = self.encoder[self.eos_token]
        self.bos_token_id = self.encoder[self.bos_token]

    def get_direction(self, model_name: str) -> str:
        pieces = model_name.split("/")[-1].split("-")
        return f"{pieces[1]}-{pieces[2]}"

    def is_special_token(self, x: str):
        return (x == self.pad_token) or (x == self.bos_token) or (x == self.eos_token)

    def get_vocab_size(self, src: bool) -> int:
        """Returns the size of the vocabulary"""
        return len(self.encoder) if src else len(self.decoder)

    def _load_spm(self, path: str) -> SentencePieceProcessor:
        return SentencePieceProcessor(model_file=path)

    def _save_json(self, data, path: str) -> None:
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)

    def _load_json(self, path: str) -> Union[Dict, List]:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)

    def _convert_token_to_id(self, token: str, src: bool) -> int:
        """Converts an token (str) into an index (integer) using the source/target vocabulary map."""
        return (
            self.encoder.get(token, self.encoder[self.unk_token])
            if src
            else self.decoder.get(token, self.encoder[self.unk_token])
        )

    def _convert_id_to_token(self, index: int, src: bool) -> str:
        """Converts an index (integer) into a token (str) using the source/target vocabulary map."""
        return (
            self.encoder_rev.get(index, self.unk_token)
            if src
            else self.decoder_rev.get(index, self.unk_token)
        )

    def _convert_tokens_to_string(self, tokens: List[str], src: bool) -> str:
        """Uses sentencepiece model for detokenization"""
        if src:
            if tokens[0] in self.supported_langs and tokens[1] in self.supported_langs:
                tokens = tokens[2:]
            return " ".join(tokens)
        else:
            return " ".join(tokens)

    def _remove_translation_tags(self, text: str) -> Tuple[List, str]:
        """Removes the translation tags before text normalization and tokenization."""
        tokens = text.split(" ")
        return tokens[:2], " ".join(tokens[2:])

    def _tokenize_src_line(self, line: str) -> List[str]:
        """Tokenizes a source line."""
        tags, text = self._remove_translation_tags(line)
        tokens = self.src_spm.encode(text, out_type=str)
        return tags + tokens

    def _tokenize_tgt_line(self, line: str) -> List[str]:
        """Tokenizes a target line."""
        return self.tgt_spm.encode(line, out_type=str)

    def tokenize(self, text: str, src: bool) -> List[str]:
        """Tokenizes a string into tokens using the source/target vocabulary."""
        return self._tokenize_src_line(text) if src else self._tokenize_tgt_line(text)

    def batch_tokenize(self, batch: List[str], src: bool) -> List[List[str]]:
        """Tokenizes a list of strings into tokens using the source/target vocabulary."""
        return [self.tokenize(line, src) for line in batch]

    def _create_attention_mask(
        self, ids: List[int], max_seq_len: int, src: bool
    ) -> List[int]:
        """Creates a attention mask for the input sequence."""
        if src:
            return [0] * (max_seq_len - len(ids)) + [1] * (len(ids) + 1)
        else:
            return [1] * (len(ids) + 1) + [0] * (max_seq_len - len(ids))

    def _pad_batch(self, tokens: List[str], max_seq_len: int, src: bool) -> List[str]:
        """Pads a batch of tokens and adds BOS/EOS tokens."""
        if src:
            return (
                [self.pad_token] * (max_seq_len - len(tokens))
                + tokens
                + [self.eos_token]
            )
        else:
            return (
                tokens
                + [self.eos_token]
                + [self.pad_token] * (max_seq_len - len(tokens))
            )

    def _decode_line(self, ids: List[int], src: bool) -> List[str]:
        return [self._convert_id_to_token(_id, src) for _id in ids]

    def _encode_line(self, tokens: List[str], src: bool) -> List[int]:
        return [self._convert_token_to_id(token, src) for token in tokens]

    def _strip_special_tokens(self, tokens: List[str]) -> List[str]:
        return [token for token in tokens if not self.is_special_token(token)]

    def _single_input_preprocessing(
        self, tokens: List[str], src: bool, max_seq_len: int
    ) -> Tuple[List[int], List[int], int]:
        """Tokenizes a string into tokens and also converts them into integers using source/target vocabulary map."""
        attention_mask = self._create_attention_mask(tokens, max_seq_len, src)
        padded_tokens = self._pad_batch(tokens, max_seq_len, src)
        input_ids = self._encode_line(padded_tokens, src)
        return input_ids, attention_mask

    def _single_output_postprocessing(self, ids: List[int], src: bool) -> str:
        """Detokenizes a list of integer ids into a string using the source/target vocabulary."""
        tokens = self._decode_line(ids, src)
        tokens = self._strip_special_tokens(tokens)
        return (
            self._convert_tokens_to_string(tokens, src)
            .replace(" ", "")
            .replace("▁", " ")
            .strip()
        )

    def __call__(
        self,
        batch: Union[list, str],
        src: bool,
        truncation: bool = False,
        padding: str = "longest",
        max_length: int = None,
        return_tensors: str = "pt",
        return_attention_mask: bool = True,
        return_length: bool = False,
    ) -> BatchEncoding:
        """Tokenizes a string into tokens and also converts them into integers using source/target vocabulary map."""
        assert padding in [
            "longest",
            "max_length",
        ], "Padding should be either 'longest' or 'max_length'"

        if not isinstance(batch, list):
            raise TypeError(
                f"Batch must be a list, but current batch is of type {type(batch)}"
            )

        # tokenize the source sentences
        batch = self.batch_tokenize(batch, src)

        # truncate the sentences if needed
        if truncation and max_length is not None:
            batch = [ids[:max_length] for ids in batch]

        lengths = [len(ids) for ids in batch]

        max_seq_len = max(lengths) if padding == "longest" else max_length

        input_ids, attention_mask = zip(
            *[
                self._single_input_preprocessing(
                    tokens=tokens, src=src, max_seq_len=max_seq_len
                )
                for tokens in batch
            ]
        )

        _data = {"input_ids": input_ids}

        if return_attention_mask:
            _data["attention_mask"] = attention_mask

        if return_length:
            _data["lengths"] = lengths

        return BatchEncoding(_data, tensor_type=return_tensors)

    def batch_decode(
        self, batch: Union[list, torch.Tensor], src: bool
    ) -> List[List[str]]:
        """Detokenizes a list of integer ids or a tensor into a list of strings using the source/target vocabulary."""

        if isinstance(batch, torch.Tensor):
            batch = batch.detach().cpu().tolist()

        return [self._single_output_postprocessing(ids=ids, src=src) for ids in batch]
