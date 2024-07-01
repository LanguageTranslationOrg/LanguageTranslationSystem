document.addEventListener('DOMContentLoaded', function() {
    // Show the popup when the page loads
    document.getElementById('popup').style.display = 'flex';

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
            document.querySelector('.nav-about-us').textContent = languageData.navAboutUs;
            document.querySelector('.nav-contact-us').textContent = languageData.navContactUs;
            document.querySelector('.welcome h2').textContent = languageData.welcomeTitle;
            document.querySelector('.welcome p').textContent = languageData.welcomeMessage;
            document.querySelector('.translator__button').textContent = languageData.getStartedButton;
        } else {
            console.error('Selected language not found in the data');
        }
    }

    

    document.getElementById('enter-main-page').onclick = async function() {
        var selectedLanguage = document.getElementById('language').value||'en';
        localStorage.setItem('selectedLanguage', selectedLanguage);
        // Fetch JSON data
        var data = await fetchData('/static/data/Home_languages.json');
        console.log('Fetched Data:', data);

        // Use the fetched data to update the language
        if (data) {
            updateLanguage(selectedLanguage, data);
        }

        // Show the main content and hide the popup
        document.getElementById('popup').style.display = 'none';
        document.getElementById('main-content').style.display = 'block';
    }
});
