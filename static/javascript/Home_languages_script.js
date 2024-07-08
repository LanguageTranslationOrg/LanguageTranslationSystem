$(document).ready(function() {
    // Set the default language to English on page load
    var selectedLanguage = 'en';
    $('#language').val(selectedLanguage);
  
    // Function to fetch JSON data
    async function fetchData(url) {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        return await response.json();
      } catch (error) {
        console.error('Error fetching JSON data:', error);
        return null;
      }
    }
  
    // Function to update the home page language
    function updateHomePageLanguage(selectedLanguage, data) {
      const languageData = data.languages.find(lang => lang.code === selectedLanguage);
      if (languageData) {
        $('.site-name').text(languageData.siteName);
        $('.nav-about-us').text(languageData.navAboutUs);
        $('.nav-contact-us').text(languageData.navContactUs);
        $('.welcome h2').text(languageData.welcomeTitle);
        $('.welcome p').text(languageData.welcomeMessage);
        $('.translator__button').text(languageData.getStartedButton);
      } else {
        console.error('Selected language not found in the data');
      }
    }
  
    // Fetch JSON data for the home page
    (async function() {
      var data = await fetchData('/static/data/Home_languages.json');
      if (data) {
        updateHomePageLanguage(selectedLanguage, data);
      }
    })();
  
    // Event listener for language selection change
    $('#language').change(async function() {
      selectedLanguage = $(this).val();
      localStorage.setItem('selectedLanguage', selectedLanguage);
      
      var data = await fetchData('/static/data/Home_languages.json');
      if (data) {
        updateHomePageLanguage(selectedLanguage, data);
      }
    });
  });
  