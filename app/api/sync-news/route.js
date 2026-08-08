// Cloudflare Pages (@cloudflare/next-on-pages) 要求動態路由使用 edge runtime
export const runtime = 'edge';

// ----------------------------------------------------------------
// 📰 新聞同步 API：接收 n8n 抓好並整理過的新聞資料，驗證後 upsert 進
// Supabase news_posts 表。架構跟 sync-properties 一樣——抓取／解析
// RSS 的工作放在 n8n 端執行，這支 API 只負責「驗證＋寫入」，不對外
// （Google News 等）發任何請求，理由同 sync-properties：Cloudflare
// Workers 的對外 IP 曾經被來源網站的反爬蟲機制擋下，n8n Cloud 沒有
// 這個問題。
//
// 版權考量：這裡只接受「標題＋我們自己寫的簡短引言＋來源連結」，
// 不接受整篇轉載的新聞內容（isValidRecord 限制 summary_zh 長度），
// 避免版權爭議——這是新聞聚合/摘要的常見合理使用範圍，不是重新發布
// 完整文章。
// ----------------------------------------------------------------

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

function isValidRecord(r) {
  return (
    r &&
    typeof r.slug === 'string' &&
    r.slug.length > 0 &&
    typeof r.title === 'string' &&
    r.title.length > 0 &&
    typeof r.summary_zh === 'string' &&
    r.summary_zh.length > 0 &&
    r.summary_zh.length <= 500 &&
    typeof r.source_name === 'string' &&
    typeof r.source_url === 'string' &&
    r.source_url.startsWith('http')
  );
}

async function upsertNews(records) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error('缺少 NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }

  // ⚠️ 不要用 upsert（Prefer: resolution=merge-duplicates），改成「先查後插」。
  //
  // 踩過的兩層坑：
  //  1. news_posts 的主鍵是 id（uuid，每次都新的）、唯一鍵是 slug。PostgREST 的
  //     upsert 預設以主鍵為衝突目標，所以會當成全新資料 INSERT 再撞 slug 的
  //     unique constraint → 409 duplicate key。
  //  2. 加上 on_conflict=slug 之後變成 401 / 42501 權限不足——upsert 需要 UPDATE
  //     權限，而 news_posts 的 RLS 只有 INSERT + SELECT，沒有 UPDATE policy。
  //
  // 與其為了 upsert 去放寬 anon 的寫入權限，不如先用（本來就允許的）SELECT
  // 查出已存在的 slug，只 INSERT 沒看過的。新聞本來就是「發布後不會再改」的
  // 資料，不需要更新語意，這樣做同時維持了最小權限。
  const slugs = records.map((r) => r.slug);
  const existing = new Set();
  // in.(...) 的網址長度有限，分批查
  for (let i = 0; i < slugs.length; i += 50) {
    const chunk = slugs.slice(i, i + 50).map((s) => `"${s.replace(/"/g, '')}"`).join(',');
    const q = await fetch(`${url}/rest/v1/news_posts?select=slug&slug=in.(${encodeURIComponent(chunk)})`, {
      headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` }
    });
    if (q.ok) {
      const rows = await q.json();
      for (const row of rows) existing.add(row.slug);
    }
  }

  const fresh = records.filter((r) => !existing.has(r.slug));
  if (fresh.length === 0) return { inserted: 0, skipped: records.length };

  const res = await fetch(`${url}/rest/v1/news_posts`, {
    method: 'POST',
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal'
    },
    body: JSON.stringify(
      fresh.map((r) => ({
        slug: r.slug,
        title: r.title,
        summary_zh: r.summary_zh,
        source_name: r.source_name,
        source_url: r.source_url,
        category: r.category || null,
        image_url: r.image_url || null,
        published_at: r.published_at || new Date().toISOString()
      }))
    )
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase 寫入失敗 (${res.status}): ${text}`);
  }

  return { inserted: fresh.length, skipped: records.length - fresh.length };
}

function isAuthorized(request) {
  const secret = process.env.SYNC_SECRET;
  if (!secret) return false;
  const auth = request.headers.get('authorization') || '';
  return auth === `Bearer ${secret}`;
}

export async function POST(request) {
  if (!isAuthorized(request)) {
    return json({ error: 'Unauthorized' }, 401);
  }

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return json({ error: '請求格式錯誤，需要 JSON body' }, 400);
  }

  const incoming = Array.isArray(body?.records) ? body.records : null;
  if (!incoming) {
    return json({ error: '缺少 records 陣列' }, 400);
  }

  const valid = incoming.filter(isValidRecord);
  const invalid = incoming.length - valid.length;

  try {
    let result = { inserted: 0, skipped: 0 };
    if (valid.length > 0) {
      result = await upsertNews(valid);
    }
    return json({
      ok: true,
      received: incoming.length,
      inserted: result.inserted,
      duplicates: result.skipped,
      invalid
    });
  } catch (err) {
    console.error('❌ 新聞同步失敗:', err);
    return json({ error: String(err) }, 500);
  }
}
