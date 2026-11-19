window.VIBHAStorage = (() => {
  const SESSION_KEY = "vibha-session";
  const LANGUAGE_KEY = "vibha-language";

  function save(session) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }

  function load() {
    const value = localStorage.getItem(SESSION_KEY);
    if (!value) return null;
    try {
      return JSON.parse(value);
    } catch (error) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
  }

  function clear() {
    localStorage.removeItem(SESSION_KEY);
  }

  function getLanguage() {
    return localStorage.getItem(LANGUAGE_KEY) || "en";
  }

  return { save, load, clear, getLanguage };
})();
