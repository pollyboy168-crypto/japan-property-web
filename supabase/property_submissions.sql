-- ================================================================
-- 屋主自行刊登出售的物件（待審核）
--
-- 為什麼要獨立一張表，而不是直接寫進 properties？
-- properties 是「已經上架、對外顯示」的資料，而屋主送出的內容是未經
-- 查證的公開投稿——價格、地址、產權狀況都可能有誤或造假。房地產是
-- 高金額交易，未經審核的物件直接上架會有實質的誤導風險，所以先進
-- 這張待審表，人工看過確認無誤，再轉進 properties。
--
-- RLS 沿用 leads 的模式：anon 只能新增，不能讀 / 改 / 刪。
-- 屋主留的電話、地址屬於個資，不開放 select 才不會被任何拿到 anon key
-- 的人整批撈走。要看名單只能從 Supabase Dashboard 或 Email 通知。
-- ================================================================

create table if not exists property_submissions (
  id uuid primary key default gen_random_uuid(),

  -- 屋主聯絡資訊
  owner_name    text not null,
  owner_contact text not null,   -- 電話或 LINE ID

  -- 物件資訊
  title         text not null,
  location      text not null,
  price_jpy     bigint,          -- 屋主開價（日圓）
  property_type text,            -- 一棟マンション / 透天 / 區分所有…
  size_sqm      numeric,         -- 建物面積（㎡）
  build_year    text,            -- 屋齡或建築年
  has_minpaku   boolean default false,  -- 是否已有民泊/旅館業執照
  note          text,            -- 屋主補充說明

  -- 審核流程
  status        text not null default 'pending'
                check (status in ('pending', 'approved', 'rejected')),
  review_note   text,            -- 內部審核備註
  published_id  text,            -- 審核通過後對應到 properties.id（OWNER-xxx）

  source_url    text,            -- 從哪一頁送出的
  created_at    timestamptz not null default now()
);

create index if not exists property_submissions_status_idx
  on property_submissions (status, created_at desc);

alter table property_submissions enable row level security;

-- anon 只能新增，不能讀 / 改 / 刪
drop policy if exists "anon can insert property submissions" on property_submissions;
create policy "anon can insert property submissions"
  on property_submissions for insert
  with check (true);
