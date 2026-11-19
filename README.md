# VIBHA
VIBHA - A local-first self-discovery and reflection platform.

Awareness before Organization.
Organization before Growth.

VIBHA helps individuals and businesses
discover strengths, weaknesses,
opportunities, activities, relationships,
and areas requiring attention.

The goal is self-discovery.

## Run locally

Serve the repository with any static web server:

```powershell
python -m http.server 8000
```

Open `http://localhost:8000`.

## GitHub Pages

This project uses plain HTML, CSS, and vanilla JavaScript. No build step is required. Enable GitHub Pages for the repository root on the default branch.

## Privacy

VIBHA stores the latest reflection and selected language only in browser `localStorage`. It has no account, backend, analytics, or tracking.

## Questionnaire translations

The home-page introduction rotates through the available languages once per second; select the displayed introduction to make that language active. The questionnaire and choices are translated locally for the 22 languages listed in India's Eighth Schedule. Translations beyond Hindi and Telugu are drafts and are flagged for native-speaker review in the app. Untranslated interface labels fall back to English.

Use the local translation workbook script to export, edit, import, or validate questionnaire translations:

```powershell
node scripts/translation-workbook.js --export translations.csv
node scripts/translation-workbook.js --import translations.csv
node scripts/translation-workbook.js --validate
```

The script uses no external translation service. Review translations with fluent speakers before treating them as final.

## Questionnaire tips and bottom text

Edit `data/questionnaires/awareness.json` to add or change questions and choices. Each question and choice needs a `tip`: use a `verse` with exactly two `lines`, or a `link` with an HTTP(S) `url` and a `label`. The questionnaire page shows each tip in an expandable section.

The same file has a `bottomSection.rows` array for additional page text. It accepts up to two short text rows.

## Structure

```text
index.html
assets/
  css/
  js/
data/
  questionnaires/
locales/
scripts/
docs/
```
