from flask import Flask, request, jsonify, render_template
import util

app = Flask(__name__)

def map_lng_keywords(src_lng,tgt_lng):
    lng_keywords_dict={'en':'en_Latn','te': 'tel_Telu', 'hi': 'hin_Deva', 'mr': 'mar_Deva', 'or': 'ory_Orya', 'bn': 'ben_Beng', 'ur': 'urd_Arab', 'ml': 'mal_Mlym', 'ta': 'tam_Taml', 'pa': 'pan_Guru', 'kn': 'kan_Knda'}
    src_lng,tgt_lng=lng_keywords_dict[src_lng],lng_keywords_dict[tgt_lng]
    return (src_lng,tgt_lng)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/translator')  # Route for translator.html
def translator():
    return render_template('translator.html')

@app.route('/translate', methods=['POST'])
def translate_text():
    try:
        data = request.get_json()
        source_text = data['source_text']
        source_lang = data['source_lang']
        target_lang = data['target_lang']
        if source_text.isdigit()==True:
            return jsonify({'translated_text': source_text})
        else:
            src_lng,tgt_lng=map_lng_keywords(source_lang,target_lang)
            source_text=source_text.split('\n')
            translated_text = util.translate(src_lng, tgt_lng,source_text)
            translated_text='\n'.join(translated_text)
    except Exception as e:
        return jsonify({'translated_text':f'FLASK SERVER PAGE ERROR'})
    else:
        return jsonify({'translated_text': translated_text})

if __name__ == '__main__':
    print('Flask server start initialized......................!')
    util.load_models()
    app.run(host='0.0.0.0', port=5000)
