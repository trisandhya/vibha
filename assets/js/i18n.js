window.VIBHAI18n = (() => {
  let translations = {};
  let language = "en";

  async function load(code) {
    const safeCode = ["en", "te", "hi"].includes(code) ? code : "en";
    const response = await fetch(`locales/${safeCode}.json`);
    if (!response.ok) throw new Error(`Unable to load ${safeCode} translations`);
    translations = await response.json();
    language = safeCode;
    document.documentElement.lang = safeCode;
    localStorage.setItem("vibha-language", safeCode);
    return translations;
  }

  function t(key) {
    return translations[key] || key;
  }

  function getLanguage() {
    return language;
  }

  return { load, t, getLanguage };
})();
