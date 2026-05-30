# Thai Font Impression Experiment

This repository contains a single-page data entry form for a Thai font impression card-ranking experiment.

Participants or experiment staff use the web page to enter ranked physical card IDs for 10 trials. Each completed session can be submitted to a Google Apps Script endpoint, which writes the response rows into Google Sheets and stores a JSON backup in Google Drive.

## Live Page

The intended public entry point is:

```text
https://y-nino.github.io/thai-font-experiment/
```

GitHub Pages should publish from the `main` branch and `/root` folder. The public page loads `index.html`.

## Files

- `index.html`: current experiment page and GitHub Pages entry point.
- `index0529.html`: archived May 29 version kept for reference.
- `google_apps_script.gs`: Google Apps Script Web App code for collecting submissions.
- `GOOGLE_DEPLOYMENT.md`: deployment steps for Google Sheets / Drive collection.
- `sample_result.json`: example output structure.
- `prompts&log/`: project notes and revision logs.

## Data Collection

Each completed participant session contains:

- 10 trials
- 10 ranked card IDs per trial
- 100 Google Sheets rows per submitted session

The web page keeps JSON and CSV export buttons as backup. The Google submission endpoint is configured inside `index.html` as `APPS_SCRIPT_WEB_APP_URL`.

## Development Workflow

Use Git for version history. Keep `index.html` as the main editable page for the current experiment version. Commit changes before and after meaningful edits so the page can be rolled back if needed.

Before public testing:

1. Confirm GitHub Pages serves the latest `index.html`.
2. Submit one test participant session.
3. Confirm the Google Sheet receives 100 rows.
4. Remove or label test rows before real data collection.
