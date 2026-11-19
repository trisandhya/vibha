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

  async function initialize() {
    const savedLanguage = storage.getLanguage();
    await i18n.load(savedLanguage);
    languageButton.textContent = i18n.getLanguage().toUpperCase();

    const response = await fetch("data/questionnaires/awareness.json");
    if (!response.ok) throw new Error("Unable to load the questionnaire");
    questionnaire = await response.json();

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

  function renderHome() {
    screen = "home";
    app.innerHTML = `
      <section class="screen hero">
        <p class="eyebrow">${escapeHtml(i18n.t("eyebrow"))}</p>
        <h1>${escapeHtml(i18n.t("headline"))}</h1>
        <p class="hero-copy">${escapeHtml(i18n.t("tagline"))}</p>
        <div class="button-row">
          <button class="primary-button" type="button" data-action="start">${escapeHtml(i18n.t("start"))}</button>
        </div>
        <p class="privacy-note">${escapeHtml(i18n.t("privacy"))}</p>
      </section>
    `;
  }

  function renderLanguages() {
    screen = "languages";
    app.innerHTML = `
      <section class="screen">
        <p class="eyebrow">VIBHA</p>
        <h1>${escapeHtml(i18n.t("chooseLanguage"))}</h1>
        <p class="hero-copy">${escapeHtml(i18n.t("languageNote"))}</p>
        <div class="language-grid">
          <button class="language-card" type="button" data-language="en"><strong>English</strong><span>English</span></button>
          <button class="language-card" type="button" data-language="te"><strong>తెలుగు</strong><span>Telugu</span></button>
          <button class="language-card" type="button" data-language="hi"><strong>हिन्दी</strong><span>Hindi</span></button>
        </div>
      </section>
    `;
  }

  function renderQuestion() {
    screen = "question";
    const question = questionnaire.questions[questionIndex];
    const progress = ((questionIndex + 1) / questionnaire.questions.length) * 100;

    app.innerHTML = `
      <section class="screen">
        <div class="progress-track" aria-label="${questionIndex + 1} of ${questionnaire.questions.length}">
          <span style="width:${progress}%"></span>
        </div>
        <article class="question-card">
          <p class="question-number">${escapeHtml(i18n.t("question"))} ${questionIndex + 1} / ${questionnaire.questions.length}</p>
          <h2>${escapeHtml(i18n.t(question.prompt))}</h2>
          <div class="answer-options">
            ${questionnaire.options.map((option, index) => `
              <button class="answer-option" type="button" data-answer="${option.value}" data-dimension="${question.dimension}">
                <span class="number">${index + 1}</span>
                <span>${escapeHtml(i18n.t(option.label))}</span>
              </button>
            `).join("")}
          </div>
        </article>
        ${questionIndex > 0 ? `<div class="button-row"><button class="secondary-button" type="button" data-action="back">${escapeHtml(i18n.t("back"))}</button></div>` : ""}
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

  app.addEventListener("click", async (event) => {
    const action = event.target.closest("[data-action]");
    const language = event.target.closest("[data-language]");
    const answer = event.target.closest("[data-answer]");

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
      case "start":
        renderLanguages();
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
