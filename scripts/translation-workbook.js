#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const localeDir = path.join(root, "locales");
const english = readJson(path.join(localeDir, "en.json"));
const languages = readJson(path.join(localeDir, "languages.json"));
const questionnaire = readJson(path.join(root, "data", "questionnaires", "awareness.json"));
const translationKeys = Array.from(new Set([
  ...questionnaire.questions.map((question) => question.dimension),
  ...questionnaire.questions.map((question) => question.prompt),
  ...questionnaire.options.map((option) => option.label)
]));
const args = process.argv.slice(2);

function readJson(filename) {
  return JSON.parse(fs.readFileSync(filename, "utf8"));
}

function getTranslations() {
  const drafts = readJson(path.join(localeDir, "drafts.json"));
  const output = {};

  languages.forEach((language) => {
    const filename = path.join(localeDir, `${language.code}.json`);
    output[language.code] = fs.existsSync(filename)
      ? readJson(filename)
      : drafts[language.code];
  });

  return output;
}

function csvCell(value) {
  const text = String(value == null ? "" : value);
  return `"${text.replace(/"/g, '""')}"`;
}

function toCsv(rows) {
  return rows.map((row) => row.map(csvCell).join(",")).join("\r\n") + "\r\n";
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];

    if (quoted && character === '"' && text[index + 1] === '"') {
      cell += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === "," && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && text[index + 1] === "\n") index += 1;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += character;
    }
  }

  if (quoted) throw new Error("CSV contains an unclosed quoted field.");
  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

function makeRows(translations) {
  const rows = [["languageCode", "languageName", "key", "englishText", "translation", "status"]];

  languages.forEach((language) => {
    translationKeys.forEach((key) => {
      rows.push([
        language.code,
        language.name,
        key,
        english[key] || "",
        translations[language.code][key] || "",
        language.draft ? "draft - native review required" : "existing translation"
      ]);
    });
  });

  return rows;
}

function validate(translations) {
  const missing = [];

  languages.forEach((language) => {
    translationKeys.forEach((key) => {
      if (!translations[language.code] || !translations[language.code][key]) {
        missing.push(`${language.code}:${key}`);
      }
    });
  });

  if (missing.length) {
    throw new Error(`Missing translations (${missing.length}): ${missing.join(", ")}`);
  }

  console.log(`All ${translationKeys.length} question/choice keys exist in ${languages.length} language files.`);
}

function importCsv(filename) {
  const rows = parseCsv(fs.readFileSync(filename, "utf8"));
  const header = rows.shift();
  const expectedHeader = ["languageCode", "languageName", "key", "englishText", "translation", "status"];
  if (!header || expectedHeader.some((value, index) => header[index] !== value)) {
    throw new Error("CSV header does not match the exported translation workbook.");
  }

  const translations = getTranslations();
  const seen = new Set();
  rows.forEach((row) => {
    const [code, , key, , value] = row;
    if (!languages.some((language) => language.code === code) || !translationKeys.includes(key)) {
      throw new Error(`Unknown language or translation key: ${code}:${key}`);
    }
    const id = `${code}:${key}`;
    if (seen.has(id)) throw new Error(`Duplicate translation row: ${id}`);
    if (!value || !value.trim()) throw new Error(`Translation is empty: ${id}`);
    seen.add(id);
    translations[code][key] = value.trim();
  });

  const expectedCount = languages.length * translationKeys.length;
  if (seen.size !== expectedCount) {
    throw new Error(`Expected ${expectedCount} translation rows, received ${seen.size}.`);
  }

  const drafts = readJson(path.join(localeDir, "drafts.json"));
  languages.forEach((language) => {
    const filenameForLanguage = path.join(localeDir, `${language.code}.json`);
    if (fs.existsSync(filenameForLanguage)) {
      const current = readJson(filenameForLanguage);
      translationKeys.forEach((key) => { current[key] = translations[language.code][key]; });
      fs.writeFileSync(filenameForLanguage, `${JSON.stringify(current, null, 2)}\n`, "utf8");
    } else {
      drafts[language.code] = translations[language.code];
    }
  });
  fs.writeFileSync(path.join(localeDir, "drafts.json"), `${JSON.stringify(drafts, null, 2)}\n`, "utf8");
  console.log(`Imported ${seen.size} translations from ${filename}.`);
}

function printHelp() {
  console.log([
    "Translation workbook for VIBHA questionnaire text",
    "",
    "  node scripts/translation-workbook.js --validate",
    "  node scripts/translation-workbook.js --export <csv-path>",
    "  node scripts/translation-workbook.js --import <csv-path>",
    "",
    "The tool uses local files only; it does not call translation services."
  ].join("\n"));
}

try {
  const translations = getTranslations();
  if (args[0] === "--validate") {
    validate(translations);
  } else if (args[0] === "--export" && args[1]) {
    const output = path.resolve(process.cwd(), args[1]);
    fs.writeFileSync(output, toCsv(makeRows(translations)), "utf8");
    console.log(`Exported translation workbook to ${output}`);
  } else if (args[0] === "--import" && args[1]) {
    importCsv(path.resolve(process.cwd(), args[1]));
  } else {
    printHelp();
    if (args.length) process.exitCode = 1;
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
