# 靈感速記 — Quick Capture (PWA)

想到什麼就秒記下來的待辦/靈感清單。可裝到手機桌面、離線可用、可選擇雲端同步給 COO 協作。

## 檔案
- `index.html` — App 本體
- `manifest.webmanifest` / `sw.js` — PWA 設定與離線快取
- `icon-*.png` / `apple-touch-icon.png` / `favicon.png` — 圖示
- `apps-script.gs` — Google Sheets 同步後端（貼到 Apps Script）
- `SETUP-google-sheets.md` — 同步設定教學

## 部署到 Vercel（和 cash-tracker / vendor-ledger 一樣）
1. GitHub（stussyfan1984）建新 repo，例如 `quick-capture`
2. 把 **網站檔案**（index.html、manifest、sw.js、各 icon）放進 repo 根目錄 push
   —— `apps-script.gs` 和 `.md` 不影響網站，放著或不放都行
3. Vercel → New Project → 匯入 repo → Framework Preset 選 **Other** → Deploy
（或直接把資料夾拖進 vercel.com 的 New Project）

## 釘到手機桌面
- iPhone Safari：分享 → 加入主畫面
- Android Chrome：選單 → 安裝應用程式

## 兩種使用模式
- **不設定同步**：資料只存這台裝置，離線可用，但不跨裝置。
- **設定 Google Sheets 同步**：手機/電腦共用一份，COO 可在 Sheet 回寫備註。
  設定方式見 `SETUP-google-sheets.md`，App 內點右上角同步徽章貼上 URL 即可。

## 備份
App 內「匯出備份 / 匯入」可存取 JSON，跨環境搬資料或留底。
