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
            document.querySelector('.translator__button--action[onclick="shareOnWhatsApp()"]').textContent = languageData.shareOnWhatsApp;
            document.querySelector('.translator__button--action[onclick="shareViaEmail()"]').textContent = languageData.shareViaEmail;
            document.querySelector('.char-count').textContent = languageData.charCount;
            document.querySelector('#source-text').placeholder = languageData.placeholder;

            // Update footer text
            document.querySelector('footer p').innerHTML = languageData.footerText;
        } else {
            console.error('Selected language not found in the data');
        }
    }

    // Load the selected language from localStorage
    const selectedLanguage = localStorage.getItem('selectedLanguage') || 'en';
    console.log('Selected Language from localStorage:', selectedLanguage);

    // Fetch JSON data and update the translator page
    fetchData('/static/data/Translator_languages.json')
        .then(data => {
            if (data) {
                updateTranslatorLanguage(selectedLanguage, data);
                // Set the select element to the stored language
                const selectElement = document.getElementById("source-language");
                selectElement.value = selectedLanguage;
            } else {
                console.error('Error fetching data or data is null.');
            }
        })
        .catch(error => {
            console.error('Error fetching or updating translator language data:', error);
        });

    // Update the translator language when the select element changes
    document.getElementById('source-language').addEventListener('change', function() {
        const newSelectedLanguage = this.value;
        localStorage.setItem('selectedLanguage', newSelectedLanguage);
        fetchData('/static/data/Translator_languages.json')
            .then(data => {
                if (data) {
                    updateTranslatorLanguage(newSelectedLanguage, data);
                }
            });
    });
});
