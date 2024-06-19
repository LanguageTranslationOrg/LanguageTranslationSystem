from flask import Flask, request, jsonify, render_template

app = Flask(__name__)

# Dummy translation function
def translate(source_text, source_lang, target_lang):
    return f"Translated from {source_lang} to {target_lang}: {source_text}"

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/translator')  # Route for translator.html
def translator():
    return render_template('translator.html')

@app.route('/translate', methods=['POST'])
def translate_text():
    data = request.get_json()
    source_text = data['source_text']
    source_lang = data['source_lang']
    target_lang = data['target_lang']
    translated_text = translate(source_text, source_lang, target_lang)
    return jsonify({'translated_text': translated_text})

if __name__ == '__main__':
    app.run(debug=True)
