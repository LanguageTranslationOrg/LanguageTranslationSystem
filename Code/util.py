from transformers import AutoModelForSeq2SeqLM
from IndicTransTokenizer.IndicTransTokenizer import processor,tokenizer
import torch

__model1=None
__model2=None
__model3=None
__tokenizer1=None
__tokenizer2=None
__tokenizer3=None
__ip=None

def load_models():
    global __model1,__tokenizer1
    global __model2,__tokenizer2
    global __model3,__tokenizer3
    global __ip
    try:
        __model1=AutoModelForSeq2SeqLM.from_pretrained(r'Code/indictrans2-indic-indic-dist-320M',trust_remote_code=True)
        __tokenizer1=tokenizer.IndicTransTokenizer(direction='indic-indic')

        __model2=AutoModelForSeq2SeqLM.from_pretrained(r'Code/indictrans2-indic-en-dist-200M',trust_remote_code=True)
        __tokenizer2=tokenizer.IndicTransTokenizer(direction='indic-en')

        __model3=AutoModelForSeq2SeqLM.from_pretrained(r'Code/indictrans2-en-indic-dist-200M',trust_remote_code=True)
        __tokenizer3=tokenizer.IndicTransTokenizer(direction='en-indic')

        __ip=processor.IndicProcessor(inference=True)
    except Exception as e:
        print(f'Loading_model: {str(e)}')
    else:
        print('models loading completed')


def translate(src_lang, tgt_lang, input_sentences):
    print('Translation started ..........!')
    global __model1,__tokenizer1
    global __model2,__tokenizer2
    global __model3,__tokenizer3
    global __ip

    __model=None
    __tokenizer=None
    if src_lang=='en_Latn':
        __model=__model3
        __tokenizer=__tokenizer3
        print('model3..!')
    elif tgt_lang=='en_Latn':
        __model=__model2
        __tokenizer=__tokenizer2
        print('model2..!')
    else:
        __model=__model1
        __tokenizer=__tokenizer1
        print('model1..!')
    try:
        batch = __ip.preprocess_batch(
        input_sentences,
        src_lang=src_lang,
        tgt_lang=tgt_lang,
    )   
        DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

        inputs = __tokenizer(
        batch,
        src=True,
        truncation=True,
        padding="longest",
        return_tensors="pt",
        return_attention_mask=True,
    ).to(DEVICE)
        if torch.cuda.is_available():
            inputs= inputs.to(__model.device)  # Move input_ids to GPU if available
        with torch.no_grad():
            generated_tokens = __model.generate(
                **inputs,
                use_cache=True,
                min_length=0,
                max_length=1000,
                num_beams=5,
                num_return_sequences=1,
            )

        generated_tokens = __tokenizer.batch_decode(generated_tokens.detach().to(DEVICE).tolist(), src=False)


        translations = __ip.postprocess_batch(generated_tokens, lang=tgt_lang)

    except Exception as e:
        excep_msg='TRANSLATION PAGE ERROR'
        return [excep_msg]
    else:
        print('Translation completed ..........!')
        return translations

if __name__=='__main__':
    load_models()
    src_lng,tgt_lng='en_Latn','tel_Telu'
    inputs=['my name is mahireddy']
    print(translate(src_lng,tgt_lng,inputs))