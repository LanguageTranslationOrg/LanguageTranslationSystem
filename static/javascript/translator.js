function validateTextWithRegex(sourceText, sourceLang) {
  let regexPattern;
  let errorMessage;

  switch (sourceLang) {
      case 'en':
          console.log("Unsupported language code:", sourceLang);
          regexPattern =  /^[a-zA-Z0-9\s\.,:;?!@#$%^&*()_+=-{}[\]|\\<>/~`'"]*$/; // English
          errorMessage = "String contains non-English characters";
          break;
      case 'pa':
          regexPattern = /^[\u0A00-\u0A7F0-9\s.,;?!'"@#%&*()\[\]{}\-]+$/u; // Punjabi
          errorMessage = "String contains non-Punjabi characters";
          break;
      case 'ur':
          regexPattern = /^[\u0600-\u06FF\u0750-\u077F0-9\s.,;?!'"@#%&*()\[\]{}\-]+$/u; // Urdu
          errorMessage = "String contains non-Urdu characters";
          break;
      case 'hi':
          regexPattern = /^[\u0900-\u097F0-9\s.,;?!'"@#%&*()\[\]{}\-]+$/u; // Hindi
          errorMessage = "String contains non-Hindi characters";
          break;
      case 'bn':
          regexPattern = /^[\u0980-\u09FF0-9\s.,;?!'"@#%&*()\[\]{}\-]+$/u; // Bengali
          errorMessage = "String contains non-Bengali characters";
          break;
      case 'ta':
          regexPattern = /^[\u0B80-\u0BFF0-9\s.,;?!'"@#%&*()\[\]{}\-]+$/u; // Tamil
          errorMessage = "String contains non-Tamil characters";
          break;
      case 'te':
          regexPattern = /^[ఁ-౿0-9\u0964-\u0965\u0970\s!,.-:;?(){}[\]]*$/; // Telugu
          errorMessage = "String contains non-Telugu characters";
          break;
      case 'kn':
          regexPattern = /^[\u0C80-\u0CFF0-9\s.,;?!'"@#%&*()\[\]{}\-]+$/u; // Kannada
          errorMessage = "String contains non-Kannada characters";
          break;
      case 'mr':
          regexPattern = /^[\u0900-\u097F0-9\s.,;?!'"@#%&*()\[\]{}\-]+$/u; // Marathi
          errorMessage = "String contains non-Marathi characters";
          break;
      case 'or':
          regexPattern = /^[\u0B00-\u0B7F0-9\s.,;?!'"@#%&*()\[\]{}\-]+$/u; // Oriya
          errorMessage = "String contains non-Oriya characters";
          break;
      case 'ml':
          regexPattern = /^[\u0D00-\u0D7F0-9\s.,;?!'"@#%&*()\[\]{}\-]+$/u; // Malayalam
          errorMessage = "String contains non-Malayalam characters";
          break;
      default:
          console.log("Unsupported language code:", sourceLang);
          throw new Error("Unsupported language code");
  }

  try {
      if (sourceText==''){
        return true;
      }else if (!regexPattern.test(sourceText)) {
          console.log("Unsupported language:",sourceText)
          throw new Error(errorMessage);
      }
  } catch (error) {
      return error.message; // Return the error message
  }

  return true;
}
async function fetchData(url) {
  return fetch(url)
      .then(response => response.json())
      .catch(error => {
          console.error('Error fetching JSON data:', error);
      });
}

async function getValueFromJson(keyword) {
  // Get language code from local storage
  const data = await fetchData('/static/data/warnings_msg_languages.json');
  
  const langCode = localStorage.getItem('selectedLanguage');
  const languageData = data.languages.find(lang => lang.code === langCode);

  // Check if the language code and keyword exist in the JSON data
  if (langCode && languageData) {
      return languageData[keyword];
  } else {
      return null; // Return null if not found
  }
}

async function updateCount() {
    const sourceLang = document.getElementById('source-language').value;
    const sourceText = document.getElementById('source-text');
    const validationMessage = validateTextWithRegex(sourceText.value, sourceLang);
    console.log("validation msg:", validationMessage);
    if (typeof validationMessage === 'string') {
      sourceText.value='';
      const popupmsg=await getValueFromJson("sourcetextmatch");
      const pophead=await getValueFromJson("warning");
      swal(pophead,popupmsg, 'warning');
      console.error("Validation error:", validationMessage);
    } 
    else {
      console.log("Text validation passed");
}
    const charCount = document.getElementById('charCount');
    const remaining = 1000 - sourceText.value.length;
    const msg= await getValueFromJson("charcount")
    charCount.textContent = `${remaining} ${msg}`;
    if (remaining<=0){
      sourceText.disabled=true;
      const popupmsg=await getValueFromJson("charlimit");
      const pophead=await getValueFromJson("warning");
      swal(pophead, popupmsg, 'warning');

    }
  }

  async function translateText() {
    const sourceText = document.getElementById('source-text');
    const sourceLang = document.getElementById('source-language').value;
    const targetLang = document.getElementById('target-language').value;
  
    if (sourceLang === targetLang) {
      sourceText.value = '';
      const popupmsg=await getValueFromJson("srceqtgt");
      const pophead=await getValueFromJson("warning");
      swal(pophead, popupmsg, 'warning');
      return; // Exit the function
    }
  
    if (sourceText.value === null || sourceText.value === undefined || sourceText.value === "") {
      const popupmsg=await getValueFromJson("emptysrc");
      const pophead=await getValueFromJson("warning");
      swal(pophead, popupmsg, 'warning');
      return; // Exit the function
    }
    const spinnerOverlay = document.getElementById('spinner-overlay');
    spinnerOverlay.style.display = 'flex';
  
    fetch('/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source_text: sourceText.value,
        source_lang: sourceLang,
        target_lang: targetLang
      }),
    })
    .then(response => response.json())
    .then(async data => {
      const translatedText = data.translated_text;
      if (translatedText.includes("FLASK SERVER EXCEPTION")) {
        const popupmsg=await getValueFromJson("flask");
        const pophead=await getValueFromJson("error");
        swal(pophead, popupmsg, "error");
      } else {
        document.getElementById('target-text').value = data.translated_text;
        document.getElementById('translatorActions').style.display = 'flex';
      }
      if (translatedText.includes("TRANSLATION EXCEPTION")) {
        const popupmsg=await getValueFromJson("translator");
        const pophead=await getValueFromJson("error");
        swal(pophead, popupmsg, "error");
      } else {
        document.getElementById('target-text').value = data.translated_text;
        document.getElementById('translatorActions').style.display = 'flex';
      }
      spinnerOverlay.style.display = 'none';
    })
    .catch(error => console.error('Error:', error));
  }
  
  
  async function copyText() {
    const targetText = document.getElementById('target-text');
    targetText.select();
    targetText.setSelectionRange(0, 99999); // For mobile devices
  
    document.execCommand('copy');
    const popupmsg=await getValueFromJson("copy");
    const pophead=await getValueFromJson("success");
    swal(pophead, popupmsg, "success");
  }
  
  function shareText(platform) {
    const sourceText = document.getElementById('source-text').value;
    const targetText = document.getElementById('target-text').value;
    const promotionalLines = `Dear User,\n\nBreak language barriers with Bhasha App - Your personal translator in your pocket!\n\nExperience seamless translations with Bhasha App!\n\nBhasha App is dedicated to breaking down language barriers and connecting the world through seamless communication. Our advanced translation app offers precise and fast translations for multiple languages, enabling you to communicate effortlessly for travel, business, or personal connections.`;
    

    const basicShareData = {
        title: 'Translated Text',
        text: `${promotionalLines}\n\nYour Recent Translations\n\nOriginal text: ${sourceText}\n\nTranslated text through Bhasha Bridge: ${targetText}\n\nTry our app now: ${window.location.href}`,
  };
    

    // WhatsApp message formatted with Markdown-like syntax
    const whatsappMessage = `Hey there! 👋\n\nDiscover the power of instant translation with Bhasha Bridge! 🌐\n\n*🗣️ Original:* "${sourceText}"\n*🔄 Translated:* "${targetText}"\n\nWhy choose Bhasha Bridge?\n- ✨ Fast and accurate translations\n- ✨ Supports multiple languages\n- ✨ Trusted by thousands of users\n\nWant to try it yourself? Click here: ${window.location.href}\n\nHave questions or feedback? Reply to this message, we’d love to hear from you!\n\nHappy translating! 🌍✨`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`;

    // Check if platform is 'whatsapp' and handle accordingly
    if (platform === 'whatsapp') {
        window.open(whatsappUrl, '_blank');
        return; // Exit the function after opening WhatsApp
    }

    // If platform is not 'whatsapp', use Web Share API if supported
    if (navigator.share) {
        navigator.share(basicShareData)
            .then(() => console.log('Text shared successfully'))
            .catch((error) => console.error('Error sharing text:', error));
    } else {
        alert('Web Share API is not supported in your browser.');
    }
}


   function resetFields() {
            window.location.reload();
        }