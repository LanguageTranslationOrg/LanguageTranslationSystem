function updateCount() {
    const sourceText = document.getElementById('source-text');
    const charCount = document.getElementById('charCount');
    const remaining = 1000 - sourceText.value.length;
    charCount.textContent = `${remaining} characters remaining`;
  }
  
  function translateText() {
    const sourceText = document.getElementById('source-text').value;
    const sourceLang = document.getElementById('source-language').value;
    const targetLang = document.getElementById('target-language').value;
  
    fetch('/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source_text: sourceText,
        source_lang: sourceLang,
        target_lang: targetLang
      }),
    })
    .then(response => response.json())
    .then(data => {
      document.getElementById('target-text').value = data.translated_text;
      document.getElementById('translatorActions').style.display = 'flex';
    })
    .catch(error => console.error('Error:', error));
  }
  
  function copyText() {
    const targetText = document.getElementById('target-text');
    targetText.select();
    targetText.setSelectionRange(0, 99999); // For mobile devices
  
    document.execCommand('copy');
    alert('Translated text copied to clipboard');
  }
  
  function shareText() {
    const sourceText = document.getElementById('source-text').value;
    const targetText = document.getElementById('target-text').value;
    const shareData = {
      title: 'Translated Text',
      text: `Original text:\n${sourceText}\n\nTranslated text through Bhasha Bridge:\n${targetText}\n\nTry our app now: ${window.location.href}`,
    };
  
    if (navigator.share) {
      navigator.share(shareData).then(() => {
        console.log('Text shared successfully');
      }).catch((error) => {
        console.error('Error sharing text:', error);
      });
    } else {
      alert('Web Share API is not supported in your browser.');
    }
  }
  