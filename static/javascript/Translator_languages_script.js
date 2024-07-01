document.addEventListener('DOMContentLoaded', function() {
    // Fetch JSON data
    function fetchData(url) {
        return fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .catch(error => {
                console.error('Error fetching JSON data:', error);
                return null;
            });
    }

    // Function to update translator page language
    function updateTranslatorLanguage(selectedLanguage, data) {
        console.log('Selected Language:', selectedLanguage);
        const languageData = data.languages.find(lang => lang.code === selectedLanguage);
        if (languageData) {
            console.log('Translator Language Data:', languageData);
            // Update translator page elements with the translated text
            document.querySelector('header h1').textContent = languageData.translatorTitle;
            document.querySelector('label[for="source-language"]').textContent = languageData.sourceLanguageLabel;
            document.querySelector('label[for="target-language"]').textContent = languageData.targetLanguageLabel;
            document.querySelector('label[for="source-text"]').textContent = languageData.enterTextLabel;
            document.querySelector('label[for="target-text"]').textContent = languageData.translatedTextLabel;
            document.querySelector('.translator__button').textContent = languageData.translateButton;
            document.querySelector('.translator__button1').textContent = languageData.reset;
            document.querySelector('.translator__button--action[onclick="copyText()"]').textContent = languageData.copyButton;
            document.querySelector('.translator__button--action[onclick="shareText()"]').textContent = languageData.shareButton;
            document.querySelector('.char-count').textContent = languageData.charCount;
            document.querySelector('.translator__textarea').placeholder =languageData.placeholder;

        } else {
            console.error('Selected language not found in the data');
        }
    }

    // Get selected language from localStorage
    const selectedLanguage = localStorage.getItem('selectedLanguage');
    const selectElement = document.getElementById("source-language");


    // Loop through the options and find the one that matches the stored language code
    for (let i = 0; i < selectElement.options.length; i++) {
      const option = selectElement.options[i];
      if (option.getAttribute("value") === selectedLanguage) {
        option.selected = true;
        break;
      }
    }
    console.log('Selected Language from localStorage:', selectedLanguage);
    
    // Fetch JSON data and update translator page
    fetchData('/static/data/Translator_languages.json')
        .then(data => {
            if (data) {
                updateTranslatorLanguage(selectedLanguage, data);
            } else {
                console.error('Error fetching data or data is null.');
            }
        })
        .catch(error => {
            console.error('Error fetching or updating translator language data:', error);
        });
});
