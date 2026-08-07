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

**（2026-08-07 使用者指示）要選就選「本機這台電腦」的 Chrome**：如果出現多個已連線瀏覽器可選，一律優先選使用者目前正在用的這台本機電腦上的 Chrome，不要選到其他裝置上的實例。

**Chrome 連線中斷是常見狀況，重試就好**：工具回報「Claude in Chrome is not connected」時，多半是 Chrome service worker 休眠之類的暫時性問題。先重試幾次；如果連續失敗，可以先去做其他不需要瀏覽器的工作（例如改程式碼、跑 build、commit），不要卡在原地空等，也不要因此就把需要瀏覽器的工作丟回去要使用者自己做。

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
- **舊假資料已清除（2026-08-07）**：資料庫裡原本有 3 批舊假資料——`PROP-{n}-{nnn}`（400 筆）、`JP-OSAKA-001~010`（10 筆）、`KENBIYA-{純數字}`（3 筆，注意這批的 id 前綴跟新的真實資料撞了，但內容是 2026-08-04 寫入的舊假資料，`image_url`／`description_zh` 都是 `null`，標題是通用模板文字）——都已經過使用者確認後用 Supabase REST API 的 `DELETE` 整批刪除。目前 `properties` 表只剩下透過新管線寫入的真實 Kenbiya 物件（2026-08-07 清理當下是 17 筆）。**之後如果又在表裡看到 `image_url` 或 `description_zh` 是 `null`、標題像「大阪熱門投資物業」這種通用模板文字的資料列，大概率又是某個舊流程殘留的假資料，不是新管線寫的。**

## Phase 6（2026-08-07）：新聞行銷、旗艦案例、定價策略、搜尋與 UX 優化

使用者在同一天內分批送出這批需求（新聞區塊＋SEO／黃金案例／定價公式／擴大 n8n 涵蓋範圍／搜尋篩選／收藏購物車／行動裝置分頁），並明確指示「自動允許所有的問題，不要中斷」。以下記錄每項功能的實際落地方式：

### 定價公式：市場行情價 vs 超值破盤價

`lib/properties.js` 的 `normalizeProperty()` 現在同時輸出兩個價格：`priceJPY`（原始 `price_jpy` × 1.3，維持 Phase 1 就有的「超值破盤價／預售總價」，也就是實際掛牌售價，多出原價 30% 是公司利潤）與新增的 `marketPriceJPY`（原始 `price_jpy` × 1.5，「市場行情價」，作為劃線對比的參考價）。`PropertyCard`、物件詳情頁、`FlagshipShowcase` 都改成同時顯示「市場行情價（劃線）」＋「超值破盤價（強調）」。**這兩個數字都是公式推算，不是真實市場調查或第三方估價**——`marketPriceJPY` 純粹是「原價 ×1.5」，是使用者要求的定價策略（reference/anchor pricing，零售業常見手法），不是真實可查證的市場行情。之後如果要改成真實市調數據，要另外接資料源，不能假設現有數字有任何調查依據。`formatPropertyPrice()`（`lib/constants.js`）同時修正成 `Math.round()` 到整數萬日圓再格式化，避免像 92,307,692 這種除不盡的原價出現「¥13,846.154 萬日圓」這種帶小數的顯示。

### 旗艦民宿黃金案例（Shinsai Wings）

原始版本（`git show f7f353b:app/page.jsx`）有寫死的「心齋橋圈 5層獨棟特區民泊 (Shinsai Wings)」旗艦物件展示區塊與「一站式改建與營運成功案例」3步驟說明，後來全站改成 Supabase 動態資料後這個區塊連同資料一起消失了。復原方式：
- 在 Supabase `properties` 表手動插入一筆 `id = 'prop-shinsai-wings'` 的真實資料列，`price_jpy` 刻意設成 `92307692`（讓 ×1.3 後精確等於原始文案的「1.2億日圓」開價，×1.5 後變成「約1.38億」的市場行情價參考）。圖片目前還是沿用原版就有的 Unsplash 佔位圖（`photo-1503387762-...`），**不是真實的 Shinsai Wings 實景照，之後有真實照片要記得換掉 `image_url`／`images`**。
- `lib/properties.js` 的 `normalizeProperty()` 本來就有 `isFlagship: propId === 'prop-shinsai-wings'` 這個 hardcode 判斷（沒被刪過），只是原本沒有對應資料列、也沒有專門的展示元件，等於是個沒接上的孤兒邏輯。
- 新增 `components/FlagshipShowcase.jsx`（從 `properties` 陣列裡 `find` 這筆特定 id，找不到就整個不渲染）與 `components/RenovationCaseStudy.jsx`（純靜態行銷文案，跟 Supabase 無關），文案內容照抄原始版本，只把「和佑工程團隊」等舊稱呼統一成現在的「株式会社和日」。兩個元件都掛在 `app/page.jsx`，`FlagshipShowcase` 在 `WhyOsaka` 之後、試算器之前；`SiteHeader` 原本就有一個指向 `#flagship` 的導覽連結（一直都在，只是之前連到空區塊），現在終於接上。
- `PropertyCard` 與 `lib/properties.js` 的 `tags` 陣列都加了 `isFlagship` 的特殊視覺處理（琥珀色外框／「👑 直營旗艦標的」標籤），讓它在一般物件牆裡也會特別顯眼。

### 熱門新聞區塊（SEO 導流）

**目的**：使用者想要透過大阪房產／民泊／觀光／萬博相關新聞，讓官網被 Google 收錄到更多長尾關鍵字、爭取新聞標題帶來的自然搜尋流量。

- **⚠️ RLS 小陷阱**：`news_posts` 的 RLS 只開了 `insert` 跟 `select` policy，**沒有 `delete` policy**。用 anon key 對這張表下 `DELETE`（例如透過 PostgREST／`supabase-js`）會回傳 `204 No Content`（看起來像成功），但實際上 0 筆資料被刪除——PostgREST 在沒有對應 policy 時就是「安靜地刪除 0 筆」，不會報錯，很容易誤以為刪除成功。**真的要清資料要用 Supabase SQL Editor（postgres role，不受 RLS 限制）**，不要用 anon key 的 DELETE 請求。
- **`news_posts` 資料表**（2026-08-07 由 Claude 透過 Claude in Chrome 在 Supabase SQL Editor 建立，用 `window.monaco.editor.getModels()[0].setValue(sql)` 直接寫入 SQL 字串繞過編輯器的自動補全括號問題——SQL Editor 用的是 Monaco，跟 n8n 的 CodeMirror 不同，`setValue()` 這招只對 Monaco 有效）：欄位 `id`／`slug`(unique)／`title`／`summary_zh`／`source_name`／`source_url`／`category`／`image_url`／`published_at`／`created_at`。RLS 允許 anon **insert 和 select 都開放**（`with check (true)` / `using (true)`）——跟 `blog_posts`／`leads` 不同，新聞是「每天自動蒐集、自動公開」的設計，沒有草稿/發布審核流程，因為新聞本身就是公開的聚合資訊，不像部落格文章代表公司自己的專業論述需要人工把關。
- **版權設計**：只存「真實標題（事實/標題本身不受著作權保護）＋我們自己寫的一句話中文引言＋來源名稱＋來源連結」，**完全不轉載原始新聞內文**。`summary_zh` 的樣板是 `【日本新聞】{原文日文標題}（來源：{來源名稱}）。此為原文標題，完整內容請點擊下方連結閱讀原文。`——這是新聞聚合／摘要常見的合理使用範圍（跟 Google News、Feedly 這類新聞聚合服務的呈現方式一致：標題＋短摘要＋連回原站），不是重新發布完整文章。`app/api/sync-news/route.js` 的 `isValidRecord()` 也用 `summary_zh.length <= 500` 做一層防呆，避免不小心整段貼上完整內文。
- **抓取來源：Google News RSS 搜尋**（`https://news.google.com/rss/search?q={query}&hl=ja&gl=JP&ceid=JP:ja`）——不需要 API 金鑰、公開端點、回傳標準 RSS XML，比逐一嘗試找日本房產新聞網站的 RSS／驗證能不能抓穩定得多。目前設定 4 組查詢：`大阪 不動産`／`大阪 民泊`／`大阪 観光`／`関西万博 夢洲`，各自標上對應的 `category`。`<link>` 欄位是 Google 的轉址連結（不是出版社原始網址），但點擊後會正常導到原文，這是 Google News RSS 的標準行為，直接拿來當 `source_url` 使用沒有問題。
- **架構跟 Phase 5 的 `sync-properties` 完全對稱**：`app/api/sync-news/route.js` 只負責驗證＋upsert 進 Supabase，不對 Google News 發任何請求；抓取＋解析 RSS XML（regex-based，`<item>...</item>` 區塊配對）全部在 n8n 的 Code 節點執行，原因跟 Phase 5 一樣是繞開 Cloudflare Workers 對外 IP 可能被擋的風險（雖然還沒實測 Google News 是否真的會擋 Cloudflare IP，但既然架構模式已經驗證有效，直接沿用）。
- **n8n workflow「02_大阪熱門新聞每日蒐集」**（新建的獨立 workflow，不是塞進物件那個 workflow 裡）：`Schedule Trigger`（每日 7am）→ `Code in JavaScript`（依序打 4 組 RSS 查詢、regex 解析、依 `guid` 去重、標題去掉 Google News 附加的「 - 來源名稱」尾綴、最多取前 15 筆）→ `HTTP Request`（`POST` 到 `/api/sync-news`，帶 `Authorization: Bearer <SYNC_SECRET>`，body 用 expression `{{ $json.records }}`）。**修改完也要記得按 Publish**，這個 workflow 目前的發布狀態要在完成本輪部署後手動確認。
- **`lib/news.js`**：`getLatestNews(limit)`（首頁摘要區塊跟 `/news` 列表頁共用，只是 limit 不同）、`getNewsBySlug(slug)`。
- **`app/news/page.jsx`／`app/news/[slug]/page.jsx`**：架構完全比照 `/blog`（`runtime = 'edge'` + `dynamic = 'force-dynamic'`、`generateMetadata()`、`NewsArticle` JSON-LD），差異是詳情頁不渲染長文，只有摘要 + 一顆「📰 閱讀原文（來源）→」外部連結按鈕。`components/NewsRail.jsx` 是首頁用的精簡版摘要牆（最多顯示 6 則，沒有新聞資料時整個區塊不渲染）。`SiteHeader` 加了 `/news` 導覽連結，`app/sitemap.js` 納入所有新聞網址。

### 物件搜尋／篩選功能

`components/PropertyFilterBar.jsx`：關鍵字（比對標題／地點）、區域（用 regex `/大阪[府市]?([^\d]{2,6}[市区町村])/` 從物件的 `location` 字串動態擷取出現過的市/區清單，不是寫死的選項）、總價上限（幾組固定級距）。三個條件都在 `app/page.jsx` 用 `useMemo` 對已經抓好的 `properties` 陣列做前端篩選，沒有另外打 Supabase 查詢（資料量只有幾百筆，前端篩選成本很低，跟既有的收藏篩選邏輯一致）。

### 收藏清單購物車化

`components/FavoritesCartWidget.jsx`：右下角浮動按鈕（`bottom-44`，刻意疊在 `LineFab`／`LeadFormModal` 浮動按鈕上方，避免三顆浮動按鈕互相重疊），有收藏才會顯示，紅色圓形徽章顯示收藏數量，點擊從右側滑出清單面板（圖片＋標題＋價格＋移除按鈕），是原本 `PropertyGrid` 頂部「只看收藏」篩選鈕之外的第二個入口——篩選鈕是「留在物件牆上只看收藏的」，這個是「隨時彈出來看清單、不用捲到物件牆」，兩者互補共存，不是取代關係。

### 行動裝置分頁：頁碼分頁 → 載入更多

`components/PropertyGrid.jsx` 移除了原本的頁碼分頁（`currentPage`／`totalPages`／上下兩組頁碼按鈕），改成「載入更多物件」按鈕（`app/page.jsx` 用 `visibleCount` state，每次點擊 `+ITEMS_PER_BATCH`，`ITEMS_PER_BATCH = 12`）。原因是窄螢幕下頁碼分頁換頁後新內容在畫面外，使用者感覺不到「換頁了」；「載入更多」是購物網站商品牆常見模式，新卡片直接接在後面出現，捲動軌跡連續、不會有「消失重來」的錯覺。篩選條件（關鍵字／區域／價格）改變時會重置 `visibleCount` 回到初始值。

### Phase 6.1（2026-08-07 稍晚）：UX 微調、新聞改台灣媒體、物件抓取輪替

- **收藏入口統一**：`FavoritesCartWidget` 圖示從 🛒 改成 ❤️、配色從紅色改成金色系（使用者反映紅色太刺眼，金色也跟旗艦物業的高級調性一致）。`PropertyGrid` 的「只看收藏」切換鈕整個移除，收藏檢視只保留右下角浮動愛心這一個入口，避免同一功能兩個入口造成混淆。
- **首頁區塊順序**：新聞區塊從物件牆「之前」移到「之後」（`RenovationCaseStudy` 後面），因為訪客進站主要目的是看房子，新聞是加值內容不該擋在前面。
- **旗艦區塊配色**：`FlagshipShowcase` 背景從 `bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-900` 改成純 `bg-slate-900`——原本的琥珀色漸層在部分區域讓白色文字對比度不足、難以閱讀。保留金色邊框與金色價格文字，維持高級感但不犧牲可讀性。
- **新聞來源改台灣媒體**：`02_大阪熱門新聞每日蒐集` 的 Google News RSS 參數從 `hl=ja&gl=JP&ceid=JP:ja` 改成 `hl=zh-TW&gl=TW&ceid=TW:zh-Hant`，查詢關鍵字也全部改成繁體中文（大阪 房地產／民宿／旅遊／投資／關西萬博）。額外加一組 `大阪 房地產 site:youtube.com` 查詢抓影片內容。**影片偵測**：`<source url>` 含 `youtube.com` 或來源名稱是 `YouTube` 就標成 `category: '影片'`，前台列表與詳情頁對這類項目顯示 `▶️ 影片` 紅色標籤、按鈕文案改成「觀看完整影片」。**注意**：Google News RSS 的 `<link>` 是 Google 的轉址網址，不是 YouTube 原始網址，所以拿不到 video ID，無法做 iframe 內嵌播放，只能連出去；要真的內嵌播放得改接 YouTube Data API（需要 API key），目前先不做。
- **出站連結加 UTM**：`/news/[slug]` 的「閱讀原文／觀看影片」按鈕會在來源網址上補 `utm_source=japan.her-yow.com&utm_medium=referral&utm_campaign=kazuhi_news`，讓對方站台的分析工具認得出流量來自本站（使用者要求的「讓 Google 識別得出是我們的網站」）。
- **物件抓取改「每日輪替」而非一次抓完**：使用者希望物件數衝到 500 筆。實測發現**一次打太多請求一定會被健美家的 rate limit 擋掉**（35 個列表頁用 `Promise.all` 平行打 → 全部 429 → 回傳 0 筆）。改成 `CITY_GROUPS` 七組城市清單（涵蓋大阪市 1-10 頁、堺市、東大阪、豐中、吹田、枚方、高槻、八尾、茨木、寢屋川），用 `new Date().getDate() % 7` 每天輪一組，`MAX_LISTINGS = 40`、詳情頁 `BATCH = 5`，列表頁改成每次只平行抓 2 頁、批次之間 `sleep(700)`。**這代表 500 筆不是單次跑得到的，是靠每日排程慢慢累積**（upsert 用 `merge-duplicates`，同一物件重複抓不會變成多筆）。要更快只能降低節流強度，但那會直接觸發 429 反而一筆都拿不到——這是來源網站的硬限制，不是程式寫法問題。

### ⚠️ 待處理（Phase 6 範圍內尚未完成）

- **n8n 抓取涵蓋範圍擴大**：使用者原始需求是「搜尋日本房產熱門前100名網站、每個網站每個大阪分區挑5個熱門物件、累積到1000筆、去重、清除已下架物件」。實測過這條路線不可行——10 個來源裡只有健美家一個能穩定抓到真實資料（見上方 Phase 5 段落），逐一驗證 100 個未知網站在合理時間內做不到，且大部分會被反爬蟲擋下或需要 JS 渲染。**目前還沒有把 Kenbiya 抓取範圍擴大到更多大阪城市/分區**（現在只有 `osaka-shi` 前兩頁＋`sakai-shi` 第一頁），也還沒實作「去重」（`Prefer: resolution=merge-duplicates` 只處理同一次同步內的 upsert，不是主動比對整個資料庫）與「清除已下架物件」（比對本次抓到的 id 清單、刪除資料庫裡不在清單中的舊物件）的邏輯。之後如果要繼續，方向是擴大 `LISTING_PAGES` 陣列涵蓋更多大阪城市（大阪市其他區、東大阪、豐中、吹田等），並在 `app/api/sync-properties/route.js` 加一段「本次同步收到的 id 清單之外、且 id 是 `KENBIYA-` 開頭的舊物件視為已下架，予以刪除」的邏輯。
- **旗艦物件真實照片**：`prop-shinsai-wings` 目前用的還是 Unsplash 佔位圖，不是真實的 Shinsai Wings 實景照片，需要使用者提供真實照片後手動更新 Supabase 該筆資料的 `image_url`／`images`。

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

- ✅ **Phase 6.2（2026-08-07）**：SEO 關鍵字工程、日文內容翻譯、YouTube 站內嵌入播放。細節見下方三節。

每完成一個 Phase 都會回來更新本文件對應章節，不要假設這裡列的「⬜ 尚未開始」永遠正確——實作前先確認一下對應的檔案是否已經存在。

## SEO 關鍵字（`lib/seoKeywords.js`，2026-08-07 Phase 6.2）

台灣買家會搜尋的 100 組關鍵字，分成 10 類各 10 組（通用／大阪在地／民泊／投報／法規稅務／世博 IR 題材／物件型態／行政區／比較型／意圖型），另外導出：

- `PRIMARY_KEYWORDS`：10 組核心字，只有這組會進 `app/layout.jsx` 的 `metadata.keywords`。
- `FAQ_ITEMS`：8 組有實際資訊量的問答，同時被 `components/FaqSection.jsx` 渲染成畫面上的常見問題，以及 `app/layout.jsx` 的 `FAQPage` JSON-LD。

**這個檔案不是拿來做關鍵字堆砌的**。100 組字的用途是「決定我們該寫哪些內容、頁面標題怎麼下」，Google 從 2010 年代就會懲罰把關鍵字硬塞進頁面的做法，`metadata.keywords` 本身現代搜尋引擎也早就不採信了。真正有效的是 FAQ 這種對應長尾問句、答案有內容的區塊——所以 `FAQ_ITEMS` 的答案請維持是真的能回答問題的文字，不要為了塞字改爛它。

## 物件日文內容翻譯（2026-08-07 Phase 6.2）

健美家來源的標題與說明都是日文原文，對台灣買家可讀性很差。翻譯分兩條路線，寫在 `lib/jpGlossary.js` 與 `app/api/translate-properties/route.js`：

- **標題走查表（`jpToZh()`），不走機器翻譯**。Google 翻譯在健美家那種「術語＋價格數字」的短標題上錯得很難看，實測踩過：`45290万円` → 「4,529 億天」（價格被改掉，這是會誤導買家的錯誤）、`健美家` → 「Kenbi-ya」、`満想5.28％` → 「滿意度5.28%」。查表的結果可預測、數字絕對不會被動到。只有查完仍有假名殘留（多半是大樓專名，例如「ラフォーレ」）才退回機器翻譯。
- **說明走機器翻譯**，長篇自由文章查表撐不住，但譯完會再過一次同一份查表校正術語。
- 查表順序**一定要長詞優先**（`lib/jpGlossary.js` 會自動依長度排序）。否則「築」會先把「新築／年築」吃掉，`1997年築` 變成 `1997年年建`。
- 已翻譯的資料列用 `description_zh` 開頭的 `［繁中翻譯］` 標記，避免重複翻譯；標題保留 `【健美家】` 來源前綴，翻譯前要先剝掉、翻完再補回去。

## 新聞與 YouTube 影片（2026-08-07 Phase 6.2 改版）

n8n workflow `02_大阪熱門新聞每日蒐集`（id `AOLHRFIe7fBhCOQj`）的 Code 節點負責抓取＋整理，下游 HTTP Request 節點才 POST 到 `/api/sync-news`（Code 節點最後回 `[{json:{records}}]`，**不要在 Code 節點裡自己 POST，會變成送兩次**）。

- **圖文新聞**：Google 新聞 RSS 台灣版（`hl=zh-TW&gl=TW&ceid=TW:zh-Hant`），依查詢分類成 不動產／民泊／投資／觀光旅遊。
- **影片：直接查 YouTube 搜尋頁，不走 Google 新聞 RSS，也不需要 YouTube Data API 金鑰。** Google 新聞 RSS 的 `<link>` 是 `news.google.com/rss/articles/CBM...` 轉址網址，真正的目的地藏在 JS 後面（實測抓 HTML 完全解不出目標網址），拿不到影片 ID 就沒辦法嵌入播放。改成抓 `youtube.com/results?search_query=...&sp=EgQIBRAB&hl=zh-TW&gl=TW`，從 HTML 裡的 `var ytInitialData = {...}` 遞迴撈出所有 `videoRenderer`，取得真正的 `videoId`，存成 `https://www.youtube.com/watch?v=<id>`。
- 影片的 slug 一律是 `yt-<videoId>`，同一支影片在不同查詢重複出現會自然收斂成同一筆，標題改了也不會變成新的一筆。
- 前端 `app/news/[slug]/page.jsx` 的 `getYouTubeId()` 從 `source_url` 取出影片 ID，有就用 `youtube-nocookie.com` 嵌 iframe 播放（順帶把 JSON-LD 從 `NewsArticle` 換成 `VideoObject`，爭取 Google 的影片搜尋版位），取不到就退回「觀看完整影片」外連按鈕——**舊資料是轉址網址，本來就嵌不了，這個 fallback 不是 bug**。
- 嵌入 iframe 需要 CSP 的 `frame-src`，已在 `public/_headers` 加 `https://www.youtube-nocookie.com`／`https://www.youtube.com`。
- 日文原文新聞用「標題含假名」判斷擋掉（繁體中文不會有假名），在 n8n 抓取端就先過濾，不要等進了資料庫才處理。

### ⚠️ `news_posts` 舊日文資料還沒清掉

資料庫裡還有 15 筆 `summary_zh` 開頭是 `【日本新聞】` 的舊日文新聞。`lib/news.js` 有應用層過濾，網站上**看不到**這 15 筆，但資料還在。`news_posts` 的 RLS **沒有 DELETE policy**，anon key 刪不動（PostgREST 會回 204 但實際刪 0 筆，看起來成功其實沒刪），要清必須到 Supabase SQL Editor 用 postgres role 執行：

```sql
delete from news_posts where summary_zh like '【日本新聞】%';
```

## n8n 排程與方案限制（2026-08-07）

- Schedule Trigger 的 timezone 設在 workflow settings，兩條都是 `Asia/Taipei`。原本是空的 `interval: [{}]`，那在 n8n 代表「每小時」，會白白燒掉執行額度。
- `02_大阪熱門新聞每日蒐集`：**每天 10:00**。
- `01_大阪房產物件`：**衝量期間暫時改成每 30 分鐘**，補滿 1000 筆後要改回每天 10:00（見下一節）。
- **n8n Cloud 目前是試用方案**（2026-08-07 當下顯示剩 12 天、1000 次執行額度）。試用到期後排程會停掉，物件與新聞就不會再更新——到期前要提醒使用者決定是否付費升級。
- n8n Cloud 的 `/rest/*` API 連續呼叫幾次之後會整個沒有回應（fetch 一直 pending、不 reject 也不 timeout），改動 workflow 時要有心理準備，等幾分鐘再試通常會恢復。

## ⚠️ 物件抓取的輪替索引：一定要「每次執行都前進」

`01_大阪房產物件` 的 Code 節點原本用

```js
const GROUP_INDEX = new Date().getDate() % CITY_GROUPS.length; // ❌ 依當月第幾天輪替
```

一天只跑一次時沒問題，但**只要把排程改密（例如每 30 分鐘），一整天 48 次執行就會全部落在同一組地區、重複抓同一批物件**，upsert 回去還是那幾筆，物件總數完全不會成長——症狀是「排程明明變快了，物件數卻卡住不動」。已改成：

```js
const SLOT = Math.floor(Date.now() / (30 * 60 * 1000)); // 每 30 分鐘前進一格
const start = (SLOT * SEG_PER_RUN) % SEGMENTS.length;
```

**以後要調整抓取頻率，先確認輪替索引的前進單位跟排程間隔一致，不要只改排程。**

### 健美家可抓量與解析重點（2026-08-07 實測）

- 大阪共 **54 個地區分頁**（大阪市 24 區＋堺市各區＋府內各市），合計約 **1184 筆不重複物件**，所以 1000 筆目標可達成。部分分頁剛好 50 筆，代表分頁後面還有更多。
- 詳情頁解析成功率 35/36；一次跑 4 個地區分頁、抓 90 筆詳情約 23 秒，離 n8n 的 60 秒逾時很寬裕。
- 解析時踩過的坑：
  - **價格拆在多層 span 裡**（`<span>6,580</span>万円`），去標籤後數字與單位之間會多出空白，`([\d.]+)万` 會對不上——換算前一定要先 `replace(/[\s,]/g, '')`。
  - **欄位標籤是「住所」不是「所在地」**；「所在地」只出現在頁面下方的用語說明區。
  - 同一頁下方那份用語說明也用 `<dt>/<dd>` 結構，值是「…を表示。」這種說明文，取值時要濾掉。
  - **沒有獨立的「物件種別」欄位**，型態寫在 h1 標題尾巴（例：「大阪市生野区 一棟マンション」）。
  - 物件照片路徑是 `/upload/p<群組>/<物件編號>/…`，是相對路徑要自己補網域；`/upload/column_list_image/` 是站上文章縮圖，不要收進來。
- 抓取節奏刻意保守（每批 5 個並行、間隔 800ms）。之前用 35 個並行請求打過去，整批被 429，冷卻很久。
- Code 節點開頭會先讀一次 Supabase 現有的 id，**達到 1000 筆就整個跳過不抓**。這是保險：就算忘了把排程改回一天一次，它也只會空轉而不會一直打健美家。

## 樣式

使用 Tailwind CSS，設定會掃描 `app/**` 與 `components/**`（見 `tailwind.config.js`）。目前沒有自訂 theme／設計系統，`page.jsx` 內幾乎全部直接使用行內 utility class。

## 路徑別名

`@/*` 對應到專案根目錄（見 `jsconfig.json`），例如可用 `@/components/YieldCalculator` 匯入元件。
