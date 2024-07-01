---
language:
- as
- bn
- brx
- doi
- gom
- gu
- hi
- kn
- ks
- mai
- ml
- mr
- mni
- ne
- or
- pa
- sa
- sat
- snd
- ta
- te
- ur
language_details: >-
  asm_Beng, ben_Beng, brx_Deva, doi_Deva, gom_Deva, guj_Gujr,
  hin_Deva, kan_Knda, kas_Arab, mai_Deva, mal_Mlym, mar_Deva,
  mni_Mtei, npi_Deva, ory_Orya, pan_Guru, san_Deva, sat_Olck,
  snd_Deva, tam_Taml, tel_Telu, urd_Arab
tags:
- indictrans2
- translation
- ai4bharat
- multilingual
license: mit
datasets:
- flores-200
- IN22-Gen
- IN22-Conv
metrics:
- bleu
- chrf
- chrf++
- comet
inference: false
---

# IndicTrans2

This is the model card of IndicTrans2 Indic-Indic Distilled 320M variant adapted after stitching Indic-En Distilled 200M and En-Indic Distilled 200M variants.

Please refer to the [blog](https://ai4bharat.iitm.ac.in/blog/indictrans2-m2m/) for further details on model training, data and metrics.

### Usage Instructions

Please refer to the [github repository](https://github.com/AI4Bharat/IndicTrans2/tree/main/huggingface_interface) for a detail description on how to use HF compatible IndicTrans2 models for inference.

```python
import torch
from transformers import (
    AutoModelForSeq2SeqLM,
    AutoTokenizer,
)
from IndicTransTokenizer import IndicProcessor


model_name = "ai4bharat/indictrans2-indic-indic-dist-320M"
tokenizer = AutoTokenizer.from_pretrained(model_name, trust_remote_code=True)

model = AutoModelForSeq2SeqLM.from_pretrained(model_name, trust_remote_code=True)

ip = IndicProcessor(inference=True)

input_sentences = [
    "जब मैं छोटा था, मैं हर रोज़ पार्क जाता था।",
    "हमने पिछले सप्ताह एक नई फिल्म देखी जो कि बहुत प्रेरणादायक थी।",
    "अगर तुम मुझे उस समय पास मिलते, तो हम बाहर खाना खाने चलते।",
    "मेरे मित्र ने मुझे उसके जन्मदिन की पार्टी में बुलाया है, और मैं उसे एक तोहफा दूंगा।",
]

src_lang, tgt_lang = "hin_Deva", "tam_Taml"

batch = ip.preprocess_batch(
    input_sentences,
    src_lang=src_lang,
    tgt_lang=tgt_lang,
)

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

# Tokenize the sentences and generate input encodings
inputs = tokenizer(
    batch,
    truncation=True,
    padding="longest",
    return_tensors="pt",
    return_attention_mask=True,
).to(DEVICE)

# Generate translations using the model
with torch.no_grad():
    generated_tokens = model.generate(
        **inputs,
        use_cache=True,
        min_length=0,
        max_length=256,
        num_beams=5,
        num_return_sequences=1,
    )

# Decode the generated tokens into text
with tokenizer.as_target_tokenizer():
    generated_tokens = tokenizer.batch_decode(
        generated_tokens.detach().cpu().tolist(),
        skip_special_tokens=True,
        clean_up_tokenization_spaces=True,
    )

# Postprocess the translations, including entity replacement
translations = ip.postprocess_batch(generated_tokens, lang=tgt_lang)

for input_sentence, translation in zip(input_sentences, translations):
    print(f"{src_lang}: {input_sentence}")
    print(f"{tgt_lang}: {translation}")
```

**Note: IndicTrans2 is now compatible with AutoTokenizer, however you need to use IndicProcessor from [IndicTransTokenizer](https://github.com/VarunGumma/IndicTransTokenizer) for preprocessing before tokenization.**


### Citation

If you consider using our work then please cite using:

```
@article{gala2023indictrans,
title={IndicTrans2: Towards High-Quality and Accessible Machine Translation Models for all 22 Scheduled Indian Languages},
author={Jay Gala and Pranjal A Chitale and A K Raghavan and Varun Gumma and Sumanth Doddapaneni and Aswanth Kumar M and Janki Atul Nawale and Anupama Sujatha and Ratish Puduppully and Vivek Raghavan and Pratyush Kumar and Mitesh M Khapra and Raj Dabre and Anoop Kunchukuttan},
journal={Transactions on Machine Learning Research},
issn={2835-8856},
year={2023},
url={https://openreview.net/forum?id=vfT4YuzAYA},
note={}
}
```