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

- **`app/page.jsx`**（2026-08-06 Phase 1 拆分後）現在只是組合元件的進入點——資料/分頁/貨幣/相簿 state 留在這裡，實際渲染委派給 `components/` 下的 `SiteHeader`、`HeroBanner`、`WhyOsaka`、`PropertyGrid`（內含 `PropertyCard`）、`ContactCta`、`GalleryModal`、`SiteFooter`、`LineFab`。要改某個區塊的畫面，先去對應的元件檔案找，不要假設全部邏輯還在 `page.jsx` 裡。`components/YieldCalculator.jsx` 維持獨立掛載在 `<section id="calculator">`，未被納入這次拆分（本來就是獨立元件）。
- **`lib/constants.js`**：`OFFICIAL_LINE_ID`／`OFFICIAL_LINE_URL`／`companyInfo`／`BACKUP_IMAGES`／`formatPropertyPrice()` 等全站共用常數與工具函式，首頁與物件詳情頁共用同一份，不要各自寫一份。
- **`lib/properties.js`**：Supabase 存取與資料正規化的唯一入口——`getSupabaseClient()`、`normalizeProperty(rawItem, index)`（售價 +30%、圖片解析與 fallback、描述 fallback、LINE 深層連結，這些轉換規則全部在這裡）、`getAllProperties()`、`getPropertyById(id)`。首頁（client-side `useEffect`）與物件詳情頁／`sitemap.js`（server-side, edge runtime）都呼叫這幾個函式，是同一套邏輯，改資料轉換規則只需要改這一個檔案。
- **`app/properties/[id]/page.jsx`**（2026-08-06 新增）：每個物件的獨立詳情頁，Server Component，`export const runtime = 'edge'`（Cloudflare Pages 的 `@cloudflare/next-on-pages` 要求動態路由必須用 edge runtime，且**目前不支援 ISR**，所以這裡是「每次請求都重新查 Supabase」，不做 `generateStaticParams` 預先靜態化，確保資料即時）。有 `generateMetadata()` 動態產生 OG／Twitter Card，並在頁面內輸出 `RealEstateListing` JSON-LD。查無資料會呼叫 `notFound()`。首頁每張物件卡有「查看完整介紹 →」連結導向這裡。
- **`app/sitemap.js`／`app/robots.js`**（2026-08-06 新增）：同樣是 `runtime = 'edge'`，`sitemap.js` 會即時查 Supabase 把所有物件的 `/properties/[id]` 網址一起納入。
- **`app/layout.jsx`** 只負責 `<html>`/`<body>` 外殼＋全站 `Organization` JSON-LD（2026-08-06 新增），不再自己渲染頁首。（歷史註記：這裡曾經重複渲染過一個內容不同的第二個頁首，導致全站疊出兩個頁首，已於 2026-08-06 移除。）
- **首頁資料流程**：`app/page.jsx` 掛載後透過 `useEffect` 呼叫 `lib/properties.js` 的 `getAllProperties()`（瀏覽器端用 anon key 查詢 Supabase `properties` 資料表）。因為是前端非同步載入，剛渲染完成時畫面短暫顯示「共 0 筆」是正常現象，並非網站故障。**這是首頁本身的已知限制**：首頁列表仍是 client-only，Google 看不到列表內容；但 Phase 1 已經讓「每一筆物件」都有自己的、伺服器端渲染、可被索引的 `/properties/[id]` 網址與 Schema.org 資料，SEO 地基已補上（見下方「已知架構缺口與後續規劃」）。
- 分頁邏輯完全在前端進行（`itemsPerPage = 12`），是直接對已抓取到的 `properties` 陣列做切片，並沒有依頁碼向 Supabase 做伺服器端分頁查詢（初始抓取就已經透過 `.range(0, 999)` 一次撈到最多 1000 筆）。
- 幣別切換（日圓／台幣）只是前端用固定匯率相乘（`jpyToTwd = 0.21`，在 `lib/constants.js`），並非即時匯率。
- **LINE 詢問入口（2026-08-06 精簡後）**：全站只保留三種強度的 LINE CTA，避免滿版綠色按鈕造成視覺疲勞——① 頁首導覽列一顆常駐按鈕；② 每張物件卡是「📷 看實景照片」＋一顆小型 icon-only 外框按鈕（`border-emerald-500`，不是實心填色）；③ 全站唯一的固定浮動按鈕（`LineFab.jsx`，`fixed bottom-5 right-5`），滾動到任何位置都能一鍵詢問。頁尾「專人諮詢」區塊、相簿彈窗、物件詳情頁各自的按鈕視為單一情境下的自然收尾 CTA，不算在「精簡」範圍內。新增任何 LINE 相關按鈕前，先確認是否已經有上述入口可以涵蓋，避免又疊加出一整片綠色。

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

網站目前的完整升級藍圖（含競品功能研究、13 項目標對照、分階段計畫）記錄在對話歷史中的研究報告裡。進度：

- ✅ **Phase 0（2026-08-06）**：金鑰環境變數化、安全標頭、移除重複頁首、LINE 按鈕精簡、`npm audit` 排查。
- ✅ **Phase 1（2026-08-06）**：`page.jsx` 拆元件、`lib/properties.js` 共用資料層、`/properties/[id]` 物件獨立詳情頁（SSR + `RealEstateListing` JSON-LD + 動態 OG）、全站 `Organization` JSON-LD、`sitemap.js`／`robots.js`。首頁列表本身仍是 client-only（見上方「首頁資料流程」），但每筆物件已經有可被索引的獨立網址。
- ⬜ **Phase 2**：部落格／新聞系統，定期發佈日本房產資訊做內容行銷引流。
- ⬜ **Phase 3**：瀏覽紀錄／熱度提示、物件詳情頁「相似物件」推薦、收藏清單。
- ⬜ **Phase 4**：留名單表單（寫入 Supabase `leads` 表）、GA4 訪客追蹤、業務端通知。
- ⬜ **Phase 5**：n8n 物件資料抓取管線修復——常有抓不到照片／說明的情況，初步判斷是來源網站 JS 動態載入圖片或防盜連保護所致，尚待實際檢視 workflow 才能精準修復。

每完成一個 Phase 都會回來更新本文件對應章節，不要假設這裡列的「⬜ 尚未開始」永遠正確——實作前先確認一下對應的檔案是否已經存在。

## 樣式

使用 Tailwind CSS，設定會掃描 `app/**` 與 `components/**`（見 `tailwind.config.js`）。目前沒有自訂 theme／設計系統，`page.jsx` 內幾乎全部直接使用行內 utility class。

## 路徑別名

`@/*` 對應到專案根目錄（見 `jsconfig.json`），例如可用 `@/components/YieldCalculator` 匯入元件。
