const SHEET_NAME = "responses";
const JSON_FOLDER_NAME = "thai_font_experiment_json_backup";
const CSV_FOLDER_NAME = "thai_font_experiment_csv_backup";
const SPREADSHEET_ID = "1Cve3Jz5TAMvUyGzq2iCxjLmToDc40egnZkDOxMbdfb8";

const HEADERS = [
  "submission_id",
  "submitted_at",
  "experiment_id",
  "participant_id",
  "cardset",
  "date",
  "trial_id",
  "criterion_card_id",
  "criterion_label",
  "rank",
  "card_id",
  "judgment_basis"
];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    const payload = JSON.parse(e.postData.contents);
    validatePayload(payload);

    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = getOrCreateSheet(spreadsheet);
    ensureHeaderRow(sheet);

    if (hasSubmission(sheet, payload.submission_id)) {
      return jsonResponse({
        ok: true,
        duplicate: true,
        rows_written: 0,
        submission_id: payload.submission_id
      });
    }

    const rows = payload.trials.flatMap(trial =>
      trial.ranking.map(item => [
        payload.submission_id,
        payload.submitted_at,
        payload.experiment_id,
        payload.participant_id,
        payload.cardset,
        payload.date,
        trial.trial_id,
        trial.criterion_card_id,
        trial.criterion_label,
        item.rank,
        item.card_id,
        trial.judgment_basis
      ])
    );

    sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, HEADERS.length).setValues(rows);

    const backups = {
      json_saved: true,
      json_error: "",
      csv_saved: true,
      csv_error: ""
    };

    try {
      saveJsonBackup(payload);
    } catch (error) {
      backups.json_saved = false;
      backups.json_error = error.message;
    }

    try {
      saveCsvBackup(payload);
    } catch (error) {
      backups.csv_saved = false;
      backups.csv_error = error.message;
    }

    return jsonResponse({
      ok: true,
      duplicate: false,
      rows_written: rows.length,
      backup_saved: backups.json_saved && backups.csv_saved,
      backup_error: [backups.json_error, backups.csv_error].filter(Boolean).join(" "),
      json_backup_saved: backups.json_saved,
      json_backup_error: backups.json_error,
      csv_backup_saved: backups.csv_saved,
      csv_backup_error: backups.csv_error,
      submission_id: payload.submission_id
    });
  } catch (error) {
    return jsonResponse({
      ok: false,
      error: error.message
    });
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return jsonResponse({
    ok: true,
    service: "Thai Font Impression Experiment collector"
  });
}

function validatePayload(payload) {
  if (!payload || typeof payload !== "object") {
    throw new Error("Payload must be a JSON object.");
  }
  if (!payload.submission_id) {
    throw new Error("submission_id is required.");
  }
  if (!payload.participant_id || !/^S([1-9]|[1-3][0-9]|40)$/.test(payload.participant_id)) {
    throw new Error("participant_id must be S1-S40.");
  }
  if (!payload.cardset || !/^card_[ab]$/.test(payload.cardset)) {
    throw new Error("cardset must be card_a or card_b.");
  }
  if (!Array.isArray(payload.trials) || payload.trials.length !== 10) {
    throw new Error("Exactly 10 trials are required.");
  }

  payload.trials.forEach(trial => {
    if (!Array.isArray(trial.ranking) || trial.ranking.length !== 10) {
      throw new Error("Each trial must contain exactly 10 ranking rows.");
    }
    trial.ranking.forEach(item => {
      if (!Number.isInteger(item.card_id) || item.card_id < 1 || item.card_id > 40) {
        throw new Error("card_id must be an integer from 1 to 40.");
      }
      if (!Number.isInteger(item.rank) || item.rank < 1 || item.rank > 10) {
        throw new Error("rank must be an integer from 1 to 10.");
      }
    });
  });
}

function getOrCreateSheet(spreadsheet) {
  return spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.insertSheet(SHEET_NAME);
}

function ensureHeaderRow(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    return;
  }

  const currentHeaders = sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0];
  const needsHeader = HEADERS.some((header, index) => currentHeaders[index] !== header);
  if (needsHeader) {
    sheet.insertRowBefore(1);
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  }
}

function hasSubmission(sheet, submissionId) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return false;

  const values = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  return values.some(row => row[0] === submissionId);
}

function saveJsonBackup(payload) {
  const folder = getOrCreateFolder(JSON_FOLDER_NAME);
  const filename = `${payload.submission_id}.json`;
  const blob = Utilities.newBlob(
    JSON.stringify(payload, null, 2),
    "application/json",
    filename
  );
  folder.createFile(blob);
}

function saveCsvBackup(payload) {
  const folder = getOrCreateFolder(CSV_FOLDER_NAME);
  const filename = `${payload.submission_id}.csv`;
  const blob = Utilities.newBlob(
    toCsv(payload),
    "text/csv",
    filename
  );
  folder.createFile(blob);
}

function toCsv(payload) {
  const rows = [HEADERS];

  payload.trials.forEach(trial => {
    trial.ranking.forEach(item => {
      rows.push([
        payload.submission_id,
        payload.submitted_at,
        payload.experiment_id,
        payload.participant_id,
        payload.cardset,
        payload.date,
        trial.trial_id,
        trial.criterion_card_id,
        trial.criterion_label,
        item.rank,
        item.card_id,
        trial.judgment_basis
      ]);
    });
  });

  return rows.map(row => row.map(escapeCsv).join(",")).join("\n");
}

function escapeCsv(value) {
  const text = value === null || value === undefined ? "" : String(value);
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function getOrCreateFolder(name) {
  const folders = DriveApp.getFoldersByName(name);
  if (folders.hasNext()) {
    return folders.next();
  }
  return DriveApp.createFolder(name);
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
