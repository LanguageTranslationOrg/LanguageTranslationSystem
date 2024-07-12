function validateTextWithRegex(sourceText, sourceLang) {
  let regexPattern;
  let errorMessage;

  switch (sourceLang) {
      case 'en':
          console.log("Unsupported language code:", sourceLang);
          regexPattern =  /^[a-zA-Z0-9\s\.,:;?!@#$%^&*()_+=\-{}[\]|\\<>/~`'!"£$%^&*()_+=<>?:{}|~`,.;]+$/; // English
          errorMessage = "String contains non-English characters";
          break;
      case 'pa':
          regexPattern = /^[\u0A00-\u0A7F0-9\s\.,:;?!@#$%^&*()_+=\-{}[\]|\\<>/~`'!"£$%^&*()_+=<>?:{}|~`,.;]+$/u; // Punjabi
          errorMessage = "String contains non-Punjabi characters";
          break;
      case 'ur':
          regexPattern = /^[\u0600-\u06FF\u0750-\u077F0-9\s\.,:;?!@#$%^&*()_+=\-{}[\]|\\<>/~`'!"£$%^&*()_+=<>?:{}|~`,.;]+$/u; // Urdu
          errorMessage = "String contains non-Urdu characters";
          break;
      case 'hi':
          regexPattern = /^[\u0900-\u097F0-9\s\.,:;?!@#$%^&*()_+=\-{}[\]|\\<>/~`'!"£$%^&*()_+=<>?:{}|~`,.;]+$/u; // Hindi
          errorMessage = "String contains non-Hindi characters";
          break;
      case 'bn':
          regexPattern = /^[\u0980-\u09FF0-9\s\.,:;?!@#$%^&*()_+=\-{}[\]|\\<>/~`'!"£$%^&*()_+=<>?:{}|~`,.;]+$/u; // Bengali
          errorMessage = "String contains non-Bengali characters";
          break;
      case 'ta':
          regexPattern = /^[\u0B80-\u0BFF0-9\s\.,:;?!@#$%^&*()_+=\-{}[\]|\\<>/~`'!"£$%^&*()_+=<>?:{}|~`,.;]+$/u; // Tamil
          errorMessage = "String contains non-Tamil characters";
          break;
      case 'te':
          regexPattern = /^[ఁ-౿0-9\u0964-\u0965\u0970\s\.,:;?!@#$%^&*()_+=\-{}[\]|\\<>/~`'!"£$%^&*()_+=<>?:{}|~`,.;]+$/; // Telugu
          errorMessage = "String contains non-Telugu characters";
          break;
      case 'kn':
          regexPattern = /^[\u0C80-\u0CFF0-9\s\.,:;?!@#$%^&*()_+=\-{}[\]|\\<>/~`'!"£$%^&*()_+=<>?:{}|~`,.;]+$/u; // Kannada
          errorMessage = "String contains non-Kannada characters";
          break;
      case 'mr':
          regexPattern = /^[\u0900-\u097F0-9\s\.,:;?!@#$%^&*()_+=\-{}[\]|\\<>/~`'!"£$%^&*()_+=<>?:{}|~`,.;]+$/u; // Marathi
          errorMessage = "String contains non-Marathi characters";
          break;
      case 'or':
          regexPattern = /^[\u0B00-\u0B7F0-9\s\.,:;?!@#$%^&*()_+=\-{}[\]|\\<>/~`'!"£$%^&*()_+=<>?:{}|~`,.;]+$/u; // Oriya
          errorMessage = "String contains non-Oriya characters";
          break;
      case 'ml':
          regexPattern = /^[\u0D00-\u0D7F0-9\s\.,:;?!@#$%^&*()_+=\-{}[\]|\\<>/~`'!"£$%^&*()_+=<>?:{}|~`,.;]+$/u; // Malayalam
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

  function shareText() {
  const sourceText = document.getElementById('source-text').value;
  const targetText = document.getElementById('target-text').value;
  const sourceLang = document.getElementById('source-language').options[document.getElementById('source-language').selectedIndex].text;
  const targetLang = document.getElementById('target-language').options[document.getElementById('target-language').selectedIndex].text;

  const shareContent = `Dear User,\n\nBreak language barriers with Bhasha Bridge App - Your personal translator in your pocket!\n\nExperience seamless translations with Bhasha Bridge App!\n\nBhasha Bridge App is dedicated to breaking down language barriers and connecting the world through seamless communication. Our advanced translation app offers precise and fast translations for multiple languages, enabling you to communicate effortlessly for travel, business, or personal connections.\n\nSource Language: ${sourceLang}\n\nOriginal text:\n${sourceText}\n\nTarget Language: ${targetLang}\n\nTranslated text through Bhasha Bridge:\n${targetText}\n\nTry our app now: ${window.location.href}`;

  const shareData = {
    title: 'Translated Text',
    text: shareContent,
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

function shareOnWhatsApp() {
  const sourceText = document.getElementById('source-text').value;
  const translatedText = document.getElementById('target-text').value;
  const sourceLang = document.getElementById('source-language').options[document.getElementById('source-language').selectedIndex].text;
  const targetLang = document.getElementById('target-language').options[document.getElementById('target-language').selectedIndex].text;

  if (translatedText) {
    const shareContent = `Dear User,\n\nBreak language barriers with *Bhasha Bridge* - Your personal translator in your pocket!\n\nExperience seamless translations with Bhasha Bridge App!\n\nBhasha Bridge App is dedicated to breaking down language barriers and connecting the world through seamless communication. Our advanced translation app offers precise and fast translations for multiple languages, enabling you to communicate effortlessly for travel, business, or personal connections.\n\n*Source Language:* ${sourceLang}\n\n*Original text:*\n${sourceText}\n\n*Target Language:* ${targetLang}\n\n*Translated text through Bhasha Bridge:*\n${translatedText}\n\nTry our app now: ${window.location.href}`;

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareContent)}`;
    window.open(whatsappUrl, '_blank');
  } else {
    swal("Error", "No text to share", "error");
  }
}

function shareViaEmail() {
  const sourceText = document.getElementById('source-text').value;
  const translatedText = document.getElementById('target-text').value;
  const sourceLang = document.getElementById('source-language').options[document.getElementById('source-language').selectedIndex].text;
  const targetLang = document.getElementById('target-language').options[document.getElementById('target-language').selectedIndex].text;

  // URL of the image hosted on Google Drive (example)
  const imageUrl = 'https://drive.google.com/file/d/18NxPTmgfdIB4Hn6xVklm-gEGyRdwXYqL/view?usp=sharing';

  if (translatedText) {
    const emailSubject = 'Bhasha Bridge';
    const emailBody = `Dear User,\n\nBreak language barriers with Bhasha Bridge App - Your personal translator in your pocket!\n\nExperience seamless translations with Bhasha Bridge App!\n\nBhasha Bridge App is dedicated to breaking down language barriers and connecting the world through seamless communication. Our advanced translation app offers precise and fast translations for multiple languages, enabling you to communicate effortlessly for travel, business, or personal connections.\n\nSource Language: ${sourceLang}\n\nOriginal text:\n${sourceText}\n\nTarget Language: ${targetLang}\n\nTranslated text through Bhasha Bridge:\n${translatedText}\n\nTry our app now: ${window.location.href}`;

    // Constructing the mailto link with the image as an attachment
    const mailtoLink = `https://mail.google.com/mail/?view=cm&fs=1&tf=1&su=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}&aip=1&attachment=${encodeURIComponent(imageUrl)}`;

    window.open(mailtoLink, '_blank');
  } else {
    swal("Error", "No text to share", "error");
  }
}


function resetFields() {
  document.getElementById('source-text').value = '';
  document.getElementById('target-text').value = '';
  document.getElementById('source-text').disabled = false; // Enable the source text textarea
}