window.VIBHAI18n = (() => {
  let translations = {};
  let englishTranslations = {};
  let draftTranslations = null;
  let languages = [];
  let language = "en";

  async function load(code) {
    if (!languages.length) {
      const languagesResponse = await fetch("locales/languages.json");
      if (!languagesResponse.ok) throw new Error("Unable to load language list");
      languages = await languagesResponse.json();
    }

    const safeCode = ["en", ...languages.map((entry) => entry.code)].includes(code)
      ? code
      : "en";

    if (!Object.keys(englishTranslations).length) {
      const englishResponse = await fetch("locales/en.json");
      if (!englishResponse.ok) throw new Error("Unable to load English translations");
      englishTranslations = await englishResponse.json();
    }

    if (["en", "hi", "te"].includes(safeCode)) {
      const response = await fetch(`locales/${safeCode}.json`);
      if (!response.ok) throw new Error(`Unable to load ${safeCode} translations`);
      translations = await response.json();
    } else {
      if (!draftTranslations) {
        const response = await fetch("locales/drafts.json");
        if (!response.ok) throw new Error("Unable to load draft translations");
        draftTranslations = await response.json();
      }
      translations = draftTranslations[safeCode] || {};
    }

    language = safeCode;
    document.documentElement.lang = safeCode;
    document.documentElement.dir = ["ks", "sd", "ur"].includes(safeCode) ? "rtl" : "ltr";
    localStorage.setItem("vibha-language", safeCode);
    return translations;
  }

  function t(key) {
    return translations[key] || englishTranslations[key] || key;
  }

  function getLanguage() {
    return language;
  }

  function getLanguages() {
    return languages;
  }

  function isDraft() {
    const current = languages.find((entry) => entry.code === language);
    return Boolean(current && current.draft);
  }

  return { load, t, getLanguage, getLanguages, isDraft };
})();
