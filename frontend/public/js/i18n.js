document.addEventListener('DOMContentLoaded', () => {
    // 1. Configuration
    const languageSelector = document.getElementById('language-selector');
    const defaultLang = 'en';
    const savedLang = localStorage.getItem('preferredLang') || defaultLang;

    /**
     * Fetch and apply translations
     * @param {string} lang - The language code (en/fr/jp)
     */
    const loadLanguage = async (lang) => {
        try {
            const response = await fetch(`/locales/${lang}.json`);
            if (!response.ok) throw new Error(`Could not load ${lang} translation file`);

            const translations = await response.json();

            // Find all elements with the data-i18n attribute
            document.querySelectorAll('[data-i18n]').forEach(element => {
                const key = element.getAttribute('data-i18n');
                if (translations[key]) {
                    // Update text content safely
                    element.textContent = translations[key];
                }
            });

            // Update local storage and document attribute
            localStorage.setItem('preferredLang', lang);
            document.documentElement.lang = lang;

        } catch (error) {
            console.error('i18n Error:', error);
        }
    };

    // 2. Event Listener for the Selector (CSP Compliant)
    if (languageSelector) {
        // Set initial value
        languageSelector.value = savedLang;

        languageSelector.addEventListener('change', (e) => {
            loadLanguage(e.target.value);
        });
    }

    // 3. Initial Load
    loadLanguage(savedLang);
});