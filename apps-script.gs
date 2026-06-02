/**
 * 靈感速記 — Google Sheets 同步後端 (Apps Script)
 * 部署方式：擴充功能 → Apps Script → 貼上 → 部署成「網頁應用程式」
 *   - 執行身分：我
 *   - 誰可以存取：知道連結的任何人（Anyone with the link）
 * 部署後複製「網頁應用程式 URL」，貼進 App 的「☁ 同步設定」。
 *
 * 欄位：內容 | 標籤 | 提醒時間 | 狀態 | 建立時間 | COO備註 | id | 標籤代號
 * App 只寫 PWA 欄位，COO備註 欄永遠保留（用 id 對應）。
 */

var SHEET_NAME = "ideas";
var HEADERS = ["內容", "標籤", "提醒時間", "狀態", "建立時間", "COO備註", "id", "標籤代號"];
// 欄位索引（0-based）
var C = { text:0, label:1, due:2, status:3, ts:4, coo:5, id:6, catId:7 };

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) sh = ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) {
    sh.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]).setFontWeight("bold");
    sh.setFrozenRows(1);
    sh.setColumnWidth(1, 320); // 內容欄寬一點
  }
  return sh;
}

function readAll_() {
  var sh = getSheet_();
  var last = sh.getLastRow();
  if (last < 2) return [];
  var rows = sh.getRange(2, 1, last - 1, HEADERS.length).getValues();
  return rows.filter(function (r) { return r[C.id]; }).map(function (r) {
    return {
      id: String(r[C.id]),
      text: String(r[C.text]),
      catId: String(r[C.catId] || ""),
      catLabel: String(r[C.label] || ""),
      due: r[C.due] ? new Date(r[C.due]).getTime() : null,
      done: String(r[C.status]) === "已完成",
      ts: r[C.ts] ? new Date(r[C.ts]).getTime() : Date.now(),
      cooNote: String(r[C.coo] || "")
    };
  });
}

function getCats_() {
  var p = PropertiesService.getDocumentProperties().getProperty("cats");
  return p ? JSON.parse(p) : null;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  return json_({ ok: true, ideas: readAll_(), cats: getCats_() });
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var body = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    var incoming = body.ideas || [];

    if (body.cats && body.cats.length) {
      PropertiesService.getDocumentProperties().setProperty("cats", JSON.stringify(body.cats));
    }

    // 先記住現有的 COO備註（依 id），重寫時保留
    var noteById = {};
    readAll_().forEach(function (it) { noteById[it.id] = it.cooNote; });

    var sh = getSheet_();
    var rows = incoming.map(function (it) {
      var due = it.due ? new Date(it.due) : "";
      var ts = it.ts ? new Date(it.ts) : new Date();
      var note = (noteById[it.id] !== undefined) ? noteById[it.id] : "";
      var r = [];
      r[C.text] = it.text || "";
      r[C.label] = it.catLabel || "";
      r[C.due] = due;
      r[C.status] = it.done ? "已完成" : "待辦";
      r[C.ts] = ts;
      r[C.coo] = note;
      r[C.id] = it.id;
      r[C.catId] = it.catId || "";
      return r;
    });

    var last = sh.getLastRow();
    if (last > 1) sh.getRange(2, 1, last - 1, HEADERS.length).clearContent();
    if (rows.length) sh.getRange(2, 1, rows.length, HEADERS.length).setValues(rows);

    return json_({ ok: true, ideas: readAll_(), cats: getCats_() });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}
