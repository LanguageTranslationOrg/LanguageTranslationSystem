document.addEventListener('DOMContentLoaded', function() {
    // Function to fetch JSON data
    function fetchData(url) {
        return fetch(url)
            .then(response => response.json())
            .catch(error => {
                console.error('Error fetching JSON data:', error);
            });
    }

    // Function to update the main page language
    function updateLanguage(selectedLanguage, data) {
        const languageData = data.languages.find(lang => lang.code === selectedLanguage);
        if (languageData) {
            console.log('Language Data:', languageData);
            // Update website elements with the translated text
            document.querySelector('.site-name').textContent = languageData.siteName;
            document.querySelector('.nav-home').textContent = languageData.navHome;
            document.querySelector('.welcome h2').textContent = languageData.welcomeTitle;
            document.querySelector('.welcome p').textContent = languageData.welcomeMessage;
            document.querySelector('.translator__button').textContent = languageData.getStartedButton;
            document.querySelector('label[for="language"]').textContent = languageData.languageLabel;
            document.querySelector('footer p').innerHTML = languageData.footerText;
        } else {
            console.error('Selected language not found in the data');
        }
    }

    document.getElementById('language').addEventListener('change', async function() {
        var selectedLanguage = this.value || 'en';
        localStorage.setItem('selectedLanguage', selectedLanguage);
        // Fetch JSON data
        var data = await fetchData('/static/data/Home_languages.json');
        console.log('Fetched Data:', data);

        // Use the fetched data to update the language
        if (data) {
            updateLanguage(selectedLanguage, data);
        }
    });

    // Fetch the initial language selection from localStorage
    var initialLanguage = localStorage.getItem('selectedLanguage') || 'en';
    document.getElementById('language').value = initialLanguage;

    // Fetch JSON data and update the page language on initial load
    fetchData('/static/data/Home_languages.json').then(data => {
        if (data) {
            updateLanguage(initialLanguage, data);
        }
    });
});
