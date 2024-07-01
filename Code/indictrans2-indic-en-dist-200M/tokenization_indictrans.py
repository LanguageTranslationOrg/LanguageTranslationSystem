import os
import json

from typing import Dict, List, Optional, Union, Tuple

from transformers.utils import logging
from sentencepiece import SentencePieceProcessor
from transformers.tokenization_utils import PreTrainedTokenizer


logger = logging.get_logger(__name__)

SPIECE_UNDERLINE = "▁"

SPECIAL_TAGS = {
    "_bt_",
    "_ft_",
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
}

VOCAB_FILES_NAMES = {
    "src_vocab_fp": "dict.SRC.json",
    "tgt_vocab_fp": "dict.TGT.json",
    "src_spm_fp": "model.SRC",
    "tgt_spm_fp": "model.TGT",
}


class IndicTransTokenizer(PreTrainedTokenizer):
    _added_tokens_encoder = {}
    _added_tokens_decoder = {}

    vocab_files_names = VOCAB_FILES_NAMES
    model_input_names = ["input_ids", "attention_mask"]

    def __init__(
        self,
        src_vocab_fp=None,
        tgt_vocab_fp=None,
        src_spm_fp=None,
        tgt_spm_fp=None,
        unk_token="<unk>",
        bos_token="<s>",
        eos_token="</s>",
        pad_token="<pad>",
        do_lower_case=False,
        **kwargs,
    ):

        self.src = True

        self.src_vocab_fp = src_vocab_fp
        self.tgt_vocab_fp = tgt_vocab_fp
        self.src_spm_fp = src_spm_fp
        self.tgt_spm_fp = tgt_spm_fp

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

        self.current_spm = self.src_spm
        self.current_encoder = self.encoder
        self.current_encoder_rev = self.encoder_rev

        self.unk_token_id = self.encoder[self.unk_token]
        self.pad_token_id = self.encoder[self.pad_token]
        self.eos_token_id = self.encoder[self.eos_token]
        self.bos_token_id = self.encoder[self.bos_token]

        super().__init__(
            src_vocab_file=self.src_vocab_fp,
            tgt_vocab_file=self.src_vocab_fp,
            do_lower_case=do_lower_case,
            unk_token=unk_token,
            bos_token=bos_token,
            eos_token=eos_token,
            pad_token=pad_token,
            **kwargs,
        )

    def add_new_special_tags(self, new_tags: List[str]):
        SPECIAL_TAGS.update(new_tags)

    def _switch_to_input_mode(self):
        self.src = True
        self.padding_side = "left"
        self.current_spm = self.src_spm
        self.current_encoder = self.encoder
        self.current_encoder_rev = self.encoder_rev

    def _switch_to_target_mode(self):
        self.src = False
        self.padding_side = "right"
        self.current_spm = self.tgt_spm
        self.current_encoder = self.decoder
        self.current_encoder_rev = self.decoder_rev

    def _load_spm(self, path: str) -> SentencePieceProcessor:
        return SentencePieceProcessor(model_file=path)

    def _save_json(self, data, path: str) -> None:
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)

    def _load_json(self, path: str) -> Union[Dict, List]:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)

    def _split_tags(self, tokens: List[str]) -> Tuple[List[str], List[str]]:
        tags = [token for token in tokens if token in SPECIAL_TAGS]
        tokens = [token for token in tokens if token not in SPECIAL_TAGS]
        return tags, tokens

    def _split_pads(self, tokens: List[str]) -> Tuple[List[str], List[str]]:
        pads = [token for token in tokens if token == self.pad_token]
        tokens = [token for token in tokens if token != self.pad_token]
        return pads, tokens

    @property
    def src_vocab_size(self) -> int:
        return len(self.encoder)

    @property
    def tgt_vocab_size(self) -> int:
        return len(self.decoder)

    def get_src_vocab(self) -> Dict[str, int]:
        return dict(self.encoder, **self.added_tokens_encoder)

    def get_tgt_vocab(self) -> Dict[str, int]:
        return dict(self.decoder, **self.added_tokens_decoder)

    # hack override
    def get_vocab(self) -> Dict[str, int]:
        return self.get_src_vocab()

    # hack override
    @property
    def vocab_size(self) -> int:
        return self.src_vocab_size

    def _convert_token_to_id(self, token: str) -> int:
        """Converts an token (str) into an index (integer) using the source/target vocabulary map."""
        return self.current_encoder.get(token, self.current_encoder[self.unk_token])

    def _convert_id_to_token(self, index: int) -> str:
        """Converts an index (integer) into a token (str) using the source/target vocabulary map."""
        return self.current_encoder_rev.get(index, self.unk_token)

    def convert_tokens_to_string(self, tokens: List[str]) -> str:
        """Uses sentencepiece model for detokenization"""
        pads, tokens = self._split_pads(tokens)

        if self.src:

            tags, non_tags = self._split_tags(tokens)

            return (
                " ".join(pads)
                + " "
                + " ".join(tags)
                + " "
                + "".join(non_tags).replace(SPIECE_UNDERLINE, " ").strip()
            )

        return (
            "".join(tokens).replace(SPIECE_UNDERLINE, " ").strip()
            + " "
            + " ".join(pads)
        )

    def _tokenize(self, text) -> List[str]:
        if self.src:
            tokens = text.split(" ")
            tags, non_tags = self._split_tags(tokens)
            text = " ".join(non_tags)
            tokens = self.current_spm.EncodeAsPieces(text)
            return tags + tokens
        else:
            return self.current_spm.EncodeAsPieces(text)

    def build_inputs_with_special_tokens(
        self, token_ids_0: List[int], token_ids_1: Optional[List[int]] = None
    ) -> List[int]:
        if token_ids_1 is None:
            return token_ids_0 + [self.eos_token_id]
        # We don't expect to process pairs, but leave the pair logic for API consistency
        return token_ids_0 + [self.eos_token_id] + token_ids_1 + [self.eos_token_id]

    def save_vocabulary(
        self, save_directory: str, filename_prefix: Optional[str] = None
    ) -> Tuple[str]:
        if not os.path.isdir(save_directory):
            logger.error(f"Vocabulary path ({save_directory}) should be a directory")
            return

        src_spm_fp = os.path.join(save_directory, "model.SRC")
        tgt_spm_fp = os.path.join(save_directory, "model.TGT")
        src_vocab_fp = os.path.join(save_directory, "dict.SRC.json")
        tgt_vocab_fp = os.path.join(save_directory, "dict.TGT.json")

        self._save_json(self.encoder, src_vocab_fp)
        self._save_json(self.decoder, tgt_vocab_fp)

        with open(src_spm_fp, "wb") as f:
            f.write(self.src_spm.serialized_model_proto())

        with open(tgt_spm_fp, "wb") as f:
            f.write(self.tgt_spm.serialized_model_proto())

        return src_vocab_fp, tgt_vocab_fp, src_spm_fp, tgt_spm_fp