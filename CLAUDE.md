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

- **`app/page.jsx`** 幾乎是整個網站的全部內容——一個很大的 `'use client'` 元件，內含頁首、Hero 區塊、賣點介紹、物件列表格線、分頁、相簿彈窗 (Lightbox)、頁尾。目前沒有拆分成子元件，各區塊是用註解（例如 `// 📄 分頁計算邏輯`）當作分界。要修改某個區塊時，建議依註解標題定位，而不要假設有獨立檔案存在。
- **`app/layout.jsx`** 本身也渲染了「另一個」頁首（內容與 `page.jsx` 內的頁首不同），所以目前網站實際上會疊出兩個頁首。修改頁首時要注意是改到哪一個檔案，兩者互不影響。
- **`components/YieldCalculator.jsx`** 是一個已經寫好的獨立收益試算器元件，但**目前沒有被任何地方引用（孤兒元件）**。如果之後被要求在頁面上加入試算器功能，應優先評估是否該直接掛載這個既有元件，而不是重新寫一個。
- **資料流程（在 `app/page.jsx` 內）**：頁面掛載後透過 `useEffect` 於前端（瀏覽器端）用 `@supabase/supabase-js` 查詢 Supabase 的 `properties` 資料表（使用瀏覽器端 anon key，沒有經過任何 server route）。Supabase URL 與備用 anon key 直接寫死在 `page.jsx` 裡；若有設定環境變數 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 則會覆蓋預設值。原始資料在前端會被轉換：售價自動加價 30%（`price_jpy * 1.3`），圖片欄位可能是 JSON 字串／陣列／單一 URL，若該筆物件完全沒有圖片則會從固定的 `BACKUP_IMAGES` 圖池中挑一張；若資料庫描述欄位是空的或符合某個已知的制式文字，則會自動生成一段中文介紹文案。每筆物件也會產生一組帶有該物件資訊的 LINE 深層連結（`line.me/ti/p/<id>?text=...`），點擊後會預填詢問訊息。
- 因為物件資料是前端非同步載入，剛渲染完成（或 SSR）時畫面短暫顯示「共 0 筆」是正常現象（資料尚未 hydrate 完成），並非網站故障——這點先前已確認過。
- 分頁邏輯完全在前端進行（`itemsPerPage = 12`），是直接對已抓取到的 `properties` 陣列做切片，並沒有依頁碼向 Supabase 做伺服器端分頁查詢（初始抓取就已經透過 `.range(0, 999)` 一次撈到最多 1000 筆）。
- 幣別切換（日圓／台幣）只是前端用固定匯率相乘（`jpyToTwd = 0.21`），並非即時匯率。

## 樣式

使用 Tailwind CSS，設定會掃描 `app/**` 與 `components/**`（見 `tailwind.config.js`）。目前沒有自訂 theme／設計系統，`page.jsx` 內幾乎全部直接使用行內 utility class。

## 路徑別名

`@/*` 對應到專案根目錄（見 `jsconfig.json`），例如可用 `@/components/YieldCalculator` 匯入元件。
