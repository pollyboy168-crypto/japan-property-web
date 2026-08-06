# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> 本文件以繁體中文撰寫，供未來的 Claude Code 執行個體快速掌握本專案架構。

## 這是什麼專案

這是一個單頁式（Next.js 14, App Router）行銷／導客網站，屬於日本不動產投資公司「株式会社和日 (Kazuhi Co., Ltd.)」，主打銷售大阪投資型物件與民泊（Airbnb 類型）代管服務，客群為台灣買家。網站文案全為繁體中文。網站本身沒有自建後端——物件資料來自 Supabase 資料表，所有詢問／導客流程最終都導向官方 LINE 帳號（沒有站內表單或線上刷卡結帳功能）。

## 常用指令

```bash
npm run dev          # 啟動本機開發伺服器 (localhost:3000)
npm run build         # next build 正式建置
npm run start          # 在本機執行正式建置版本
npm run pages:build    # 為 Cloudflare Pages 建置 (@cloudflare/next-on-pages)
npm run deploy         # pages:build + wrangler pages deploy（僅供本機手動備援，見下方部署說明）
```

目前專案沒有設定 lint 指令，也沒有測試套件。

## 部署方式——動用 wrangler / vercel 前請先讀這段

**請勿執行 `npm run deploy`、`wrangler`、或 `vercel` 相關指令。** 本專案的部署方式是「將程式碼 `git push` 到 `main` 分支」：Cloudflare Pages 已與此 GitHub repo 串接，push 後會自動建置並上線。`wrangler.toml` 與 `deploy` / `pages:build` 這兩個 npm script 僅作為參考／手動備援用途——使用者先前已明確表示不希望由 CLI 工具直接呼叫 Vercel 或 Wrangler。因此請把「git push」視為真正的部署動作，而不是額外再跑一次 deploy 指令。

**標準修改流程**：
1. 對網站做任何調整或修改後，使用 git CLI 指令 `add` → `commit` → `push` 到 GitHub（`main` 分支）。
2. push 到 GitHub 後，Cloudflare 這邊已設定好自動觸發部署，會自動建置並上線，不需要額外手動觸發。
3. 待 Cloudflare 自動部署完成（可用 `curl` 輪詢正式站，檢查新內容的關鍵字/元素是否已出現）後，確認畫面內容已經是最新版本。
4. 確認部署完成後，**自動用電腦的預設瀏覽器**開啟正式站網址 **https://japan.her-yow.com/** 讓使用者親眼確認（Windows 環境用 `start https://japan.her-yow.com/`；這是開啟系統瀏覽器，不是 Claude Code 內建的 Browser pane）。

## 架構重點

- **`app/page.jsx`** 幾乎是整個網站的全部內容——一個很大的 `'use client'` 元件，內含頁首、Hero 區塊、賣點介紹、投資報酬率試算器掛載點、物件列表格線、分頁、相簿彈窗 (Lightbox)、頁尾、全站唯一固定 LINE 詢問鈕。目前沒有拆分成子元件，各區塊是用註解（例如 `// 📄 分頁計算邏輯`）當作分界。要修改某個區塊時，建議依註解標題定位，而不要假設有獨立檔案存在。
- **`app/layout.jsx`** 只負責 `<html>`/`<body>` 外殼，不再自己渲染頁首。（歷史註記：這裡曾經重複渲染過一個內容不同的第二個頁首，導致全站疊出兩個頁首，已於 2026-08-06 移除，頁首現在只有 `page.jsx` 裡那一個。）
- **`components/YieldCalculator.jsx`** 是收益試算器元件，已掛載在 `page.jsx` 的 `<section id="calculator">`（約第 292 行附近）。（歷史註記：本文件曾誤植為「孤兒元件」，已於 2026-08-06 修正——目前並非孤兒元件，改動試算器邏輯請直接修改這個檔案。）
- **資料流程（在 `app/page.jsx` 內）**：頁面掛載後透過 `useEffect` 於前端（瀏覽器端）用 `@supabase/supabase-js` 查詢 Supabase 的 `properties` 資料表（使用瀏覽器端 anon key，沒有經過任何 server route）。Supabase URL 與 anon key 一律從環境變數 `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` 讀取（見下方「環境變數」一節），程式碼裡不應再寫死任何金鑰值。原始資料在前端會被轉換：售價自動加價 30%（`price_jpy * 1.3`），圖片欄位可能是 JSON 字串／陣列／單一 URL，若該筆物件完全沒有圖片則會從固定的 `BACKUP_IMAGES` 圖池中挑一張；若資料庫描述欄位是空的或符合某個已知的制式文字，則會自動生成一段中文介紹文案。每筆物件也會產生一組帶有該物件資訊的 LINE 深層連結（`line.me/ti/p/<id>?text=...`），點擊後會預填詢問訊息。
- 因為物件資料是前端非同步載入，剛渲染完成（或 SSR）時畫面短暫顯示「共 0 筆」是正常現象（資料尚未 hydrate 完成），並非網站故障——這點先前已確認過。這也是目前架構的已知缺點：Google 等搜尋引擎與 LINE／社群分享預覽抓到的是掛載前的空殼頁面，413 筆物件目前無法被搜尋引擎個別索引（見下方「已知架構缺口與後續規劃」）。
- 分頁邏輯完全在前端進行（`itemsPerPage = 12`），是直接對已抓取到的 `properties` 陣列做切片，並沒有依頁碼向 Supabase 做伺服器端分頁查詢（初始抓取就已經透過 `.range(0, 999)` 一次撈到最多 1000 筆）。
- 幣別切換（日圓／台幣）只是前端用固定匯率相乘（`jpyToTwd = 0.21`），並非即時匯率。
- **LINE 詢問入口（2026-08-06 精簡後）**：全站只保留三種強度的 LINE CTA，避免滿版綠色按鈕造成視覺疲勞——① 頁首導覽列一顆常駐按鈕；② 每張物件卡是「📷 看實景照片」＋一顆小型 icon-only 外框按鈕（`border-emerald-500`，不是實心填色）；③ 全站唯一的固定浮動按鈕（`fixed bottom-5 right-5`），滾動到任何位置都能一鍵詢問。頁尾「專人諮詢」區塊與相簿彈窗內各自的按鈕視為單一情境下的自然收尾 CTA，不算在「精簡」範圍內。新增任何 LINE 相關按鈕前，先確認是否已經有上述入口可以涵蓋，避免又疊加出一整片綠色。

## 環境變數

- `NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_ANON_KEY`：Supabase 專案的 URL 與 **anon public key**（設計上就是要曝露在瀏覽器端的公開金鑰，真正的存取控制要靠 Supabase 的 Row Level Security，不是靠隱藏這把金鑰）。
- 本機開發：複製 `.env.local.example` 為 `.env.local` 並填入實際值（`.env.local` 已加入 `.gitignore`，不會被 commit）。
- **Cloudflare Pages 正式站**：必須在 Cloudflare Pages 專案設定 → Settings → Environment variables 裡，把這兩個變數加到 Production（建議 Preview 也一併加）。這是 2026-08-06 資安強化時把金鑰從原始碼移出後才需要的步驟——**若忘記在 Cloudflare 專案設定同步的話，正式站會抓不到任何物件資料**。
- 程式碼裡（`app/page.jsx`）不應該再出現任何寫死的金鑰或 fallback 值；若環境變數未設定，`supabase` client 會拿到 `undefined`，並在 console 印出明確錯誤，方便排查而不是靜默使用一把過期的金鑰。

## 資安基本盤

- **安全標頭**：`public/_headers` 定義了 CSP、`X-Frame-Options`、`X-Content-Type-Options`、`Referrer-Policy`、`Permissions-Policy`、HSTS。這個檔案會被 `@cloudflare/next-on-pages` 原樣複製進部署輸出，Cloudflare Pages 會依此檔案套用回應標頭。目前 CSP 的 `script-src`／`style-src` 還帶 `'unsafe-inline'`（Next.js App Router 與 Tailwind 現階段需要），屬於過渡性設定，之後若要收緊建議改用 nonce-based CSP。物件圖片來源網域不固定（來自多家日本房產網站的抓取結果），因此 `img-src` 目前是放寬到 `https:` 而非白名單制。
- **金鑰管理**：見上方「環境變數」一節，絕對不要把 Supabase 金鑰、未來任何第三方 API 金鑰寫死在會進 git 的檔案裡。
- **npm 套件漏洞**：`npm audit` 目前仍有約 39 筆已知漏洞，但幾乎都集中在 `wrangler` / `@cloudflare/next-on-pages` / `miniflare` 這條開發工具鏈的間接依賴（`tar`、`undici`、`ws`），**這條工具鏈只有本機手動備援部署（`npm run deploy`）會用到，Cloudflare Pages 的正式建置流程不會執行它**，且本專案規範本來就禁止使用這些指令部署（見上方部署說明）。要徹底清除需要把 `wrangler` 從 3.x 升到 4.x（breaking change），目前先不做，之後排入獨立任務評估。

## 已知架構缺口與後續規劃

網站目前的完整升級藍圖（含競品功能研究、13 項目標對照、分階段計畫）記錄在對話歷史中的研究報告裡，重點缺口摘要：

1. **零 SEO 資料流**——物件資料純前端抓取，Google／LINE 預覽看不到內容，也沒有個別物件的獨立網址與 Schema.org 結構化資料。
2. **沒有部落格／新聞系統**——尚無法定期發佈房產資訊做內容行銷引流。
3. **沒有留名單／訪客追蹤機制**——目前所有導客都導向 LINE，站內沒有任何方式留下聯絡方式或行為紀錄。
4. **沒有瀏覽紀錄／相似物件推薦**——訪客看過的物件不會被記住，物件詳情頁也還不存在（目前只有 Lightbox 相簿彈窗，沒有真正的獨立詳情頁）。
5. **n8n 物件資料抓取管線**——常有抓不到照片／說明的情況，初步判斷是來源網站 JS 動態載入圖片或防盜連保護所致，尚待實際檢視 workflow 才能精準修復。

這些項目已規劃成 Phase 1–5，會在後續各自的工作階段中處理，屆時會再更新本文件對應章節。

## 樣式

使用 Tailwind CSS，設定會掃描 `app/**` 與 `components/**`（見 `tailwind.config.js`）。目前沒有自訂 theme／設計系統，`page.jsx` 內幾乎全部直接使用行內 utility class。

## 路徑別名

`@/*` 對應到專案根目錄（見 `jsconfig.json`），例如可用 `@/components/YieldCalculator` 匯入元件。
