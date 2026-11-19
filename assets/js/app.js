(() => {
  const app = document.getElementById("app");
  const languageButton = document.getElementById("language-button");
  const i18n = window.VIBHAI18n;
  const storage = window.VIBHAStorage;
  const analyzer = window.VIBHAAnalyzer;
  const report = window.VIBHAReport;

  let questionnaire = null;
  let screen = "home";
  let questionIndex = 0;
  let answers = [];
  let languageCycleTimer = null;
  let languageCycleLanguages = [];
  let languageCycleIndex = 0;
  let homeLanguageLocked = false;
  let homePreviewLanguageCode = "en";

  function stopLanguageCycle() {
    if (languageCycleTimer !== null) {
      window.clearInterval(languageCycleTimer);
      languageCycleTimer = null;
    }
  }

  function startLanguageCycle() {
    const preview = document.querySelector(".hero-language-preview");
    if (
      !preview ||
      homeLanguageLocked ||
      languageCycleTimer !== null ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) return;

    languageCycleTimer = window.setInterval(() => {
      languageCycleIndex = (languageCycleIndex + 1) % languageCycleLanguages.length;
      const current = languageCycleLanguages[languageCycleIndex];
      homePreviewLanguageCode = current.code;
      updateHomePreview(current).catch((error) => {
        stopLanguageCycle();
        console.error("Unable to load rotating home-page text", error);
      });
    }, 1000);
  }

  async function updateHomePreview(language) {
    const keys = ["eyebrow", "headline", "tagline", "start", "privacy"];
    const values = await Promise.all(keys.map((key) => i18n.translateFor(language.code, key)));
    if (
      screen !== "home" ||
      homeLanguageLocked ||
      homePreviewLanguageCode !== language.code
    ) return;

    const preview = document.querySelector(".hero-language-preview");
    if (!preview) return;
    preview.dataset.language = language.code;
    preview.setAttribute("aria-label", `Select this language: ${language.name}`);
    preview.lang = language.code;
    preview.dir = ["ks", "sd", "ur"].includes(language.code) ? "rtl" : "ltr";
    document.getElementById("home-eyebrow").textContent = values[0];
    document.getElementById("home-headline").textContent = values[1];
    document.getElementById("home-tagline").textContent = values[2];
    document.getElementById("home-start").textContent = values[3];
    document.getElementById("home-privacy").textContent = values[4];
    document.getElementById("home-start").lang = language.code;
    document.getElementById("home-privacy").lang = language.code;
    document.getElementById("home-draft-status").hidden = !language.draft;
    preview.classList.remove("hero-language-preview--enter");
    void preview.offsetWidth;
    preview.classList.add("hero-language-preview--enter");
  }

  async function initialize() {
    const savedLanguage = storage.getLanguage();
    await i18n.load(savedLanguage);
    languageButton.textContent = i18n.getLanguage().toUpperCase();

    const response = await fetch("data/questionnaires/awareness.json");
    if (!response.ok) throw new Error("Unable to load the questionnaire");
    questionnaire = await response.json();
    validateQuestionnaire(questionnaire);

    renderHome();
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    })[character]);
  }

  function validateTip(tip, location) {
    if (!tip || !["verse", "link"].includes(tip.type)) {
      throw new Error(`Missing or unsupported tip at ${location}`);
    }

    if (tip.type === "verse") {
      if (
        !Array.isArray(tip.lines) ||
        tip.lines.length !== 2 ||
        tip.lines.some((line) => typeof line !== "string" || !line.trim())
      ) {
        throw new Error(`A verse tip must have two non-empty lines at ${location}`);
      }
      return;
    }

    let url;
    try {
      url = new URL(tip.url);
    } catch (error) {
      throw new Error(`Invalid link tip at ${location}`);
    }
    if (!["http:", "https:"].includes(url.protocol) || !tip.label) {
      throw new Error(`Invalid link tip at ${location}`);
    }
  }

  function validateQuestionnaire(data) {
    if (!Array.isArray(data.questions) || !Array.isArray(data.options)) {
      throw new Error("Questionnaire must include questions and options");
    }
    data.questions.forEach((question, index) => {
      validateTip(question.tip, `question ${index + 1}`);
    });
    data.options.forEach((option, index) => {
      validateTip(option.tip, `option ${index + 1}`);
    });
    if (
      !data.bottomSection ||
      !Array.isArray(data.bottomSection.rows) ||
      data.bottomSection.rows.length > 2
    ) {
      throw new Error("Questionnaire bottom section must have at most two text rows");
    }
  }

  function renderTip(tip) {
    const body = tip.type === "verse"
      ? `<p class="tip-copy">${tip.lines.map(escapeHtml).join("<br>")}</p>`
      : `<a href="${escapeHtml(tip.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(tip.label)}</a>`;

    return `
      <details class="tip-details">
        <summary>${escapeHtml(i18n.t("tipLabel"))}</summary>
        ${body}
      </details>
    `;
  }

  function renderBottomSection() {
    const section = questionnaire.bottomSection;
    if (!section.rows.length) return "";

    return `
      <aside class="bottom-section">
        <h2>${escapeHtml(i18n.t(section.titleKey))}</h2>
        <div class="bottom-section-rows">
          ${section.rows.map((row) => `<p>${escapeHtml(row)}</p>`).join("")}
        </div>
      </aside>
    `;
  }

  function renderHome() {
    stopLanguageCycle();
    screen = "home";
    languageCycleLanguages = [
      { code: "en", native: "English", name: "English", draft: false },
      ...i18n.getLanguages()
    ];
    languageCycleIndex = languageCycleLanguages
      .findIndex((entry) => entry.code === i18n.getLanguage());
    if (languageCycleIndex < 0) languageCycleIndex = 0;
    const currentLanguage = languageCycleLanguages[languageCycleIndex];
    homePreviewLanguageCode = currentLanguage.code;

    app.innerHTML = `
      <section class="screen hero">
        <div
          class="hero-language-preview"
          role="button"
          tabindex="0"
          data-action="select-home-language"
          data-language="${currentLanguage.code}"
          aria-label="Select this language: ${escapeHtml(currentLanguage.name)}"
          lang="${currentLanguage.code}"
          dir="${["ks", "sd", "ur"].includes(currentLanguage.code) ? "rtl" : "ltr"}"
        >
          <p class="eyebrow" id="home-eyebrow">${escapeHtml(i18n.t("eyebrow"))}</p>
          <h1 id="home-headline">${escapeHtml(i18n.t("headline"))}</h1>
          <p class="hero-copy" id="home-tagline">${escapeHtml(i18n.t("tagline"))}</p>
          <span class="home-draft-status" id="home-draft-status" ${currentLanguage.draft ? "" : "hidden"}>Draft translation · native-speaker review needed</span>
        </div>
        <div class="button-row">
          <button class="primary-button" id="home-start" type="button" data-action="start">${escapeHtml(i18n.t("start"))}</button>
        </div>
        <p class="privacy-note" id="home-privacy">${escapeHtml(i18n.t("privacy"))}</p>
      </section>
    `;
    const hero = document.querySelector(".hero");
    hero.addEventListener("pointerenter", stopLanguageCycle);
    hero.addEventListener("pointerleave", startLanguageCycle);
    hero.addEventListener("focusin", stopLanguageCycle);
    hero.addEventListener("focusout", (event) => {
      if (!hero.contains(event.relatedTarget)) startLanguageCycle();
    });
    startLanguageCycle();
  }

  function renderLanguages() {
    stopLanguageCycle();
    screen = "languages";
    const languages = [
      { code: "en", name: "English", native: "English", draft: false },
      ...i18n.getLanguages()
    ];

    app.innerHTML = `
      <section class="screen">
        <p class="eyebrow">VIBHA</p>
        <h1>${escapeHtml(i18n.t("chooseLanguage"))}</h1>
        <p class="hero-copy">${escapeHtml(i18n.t("languageNote"))}</p>
        <div class="language-grid">
          ${languages.map((entry) => `
            <button class="language-card" type="button" data-language="${entry.code}">
              <strong>${escapeHtml(entry.native)}</strong>
              <span>${escapeHtml(entry.name)}${entry.draft ? ` · ${escapeHtml(i18n.t("translationDraft"))}` : ""}</span>
            </button>
          `).join("")}
        </div>
      </section>
    `;
  }

  function renderQuestion() {
    stopLanguageCycle();
    screen = "question";
    const question = questionnaire.questions[questionIndex];
    const progress = ((questionIndex + 1) / questionnaire.questions.length) * 100;

    app.innerHTML = `
      <section class="screen">
        <div class="progress-track" aria-label="${questionIndex + 1} of ${questionnaire.questions.length}">
          <span style="width:${progress}%"></span>
        </div>
        <article class="question-card">
          ${i18n.isDraft() ? `<p class="translation-note">${escapeHtml(i18n.t("translationReviewNotice"))}</p>` : ""}
          <p class="question-number">${escapeHtml(i18n.t("question"))} ${questionIndex + 1} / ${questionnaire.questions.length}</p>
          <h2>${escapeHtml(i18n.t(question.prompt))}</h2>
          ${renderTip(question.tip)}
          <div class="answer-options">
            ${questionnaire.options.map((option, index) => `
              <div class="answer-choice">
                <button class="answer-option" type="button" data-answer="${option.value}" data-dimension="${question.dimension}">
                  <span class="number">${index + 1}</span>
                  <span>${escapeHtml(i18n.t(option.label))}</span>
                </button>
                ${renderTip(option.tip)}
              </div>
            `).join("")}
          </div>
        </article>
        ${questionIndex > 0 ? `<div class="button-row"><button class="secondary-button" type="button" data-action="back">${escapeHtml(i18n.t("back"))}</button></div>` : ""}
        ${renderBottomSection()}
      </section>
    `;
  }

  function createReflection(scores) {
    const ranking = analyzer.rank(scores);
    if (!ranking.length) return i18n.t("reflectionDefault");

    const strongest = ranking[0];
    const growth = ranking[ranking.length - 1];
    if (strongest[1] === growth[1]) return i18n.t("reflectionDefault");

    return `${i18n.t("reflectionStrong")} ${i18n.t(strongest[0]).toLowerCase()}. ${i18n.t("reflectionGrow")} ${i18n.t(growth[0]).toLowerCase()}.`;
  }

  function renderReflection() {
    stopLanguageCycle();
    screen = "reflection";
    const scores = analyzer.analyze(answers, questionnaire.dimensions);
    const reflection = createReflection(scores);
    const createdDate = new Date().toISOString().slice(0, 10);
    const session = {
      version: "1.0",
      createdDate,
      language: i18n.getLanguage(),
      responses: answers,
      result: scores,
      reflection
    };
    storage.save(session);

    app.innerHTML = `
      <section class="screen">
        <p class="eyebrow">VIBHA</p>
        <article class="reflection-card">
          ${i18n.isDraft() ? `<p class="translation-note">${escapeHtml(i18n.t("translationReviewNotice"))}</p>` : ""}
          <h1 style="font-size:clamp(2rem,9vw,3.8rem);text-align:left">${escapeHtml(i18n.t("reflection"))}</h1>
          <p>${escapeHtml(i18n.t("reflectionLead"))}</p>
          <div class="results-grid">
            ${Object.entries(scores).map(([dimension, score]) => `
              <div class="score-row">
                <span>${escapeHtml(i18n.t(dimension))}</span>
                <div class="score-track" aria-label="${escapeHtml(i18n.t(dimension))}: ${score}%">
                  <span style="width:${score}%"></span>
                </div>
                <strong>${score}</strong>
              </div>
            `).join("")}
          </div>
        </article>
        <article class="notice-card">
          <h2>${escapeHtml(reflection)}</h2>
          <div class="button-row">
            <button class="primary-button" type="button" data-action="json">${escapeHtml(i18n.t("downloadJson"))}</button>
            <button class="secondary-button" type="button" data-action="text">${escapeHtml(i18n.t("downloadText"))}</button>
          </div>
          <p class="privacy-note">${escapeHtml(i18n.t("privacy"))}</p>
          <div class="button-row">
            <button class="secondary-button" type="button" data-action="restart">${escapeHtml(i18n.t("startAgain"))}</button>
            <button class="secondary-button" type="button" data-action="discard">${escapeHtml(i18n.t("discard"))}</button>
          </div>
        </article>
      </section>
    `;

    app._session = session;
  }

  async function selectLanguage(code) {
    await i18n.load(code);
    languageButton.textContent = code.toUpperCase();
    questionIndex = 0;
    answers = [];
    renderQuestion();
  }

  async function selectHomeLanguage(code) {
    stopLanguageCycle();
    await i18n.load(code);
    languageButton.textContent = code.toUpperCase();
    homeLanguageLocked = true;
    renderHome();
  }

  app.addEventListener("click", async (event) => {
    const action = event.target.closest("[data-action]");
    const language = event.target.closest("[data-language]");
    const answer = event.target.closest("[data-answer]");

    if (action && action.dataset.action === "select-home-language") {
      await selectHomeLanguage(action.dataset.language);
      return;
    }

    if (language) {
      await selectLanguage(language.dataset.language);
      return;
    }

    if (answer) {
      answers[questionIndex] = {
        dimension: answer.dataset.dimension,
        value: Number(answer.dataset.answer)
      };

      if (questionIndex < questionnaire.questions.length - 1) {
        questionIndex += 1;
        renderQuestion();
      } else {
        renderReflection();
      }
      return;
    }

    if (!action) return;

    switch (action.dataset.action) {
      case "home":
        renderHome();
        break;
      case "languages":
        renderLanguages();
        break;
      case "start":
        if (screen === "home" && homePreviewLanguageCode !== i18n.getLanguage()) {
          await i18n.load(homePreviewLanguageCode);
          languageButton.textContent = homePreviewLanguageCode.toUpperCase();
        }
        homeLanguageLocked = true;
        questionIndex = 0;
        answers = [];
        renderQuestion();
        break;
      case "back":
        if (questionIndex > 0) {
          questionIndex -= 1;
          renderQuestion();
        }
        break;
      case "json":
        report.downloadJson(app._session);
        break;
      case "text":
        report.downloadText(app._session, i18n.t);
        break;
      case "restart":
        storage.clear();
        questionIndex = 0;
        answers = [];
        renderQuestion();
        break;
      case "discard":
        storage.clear();
        app.innerHTML = `
          <section class="screen">
            <article class="notice-card">
              <h2>${escapeHtml(i18n.t("discarded"))}</h2>
              <button class="primary-button" type="button" data-action="home">${escapeHtml(i18n.t("startAgain"))}</button>
            </article>
          </section>
        `;
        break;
    }
  });

  app.addEventListener("keydown", (event) => {
    const preview = event.target.closest(".hero-language-preview");
    if (preview && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      selectHomeLanguage(preview.dataset.language);
    }
  });

  languageButton.addEventListener("click", renderLanguages);

  initialize().catch((error) => {
    app.innerHTML = `
      <section class="screen">
        <article class="notice-card">
          <h2>Unable to open VIBHA</h2>
          <p>Serve this folder with a local web server or GitHub Pages.</p>
        </article>
      </section>
    `;
    console.error(error);
  });
})();
