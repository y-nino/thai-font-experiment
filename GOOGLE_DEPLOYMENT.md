# Google Sheets / Drive Deployment

## 1. Create the Google Sheet

1. Create a new Google Sheet for experiment responses.
2. Open `Extensions` -> `Apps Script`.
3. Paste the contents of `google_apps_script.gs` into the Apps Script editor.
4. Save the project.

## 2. Deploy the Web App

1. In Apps Script, click `Deploy` -> `New deployment`.
2. Select type: `Web app`.
3. Execute as: `Me`.
4. Who has access: `Anyone`.
5. Deploy and authorize the script.
6. Copy the Web App URL ending with `/exec`.

## 3. Configure the HTML Page

In `index0530.html`, replace:

```js
const APPS_SCRIPT_WEB_APP_URL = "";
```

with:

```js
const APPS_SCRIPT_WEB_APP_URL = "https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec";
```

Then commit and publish the updated page.

## 4. Data Shape

Each completed participant session writes 100 rows to the `responses` sheet:

- 10 trials
- 10 rank rows per trial

The script also saves one JSON backup file per submission in a Drive folder named `thai_font_experiment_json_backup`.

## 5. Important Browser Note

The page sends data to Apps Script with `mode: "no-cors"` so participants do not need to log in. Because of browser security rules, the page can confirm that the request was sent, but it cannot read the Apps Script response directly. Keep CSV/JSON export buttons as backup during real experiments.
