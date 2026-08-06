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

## 操作 Cloudflare／Supabase 等外部網頁介面（2026-08-06 使用者指示）

**任何需要操作網頁介面才能完成的事，優先直接用「Claude in Chrome」（`mcp__claude-in-chrome__*` 工具）動手做，不要只是把步驟或錯誤訊息請使用者手動去查再貼回來。** 例如：

- 到 Cloudflare Dashboard 查閱部署狀態、建置 log、環境變數設定
- 到 Supabase Dashboard 查閱／修改資料表內容、檢查 RLS policy
- 其他任何「打開網頁、點一點、看畫面」就能完成的操作

**Supabase SQL（建表、加欄位、設定 RLS policy 等 schema 變更）預設由 Claude 直接用 Chrome 到 SQL Editor 貼上執行**（2026-08-06 使用者再次確認），不要再像過去那樣把 SQL 寫給使用者、請他自己去貼上執行——那是在還沒有 Chrome 存取能力時的暫時做法，現在有能力了就直接做。實際做法：`navigator.clipboard.writeText(sql)` 把 SQL 寫進剪貼簿，再用 `key` 動作按 `ctrl+v` 貼進 SQL Editor（Monaco 編輯器，直接用 `type` 逐字輸入容易被自動補括號機制弄亂，貼上比較穩定），送出前可用 `javascript_tool` 讀 `window.monaco.editor.getModels()[0].getValue()` 確認貼上內容跟預期一致，再點 Run。**唯一例外**：`DROP`／`DELETE`／`TRUNCATE` 這類會刪資料或砍掉現有結構的破壞性 SQL，一樣要先跟使用者確認過才能執行，不能因為現在有能力自動做就跳過確認——這條界線沒有變。

這跟 Claude Code 內建、專門拿來測試 `localhost` 與正式站畫面的 Browser pane（`mcp__Claude_Browser__*`）是兩個不同的工具——Browser pane 沒有使用者的登入狀態，Claude in Chrome 操作的是使用者真實、已登入的 Chrome。

**使用者已明確授權自主操作**：不需要每次要用瀏覽器前都先問過使用者才動作——需要時直接呼叫 `tabs_create_mcp` 開一個新分頁自己操作即可，操作完自行 `tabs_close_mcp` 收乾淨，不用因為「要不要用瀏覽器」這件事本身停下來問。

**多瀏覽器選擇是工具本身的硬性規定，不是可以省略的一步**：使用者的帳號連了多個 Chrome 瀏覽器實例，呼叫 `tabs_context_mcp` 若回報「Multiple Chrome browsers are connected」，必須依照錯誤訊息指示，用 `AskUserQuestion` 列出每一個已連線瀏覽器（含 deviceId）加上「讓使用者自己在 Chrome 裡點 Connect 選」這個選項，等使用者選定後才能繼續，不要自己擅自選一個——這是單一工作階段（session）內第一次用到瀏覽器時才會遇到，選定後同一個 session 之後就可以直接開新分頁操作，不用重複問。

## 需要 skill 時主動找、主動裝（2026-08-06 使用者指示）

執行任務過程中，如果發現目前可用的 skill 都涵蓋不到當下需要的能力，**主動上網找適合的 skill 並加進來，不要就這樣硬做或跳過**。原則：

- 先確認現有 skill 清單真的沒有能用的，再考慮去找新的，不要重複造輪子。
- 找到後裝進專案（或依情況裝到使用者層級），確認能被 Skill 工具正常呼叫到。
- 如果上網找不到合適的現成 skill，改用 `skill-creator` 這個 skill 自己寫一個，而不是放棄或用比較克難的方式硬做。
- 這件事本身不需要每次都先問過使用者才動作，找到／裝好之後直接繼續原本的任務，過程中如果有選擇性的決策（例如好幾個相似 skill 選哪個）才需要跟使用者確認。

涉及帳號設定變更、刪除資料等有風險的操作，仍然要依照一般安全準則先跟使用者確認，不因為改用 Claude in Chrome 操作就自動視為已授權。

## 架構重點

- **`app/page.jsx`**（2026-08-06 Phase 1 拆分後）現在只是組合元件的進入點——資料/分頁/貨幣/相簿 state 留在這裡，實際渲染委派給 `components/` 下的 `SiteHeader`、`HeroBanner`、`WhyOsaka`、`PropertyGrid`（內含 `PropertyCard`）、`ContactCta`、`GalleryModal`、`SiteFooter`、`LineFab`。要改某個區塊的畫面，先去對應的元件檔案找，不要假設全部邏輯還在 `page.jsx` 裡。`components/YieldCalculator.jsx` 維持獨立掛載在 `<section id="calculator">`，未被納入這次拆分（本來就是獨立元件）。
- **`lib/constants.js`**：`OFFICIAL_LINE_ID`／`OFFICIAL_LINE_URL`／`companyInfo`／`BACKUP_IMAGES`／`formatPropertyPrice()` 等全站共用常數與工具函式，首頁與物件詳情頁共用同一份，不要各自寫一份。
- **`lib/supabase.js`**：`getSupabaseClient()` 唯一定義處，`lib/properties.js` 與 `lib/blog.js` 都從這裡 import。
- **`lib/properties.js`**：Supabase 物件資料存取與正規化的唯一入口——`normalizeProperty(rawItem, index)`（售價 +30%、圖片解析與 fallback、描述 fallback、LINE 深層連結，這些轉換規則全部在這裡）、`getAllProperties()`、`getPropertyById(id)`。首頁（client-side `useEffect`）與物件詳情頁／`sitemap.js`（server-side, edge runtime）都呼叫這幾個函式，是同一套邏輯，改資料轉換規則只需要改這一個檔案。
- **`lib/blog.js`**（2026-08-06 Phase 2 新增）：部落格資料存取——`getPublishedPosts()`、`getPostBySlug(slug)`（多加 `status='published'` 條件，即使猜到草稿 slug 也查不到，是 RLS 之外的第二層防護）、`createDraftPost(...)`（寫死 `status:'draft'`，不接受呼叫端覆寫）。
- **`lib/properties.js` 的 `getSimilarProperties(currentProperty, limit=4)`**（2026-08-06 Phase 3 新增）：直接重用 `getAllProperties()`（資料量小，不新增 Supabase 查詢），依「同地區」「價格接近」「ROI 接近」加權排序，供物件詳情頁的「你可能也喜歡」區塊使用。
- **`lib/clientStorage.js`**（2026-08-06 Phase 3 新增）：純瀏覽器端 `localStorage` 工具，只在 `'use client'` 元件裡使用。兩個獨立命名空間，都是**訪客個人紀錄，不是集體統計，也不會送到任何伺服器**：`kazuhi_recently_viewed`（`getRecentlyViewed()`／`recordView(id)`，存 `[{id, viewedAt}]`，上限 12 筆，只存 id+時間戳，不快取物件標題/價格，顯示時一律拿目前已載入的資料交叉比對，避免顯示過期資訊）、`kazuhi_favorites`（`getFavorites()`／`toggleFavorite(id)`／`isFavorite(id)`，存 id 陣列）。**（設計決策）** 原始需求想要「已有 N 人詢問」這類熱度提示，但網站目前沒有真實的訪客行為統計（Phase 4 才會加），刻意只顯示訪客自己真實看過的物件，不編造集體熱度數字——之後 Phase 4 有真實追蹤資料後才考慮疊加。
- **`components/FavoriteButton.jsx`**：自己管理收藏狀態（讀寫 `lib/clientStorage.js`），掛載後才讀 localStorage（避免 SSR hydration 不一致）。接受可選的 `onToggle(id, next)` callback——首頁用這個 callback 讓 `app/page.jsx` 知道收藏清單變動了，才能讓「只看收藏」篩選即時反映，`FavoriteButton` 本身不需要外部傳入目前是否收藏的 state。
- **`components/RecentlyViewedRail.jsx`**（首頁專用）／**`components/TrackPropertyView.jsx`**（詳情頁專用，不渲染畫面，掛載時記錄一次瀏覽）／**`components/SimilarProperties.jsx`**（詳情頁專用，server-safe，刻意不重用完整的 `PropertyCard`，只需要圖片＋標題＋價格＋連結，重用整個 `PropertyCard` 反而要多接 Lightbox／收藏一堆不需要的 state）。
- **`app/properties/[id]/page.jsx`**（2026-08-06 新增）：每個物件的獨立詳情頁，Server Component，`export const runtime = 'edge'` **加 `export const dynamic = 'force-dynamic'`**（Cloudflare Pages 的 `@cloudflare/next-on-pages` 要求動態路由必須用 edge runtime，且**目前不支援 ISR**；`force-dynamic` 則是為了避開 Next.js 預設會快取 Server Component 內 `fetch()` 結果的行為——見下方「踩過的坑」第 5 點，這行少了會讀到舊資料）。有 `generateMetadata()` 動態產生 OG／Twitter Card，並在頁面內輸出 `RealEstateListing` JSON-LD。查無資料會呼叫 `notFound()`。首頁每張物件卡有「查看完整介紹 →」連結導向這裡。
- **`app/blog/page.jsx`／`app/blog/[slug]/page.jsx`**（2026-08-06 Phase 2 新增）：部落格列表頁與內文頁，架構完全比照物件詳情頁——`runtime = 'edge'` + `dynamic = 'force-dynamic'`、`generateMetadata()`、`BlogPosting` JSON-LD、查無資料或未發布 `notFound()`。內文 `content` 欄位用 `\n\n` 切段落渲染成 `<p>`，沒有用 markdown 套件也沒有用 `dangerouslySetInnerHTML`。
- **`app/sitemap.js`／`app/robots.js`**（2026-08-06 新增）：同樣是 `runtime = 'edge'` + `dynamic = 'force-dynamic'`，`sitemap.js` 會即時查 Supabase 把所有物件的 `/properties/[id]` 與已發布文章的 `/blog/[slug]` 網址一起納入。
- **`app/layout.jsx`** 只負責 `<html>`/`<body>` 外殼＋全站 `Organization` JSON-LD（2026-08-06 新增），不再自己渲染頁首。（歷史註記：這裡曾經重複渲染過一個內容不同的第二個頁首，導致全站疊出兩個頁首，已於 2026-08-06 移除。）
- **首頁資料流程**：`app/page.jsx` 掛載後透過 `useEffect` 呼叫 `lib/properties.js` 的 `getAllProperties()`（瀏覽器端用 anon key 查詢 Supabase `properties` 資料表）。因為是前端非同步載入，剛渲染完成時畫面短暫顯示「共 0 筆」是正常現象，並非網站故障。**這是首頁本身的已知限制**：首頁列表仍是 client-only，Google 看不到列表內容；但 Phase 1 已經讓「每一筆物件」都有自己的、伺服器端渲染、可被索引的 `/properties/[id]` 網址與 Schema.org 資料，SEO 地基已補上（見下方「已知架構缺口與後續規劃」）。
- 分頁邏輯完全在前端進行（`itemsPerPage = 12`），是直接對已抓取到的 `properties` 陣列做切片，並沒有依頁碼向 Supabase 做伺服器端分頁查詢（初始抓取就已經透過 `.range(0, 999)` 一次撈到最多 1000 筆）。
- 幣別切換（日圓／台幣）只是前端用固定匯率相乘（`jpyToTwd = 0.21`，在 `lib/constants.js`），並非即時匯率。
- **LINE 詢問入口（2026-08-06 精簡後）**：全站只保留三種強度的 LINE CTA，避免滿版綠色按鈕造成視覺疲勞——① 頁首導覽列一顆常駐按鈕；② 每張物件卡是「📷 看實景照片」＋一顆小型 icon-only 外框按鈕（`border-emerald-500`，不是實心填色）；③ 全站唯一的固定浮動按鈕（`LineFab.jsx`，`fixed bottom-5 right-5`），滾動到任何位置都能一鍵詢問。頁尾「專人諮詢」區塊、相簿彈窗、物件詳情頁各自的按鈕視為單一情境下的自然收尾 CTA，不算在「精簡」範圍內。新增任何 LINE 相關按鈕前，先確認是否已經有上述入口可以涵蓋，避免又疊加出一整片綠色。
- **`components/LeadFormModal.jsx`**（2026-08-06 Phase 4 新增）：留名單表單＋彈窗，自己管理開關與送出狀態，`variant="fab"` 是首頁固定浮動按鈕（`bottom-24 right-5`，故意疊在 `LineFab` 正上方、不是同一顆，兩者都要留著），`variant="inline"` 是物件詳情頁區塊按鈕，會帶入 `propertyId`／`propertyTitle`。表單送到 `app/api/leads/route.js`。
- **`components/GoogleAnalytics.jsx`**（2026-08-06 Phase 4 新增）：掛在 `app/layout.jsx`，用 `next/script` 載入 GA4，`NEXT_PUBLIC_GA_MEASUREMENT_ID` 沒設定就整個不掛載、不送出任何請求。
- **`lib/analytics.js` 的 `trackEvent(name, params)`**（2026-08-06 Phase 4 新增）：安全呼叫 `window.gtag` 的小工具，GA4 還沒載入時靜默不做事。目前埋了三個自訂事件：`line_click`（`LineFab`／`PropertyCard`／`components/LineClickLink.jsx`）、`favorite_toggle`（`FavoriteButton`）、`lead_submitted`（`LeadFormModal` 送出成功時）。
- **`components/LineClickLink.jsx`**：純粹是一個會送 `line_click` 事件的 `<a>`，讓 server component（例如物件詳情頁）也能追蹤 LINE 點擊，不需要把整頁改成 client component。

## 部落格發布流程（2026-08-06 Phase 2）

網站沒有後台管理介面，發布機制是刻意設計成「anon key 只能新增草稿，人工審核後手動發布」：

- **資料表 `blog_posts`**：欄位 `slug`(PK) / `title` / `excerpt` / `content` / `cover_image` / `status`(`draft`｜`published`) / `published_at` / `created_at`。RLS 只有兩條 policy：公開只能 `select` `status='published'` 的資料列；anon key 只能 `insert` 且 `with check (status = 'draft')`。**沒有 UPDATE／DELETE policy**，代表 anon key 完全無法把草稿改成 published、也無法改內容或刪除——這一步只能由使用者在 Supabase Dashboard 的 Table Editor 手動操作。
- **寫入草稿**：`node --env-file=.env.local scripts/create-blog-draft.mjs scripts/drafts/<檔名>.json`，draft JSON 格式見 `scripts/create-blog-draft.mjs` 檔頭註解。這支腳本刻意不 import `lib/blog.js`（本專案 `package.json` 沒有設 `"type": "module"`，`next.config.js` 等設定檔還是 CommonJS，不能改動這個設定；純 Node 直接執行 `.js` 會把 `lib/` 裡的 ESM `export` 語法解析失敗），所以腳本內自己用 `@supabase/supabase-js` 補了一份等價的最小邏輯。
- **寫入時注意**：insert 之後**不要**再串 `.select()` 把剛寫入的資料讀回來——SELECT policy 只允許讀 `status='published'` 的資料，讀不到剛寫入的 draft 會被 Supabase 回報成 RLS 違規，其實 insert 本身是成功的。已知的資料就直接用來 log／回傳，不要再問資料庫要一次。
- **發布**：使用者到 Supabase Table Editor 把該筆 `status` 手動改成 `published`，可順便填 `published_at`（留空的話，`/blog` 列表與文章頁不會顯示日期，也不影響排序/顯示邏輯，但建議之後補上比較完整）。
- 目前有一篇已發布：`/blog/osaka-tokku-minpaku-2026-shinsei-shuryo`（大阪特區民泊新規受理截止），是驗證整條「Claude 寫草稿 → 使用者審核 → 手動發布」鏈路用的第一篇真實文章，主題來自升級藍圖研究時查到、對現有網站「特區民泊 365 天」行銷文案有實質影響的時事。

## 留名單與訪客追蹤流程（2026-08-06 Phase 4）

- **資料表 `leads`**：欄位 `id`(uuid PK) / `name` / `contact` / `message` / `property_id` / `property_title` / `source_url` / `created_at`。RLS 只有一條 policy：`anon` 可以 `insert`（`with check (true)`）——**沒有 `select` policy**，代表 anon key 完全查不到任何一筆留言，比 `blog_posts` 更嚴格，因為這張表存的是訪客個資，要看名單只能到 Supabase Dashboard 的 Table Editor。這張表是 2026-08-06 由 Claude 直接透過 Claude in Chrome 在 Supabase SQL Editor 建立的（見上方「操作 Cloudflare／Supabase 等外部網頁介面」一節的標準做法）。
- **送出流程**：`components/LeadFormModal.jsx` → `POST /api/leads`（`app/api/leads/route.js`，edge runtime）→ 用 anon key 寫入 `leads` 表 → 呼叫 Resend API 寄通知信給 `LEAD_NOTIFICATION_EMAIL`。**Email 寄送失敗不影響回傳結果**——名單有沒有存進 Supabase 才是重點，寄信只記 log、不會讓使用者看到送出失敗。
- **防機器人**：表單有一個視覺隱藏（`position: absolute; left: -9999px`，不是 `display:none`）的 honeypot 欄位 `website`，一般訪客看不到也不會填；後端只要收到這個欄位有值，就靜默回 `{ok:true}` 但不寫入資料庫，不用 captcha。
- **GA4**：Measurement ID `G-5T1TG1MG5D`，帳戶／資源名稱都叫「株式会社和日」／「日本地產與民宿投資專家」，2026-08-06 由 Claude 透過 Claude in Chrome 在使用者的 Google 帳號（`pollyboy168@gmail.com`）建立。
- **Resend（Email 通知）**：帳號用同一個 Google 帳號登入（`pollyboy168@gmail.com`），API key 存在 `RESEND_API_KEY`。**目前還沒驗證自訂寄件網域**，寄件位址固定是 Resend 的預設測試網域 `onboarding@resend.dev`，收件位址也只能是申請帳號當下那個 Google 帳號的信箱（剛好就是 `pollyboy168@gmail.com`，是使用者自己的信箱，堪用）。之後如果要換成 `xxx@her-yow.com` 這種自訂寄件位址，需要到 Resend 的 Domains 頁面驗證網域（可能要加 DNS 記錄，`her-yow.com` 的 DNS 大概率也在 Cloudflare 上管理）。

## 物件資料同步流程（2026-08-06/07 Phase 5：n8n 假資料管線修復）

**背景**：原本 n8n workflow「01_大阪房產物件LINE連結生成測試」對 10 個來源網站的「列表頁」做純 regex 抓取，抓不到真實資料就用假圖（3 張固定 Unsplash 圖輪流用）／罐頭文案（「〇〇府〇〇市内の厳選収益物件」）硬湊出固定 20 筆，導致 `properties` 表幾乎全是假資料，即使 `source_name` 標成「健美家」，圖片跟文案也完全跟該筆物件無關。實測過這 10 個來源：只有 1 個（LIFULL HOMES）能直接 200，但物件類別不對（一般中古住宅，不是收益物件）；其餘 9 個是 301 導到錯誤頁／404／連線失敗／403，詳細清單已不需保留（架構已整個換掉，不用照舊來源修）。使用者明確指示「務必修好，必要時可以不用 n8n」，並選擇「只修真正能穩定拿到真實資料的少數來源」而非硬修全部 10 個。

**新架構**：唯一保留的來源是**健美家（Kenbiya）**——同時符合「大阪」「收益物件」「靜態 HTML 就含真實圖片與完整文案，不需要 JS 渲染」三個條件、且未被反爬蟲擋下的來源。列表頁 `https://www.kenbiya.com/pp3/k/osaka/{city}/{page}/` 每頁約 19 筆真實物件連結，詳情頁 `https://www.kenbiya.com/pp3/k/osaka/{city}/{page}/re_{id}/` 含真實標題（`<h1>`）、價格（`<dt>価格</dt>` 後面的 `億`／`万円` 組合）、利回り（`rimawari_value` span）、住所（`<dt>住所</dt>`）、1-2 張真實照片（`/upload/p{xxx}/{id}/*.jpg`）、仲介公司撰寫的完整介紹文（`備考` 區塊＋`box_comment` 區塊）。

**關鍵技術限制（踩過的坑）**：實測發現 **Cloudflare Workers 的對外 IP 會被健美家的 F5 WAF 反爬蟲擋下**——`app/api/sync-properties/route.js` 一開始的版本直接在這支 edge API 裡對健美家發 `fetch()`，結果每次都收到空回應（`?debug=1` 診斷模式顯示 `htmlLength: 0`），但同一組 URL 用 **n8n Cloud 的 HTTP Request／Code 節點**發請求完全正常（拿到 202KB 真實 HTML）。因此最終架構把「抓取＋解析 HTML」全部放在 n8n 端執行，這支 API 只負責「接收 n8n 送來的 JSON、驗證、寫入 Supabase」，完全不對健美家發任何請求，繞開了這個反爬蟲限制。**之後如果又想把抓取邏輯搬回 Cloudflare edge route，要先假設一樣會被擋，先用 `?debug=1` 這類方式驗證，不要直接假設能通。**

- **`app/api/sync-properties/route.js`**（edge runtime）：`POST` 帶 `Authorization: Bearer ${SYNC_SECRET}` header 與 `{records: [...]}` JSON body。驗證每筆 record 有 `id`／`title_zh`／`price_jpy`（>0）／`images`（非空陣列）才收，不合格的直接跳過而不是硬塞假值；合格的用 anon key 呼叫 Supabase REST API `upsert`（`Prefer: resolution=merge-duplicates`）寫入 `properties` 表。**這支 API 本身不會被排程觸發，也不知道健美家是什麼，純粹是「被叫了就驗證+寫入」，抓取邏輯完全不在這裡。**
- **n8n workflow「01_大阪房產物件LINE連結生成測試」**（`https://jackystwu.app.n8n.cloud/workflow/TsyPpjdTx4eTi6z5`）：整個重建成 3 個節點——`Schedule Trigger`（沿用原本的每日排程）→ `Code in JavaScript`（一個節點做完全部：抓 3 個 Kenbiya 城市列表頁取得詳情頁連結、逐一抓詳情頁、regex 解析出 `id`／`title_zh`／`price_jpy`／`price_twd`／`location`／`roi`／`type`／`image_url`／`images`／`original_url`／`description_zh`，缺標題／價格／照片的直接跳過不硬湊；內建 429 重試（等 8 秒重試，最多 3 次）與節流（每個請求間隔 1.5 秒，避免觸發健美家的 rate limit）；用 `this.helpers.httpRequest.bind(this.helpers)` 發請求，這是 n8n Code 節點內建、不需要額外套件就能用的 HTTP 工具）→ `HTTP Request`（`POST` 到 `https://japan.her-yow.com/api/sync-properties`，header 帶 `Authorization: Bearer <SYNC_SECRET>`，body 用 JSON 欄位模式帶 `records` = expression `{{ $json.records }}`）。舊的 `Loop Over Items`／`Wait`／假資料生成 `Code` 節點／舊的 Supabase upsert 節點全部刪除。**修改 n8n workflow 後記得要按「Publish」，不是自動存檔的。**
- **`SYNC_SECRET` 環境變數**：隨機產生的長字串，本機 `.env.local` 與 Cloudflare Pages 專案設定（Production）都要有，且要跟 n8n HTTP Request 節點的 `Authorization` header 值一致。單純用來防止陌生人對外呼叫這支同步 API 亂寫資料，不是給使用者登入用的。
- **抓取範圍**：目前鎖定大阪市（`osaka-shi`）前兩頁＋堺市（`sakai-shi`）第一頁，最多 24 筆詳情頁，足以驗證整條真實資料管線可行，之後如果要擴大涵蓋範圍（更多城市／更多頁）只要改 `Code in JavaScript` 節點裡的 `LISTING_PAGES` 陣列與 `MAX_LISTINGS`，同時要留意 Cloudflare／n8n 的 subrequest 上限與健美家的 rate limit（實測連續高頻測試會觸發 429，且封鎖時間不算短，測試時務必節流、不要短時間內重複執行整個 workflow）。
- **⚠️ 待處理**：資料庫裡舊的假資料（`id` 格式 `PROP-{n}-{nnn}`，約 413 筆）跟新的真實資料（`id` 格式 `KENBIYA-{listingId}`）不會撞號，代表兩者會並存顯示在網站上，除非額外清理。是否要清掉舊的假資料、怎麼清（全部刪除？只留没有對應真實資料的？），是破壞性操作，**還沒問過使用者，不要主動執行 DELETE**。

## 環境變數

- `NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_ANON_KEY`：Supabase 專案的 URL 與 **anon public key**（設計上就是要曝露在瀏覽器端的公開金鑰，真正的存取控制要靠 Supabase 的 Row Level Security，不是靠隱藏這把金鑰）。
- `NEXT_PUBLIC_GA_MEASUREMENT_ID`（2026-08-06 Phase 4 新增）：GA4 Measurement ID，本身不是敏感資訊，公開曝露在瀏覽器本來就是 GA4 的設計。
- `RESEND_API_KEY`（2026-08-06 Phase 4 新增）：**伺服器端專用，沒有 `NEXT_PUBLIC_` 前綴，絕對不能出現在會被瀏覽器讀到的地方**。只有 `app/api/leads/route.js` 這個 edge route 會用到。
- `LEAD_NOTIFICATION_EMAIL`（2026-08-06 Phase 4 新增）：留名單通知信要寄到哪個信箱，同樣是伺服器端專用。
- `SYNC_SECRET`（2026-08-07 Phase 5 新增）：`app/api/sync-properties/route.js` 的呼叫驗證密鑰，伺服器端專用。n8n workflow 的 HTTP Request 節點呼叫這支 API 時要帶一樣的值（`Authorization: Bearer <SYNC_SECRET>`），兩邊改了其中一邊要記得同步改另一邊。
- 本機開發：複製 `.env.local.example` 為 `.env.local` 並填入實際值（`.env.local` 已加入 `.gitignore`，不會被 commit）。
- **Cloudflare Pages 正式站**：必須在 Cloudflare Pages 專案設定 → Settings → Environment variables 裡，把上面這幾個變數加到 Production（建議 Preview 也一併加）。這是 2026-08-06 資安強化時把金鑰從原始碼移出後才需要的步驟——**若忘記在 Cloudflare 專案設定同步的話，正式站會抓不到任何物件資料，或是 GA4／留名單功能不會動作**。
- 程式碼裡不應該再出現任何寫死的金鑰或 fallback 值；若環境變數未設定，`supabase` client 會拿到 `undefined`，並在 console 印出明確錯誤，方便排查而不是靜默使用一把過期的金鑰。

## 資安基本盤

- **安全標頭**：`public/_headers` 定義了 CSP、`X-Frame-Options`、`X-Content-Type-Options`、`Referrer-Policy`、`Permissions-Policy`、HSTS。這個檔案會被 `@cloudflare/next-on-pages` 原樣複製進部署輸出，Cloudflare Pages 會依此檔案套用回應標頭。目前 CSP 的 `script-src`／`style-src` 還帶 `'unsafe-inline'`（Next.js App Router 與 Tailwind 現階段需要），屬於過渡性設定，之後若要收緊建議改用 nonce-based CSP。物件圖片來源網域不固定（來自多家日本房產網站的抓取結果），因此 `img-src` 目前是放寬到 `https:` 而非白名單制。**2026-08-06 Phase 4 加了 GA4 需要的網域**：`script-src` 加 `https://www.googletagmanager.com`，`connect-src` 加 `https://www.google-analytics.com`／`https://*.google-analytics.com`／`https://*.analytics.google.com`——之後如果加其他第三方追蹤／服務，記得同樣要更新這個檔案，不然會被自己的 CSP 擋掉（Phase 0 的教訓）。
- **金鑰管理**：見上方「環境變數」一節，絕對不要把 Supabase 金鑰、未來任何第三方 API 金鑰寫死在會進 git 的檔案裡。
- **⚠️ 待處理：`properties` 資料表 RLS 目前是關閉的（`UNRESTRICTED`）**（2026-08-06 Phase 4 驗證 `leads` 表時，在 Supabase Table Editor 順手看到）。跟 `blog_posts`／`leads` 不一樣，`properties` 表完全沒有設定 Row Level Security，理論上代表 anon key 不只能讀，可能連寫都不會被擋（實際權限還要再測試確認）。目前網站的使用方式只有讀取，還沒有出過事，但這是一個已知的資安缺口，應該找時間補上「anon 只能 SELECT」的 RLS policy——不要主動去改，先跟使用者確認這張表是不是還有其他地方（例如 n8n 寫入流程）依賴目前完全開放的寫入權限，避免補了 RLS 反而讓既有的資料寫入管線斷掉。
- **npm 套件漏洞**：`npm audit` 目前仍有約 39 筆已知漏洞，但幾乎都集中在 `wrangler` / `@cloudflare/next-on-pages` / `miniflare` 這條開發工具鏈的間接依賴（`tar`、`undici`、`ws`），**這條工具鏈只有本機手動備援部署（`npm run deploy`）會用到，Cloudflare Pages 的正式建置流程不會執行它**，且本專案規範本來就禁止使用這些指令部署（見上方部署說明）。要徹底清除需要把 `wrangler` 從 3.x 升到 4.x（breaking change），目前先不做，之後排入獨立任務評估。

## Cloudflare 部署踩過的坑（2026-08-06，Phase 1 上線時）

在第一次新增任何動態／edge route（`sitemap.js`、`robots.js`、`/properties/[id]`）之前，本專案的正式站全部是純靜態頁面，沒踩過這些坑：

1. **`@cloudflare/next-on-pages` 版本卡在 1.13.0**：edge function 打包階段會出現 `Could not resolve "async_hooks"`（已知 bug，1.13.6 修好）。修法是把 `package.json` 的 `@cloudflare/next-on-pages` 鎖定在 **`1.13.15`**（不要用最新的 1.13.16，那版加了 `next >= 14.3.0` 的 peer 限制，Next.js 根本沒發過 14.3.0，會裝不起來，目前專案是 `next@14.2.x`）。
2. **`wrangler.toml` 的 `compatibility_date` 太舊**：原本是 `2024-03-01`，但 `nodejs_compat` 旗標的行為是綁 `compatibility_date` 的，Cloudflare／`next-on-pages` 文件要求至少 `2024-09-23`。日期太舊會導致「任何需要在請求當下執行的 edge function」回應通用的 `Internal Server Error`（連完全不呼叫 Supabase 的純靜態 `robots.js` 都會噴），但已經預先建置好的靜態頁面（像首頁）不受影響——這個症狀組合是辨識這個問題的關鍵線索。已改成 `2024-09-23`。
3. 這個專案因為長期都是全靜態頁面，`wrangler.toml` 的 `compatibility_date` 一直沒人注意到已經過舊；**之後如果又要新增任何 server-rendered／edge route，先確認這個日期跟 `@cloudflare/next-on-pages` 版本是不是又落後了**，不要假設現有設定永遠適用。
4. Cloudflare Pages Functions（透過 `next-on-pages` 產生）目前在這個帳戶的 Dashboard 上沒有 Observability／即時 log 可看（試過 Functions 分頁、Observability Events、Metrics，都是空的），排查 500 錯誤時沒辦法從 Dashboard 直接拿到 stack trace，只能靠通用症狀比對／查官方 issue，或改用 `wrangler pages deployment tail`（純讀取、不會動用戶端資料，需要另外跟使用者確認是否要用，因為專案規範原則上避免呼叫 wrangler）。
5. **（2026-08-06 Phase 2 發現）Next.js 會把 Server Component 裡的 `fetch()` 結果快取到 `.next/cache/fetch-cache`，連 `supabase-js` 底層發出的 fetch 也一樣，而且會跨開發伺服器重啟持續存在**。實際症狀：Supabase 資料表內容明明已經更新（例如把文章 `status` 改成 `published`），但 `/blog`、`/properties/[id]` 這類頁面重新整理甚至重開 `npm run dev` 都還是顯示舊資料。加了 `export const dynamic = 'force-dynamic'` 才會強制每次請求都重新查詢，不吃快取——**任何新增的、會查 Supabase 的 server-rendered 路由，`runtime = 'edge'` 之外一定要記得也加這一行**，不要假設 edge runtime 本身就代表資料一定即時。
6. **（2026-08-06 Phase 2 發現，已修正）沒有 `package-lock.json` 導致 build 隨機失敗**：本專案曾經刻意把 `package-lock.json` 加進 `.gitignore`（歷史上是為了繞開 Cloudflare 用 `npm ci` 時，舊的、沒同步更新的 lockfile 導致建置失敗的問題）。但沒有鎖定檔代表**每一次** `npm install`（本機或 Cloudflare）都是即時向 npm registry 重新解析整棵依賴樹；Phase 2 有一次 Cloudflare 建置在 `npm install` 這步就直接失敗，錯誤是 `No matching version found for @supabase/postgrest-js@2.112.2`——這是 `@supabase/supabase-js` 的間接依賴，當下這個版本號其實存在於 registry（`npm view` 查得到），研判是新版本剛發布、還沒完全同步到 Cloudflare 建置節點打到的 registry 副本，屬於暫時性問題，換一個時間點建置就會通過，但這種「隨機、跟程式碼無關」的失敗很難排查。已經改回**把 `package-lock.json` 從 `.gitignore` 移除並 commit 進 git**，讓本機與 Cloudflare 每次都裝一模一樣、已知能用的版本。**之後只要有改動任何 npm 套件版本（`package.json`），一定要在本機重新跑 `npm install` 讓 lockfile 同步更新，並把更新後的 `package-lock.json` 一起 commit**，否則 Cloudflare 那邊會用 `npm ci` 嚴格比對 lockfile 與 `package.json`，兩者不同步會直接建置失敗。
7. **（2026-08-06 Phase 4 發現）某些較複雜的 client component 嵌在 server component 裡時，`@cloudflare/next-on-pages` 的 edge SSR 不會把它算進伺服器端渲染出的初始 HTML，但 client-side hydration 之後又會正常掛載、正常運作**。實際案例：`components/LeadFormModal.jsx` 掛在 `app/properties/[id]/page.jsx`（server component）裡，本機 `npm run dev`（Node runtime）完全正常，但正式站 curl 抓到的初始 HTML 完全沒有這個元件的蹤影；用真正的瀏覽器打開、等 JS 執行完，按鈕跟彈窗都正常出現、可以正常送出表單。同一個頁面上結構簡單很多的 `FavoriteButton` 就沒有這個問題，兩者差異目前還沒有查出精確原因，研判跟這個轉譯器對 client reference 的處理有關（官方自己也已經不建議用這個轉譯器，改推薦 OpenNext）。**排查這類「本機正常、正式站看起來缺東西」的狀況時，不要只看 `curl` 抓到的原始 HTML 就下結論，一定要用真正的瀏覽器（等 hydration 跑完）再看一次**，很可能功能其實是正常的，只是 SSR 輸出不完整——對這種純 client-side 互動的元件（例如需要 JS 才能送出的表單）影響有限，但如果是需要被搜尋引擎讀到內容的元件就會是真正的問題，屆時要認真排查而不是照抄這裡的結論。

## 已知架構缺口與後續規劃

網站目前的完整升級藍圖（含競品功能研究、13 項目標對照、分階段計畫）記錄在對話歷史中的研究報告裡。進度：

- ✅ **Phase 0（2026-08-06）**：金鑰環境變數化、安全標頭、移除重複頁首、LINE 按鈕精簡、`npm audit` 排查。
- ✅ **Phase 1（2026-08-06）**：`page.jsx` 拆元件、`lib/properties.js` 共用資料層、`/properties/[id]` 物件獨立詳情頁（SSR + `RealEstateListing` JSON-LD + 動態 OG）、全站 `Organization` JSON-LD、`sitemap.js`／`robots.js`。首頁列表本身仍是 client-only（見上方「首頁資料流程」），但每筆物件已經有可被索引的獨立網址。
- ✅ **Phase 2（2026-08-06）**：`blog_posts` 資料表＋RLS、`lib/blog.js`、`/blog` 列表頁與 `/blog/[slug]` 內文頁（`BlogPosting` JSON-LD＋動態 OG）、`sitemap.js` 納入文章網址、`scripts/create-blog-draft.mjs` 草稿寫入腳本、發布流程見上方「部落格發布流程」一節。第一篇文章已上線驗證整條鏈路可行。
- ✅ **Phase 3（2026-08-06）**：`lib/clientStorage.js`（localStorage 訪客個人紀錄）、首頁「你看過的物件」／「只看收藏」、物件詳情頁收藏按鈕與「你可能也喜歡」相似物件推薦。細節見上方「架構重點」對應條目。
- ✅ **Phase 4（2026-08-06）**：`leads` 資料表＋RLS、`app/api/leads/route.js`、`LeadFormModal.jsx`（首頁浮動按鈕＋物件詳情頁）、GA4（`GoogleAnalytics.jsx` + 三個自訂事件）、Resend Email 通知。細節見上方「留名單與訪客追蹤流程」一節。順帶發現 `properties` 表 RLS 未啟用，記錄在「資安基本盤」待處理。
- ✅ **Phase 5（2026-08-07）**：n8n 物件資料抓取管線修復——原本是對來源網站列表頁做 regex 抓取、抓不到就假造 20 筆湊數，改成鎖定健美家(Kenbiya)大阪收益物件，抓真實詳情頁的標題／價格／利回り／地址／照片／文案，抓不到就跳過不硬湊。抓取／解析邏輯放在 n8n（因為 Cloudflare Workers 的 IP 會被來源網站的反爬蟲擋下，n8n 的 IP 不會），新增 `app/api/sync-properties/route.js` 只負責驗證＋寫入 Supabase。細節見上方「物件資料同步流程」一節。**待處理**：舊的 413 筆假資料還沒清掉，跟新資料並存顯示中。

每完成一個 Phase 都會回來更新本文件對應章節，不要假設這裡列的「⬜ 尚未開始」永遠正確——實作前先確認一下對應的檔案是否已經存在。

## 樣式

使用 Tailwind CSS，設定會掃描 `app/**` 與 `components/**`（見 `tailwind.config.js`）。目前沒有自訂 theme／設計系統，`page.jsx` 內幾乎全部直接使用行內 utility class。

## 路徑別名

`@/*` 對應到專案根目錄（見 `jsconfig.json`），例如可用 `@/components/YieldCalculator` 匯入元件。
