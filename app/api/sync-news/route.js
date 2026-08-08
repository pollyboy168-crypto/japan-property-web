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

  // ⚠️ 一定要指定 on_conflict=slug。
  // news_posts 的主鍵是 id（uuid，每次都是新的），唯一鍵是 slug。PostgREST 的
  // upsert 預設以「主鍵」為衝突目標，所以它會當成全新資料 INSERT，然後撞到
  // slug 的 unique constraint 回 409 duplicate key。
  // 這個 bug 潛伏很久沒被發現，因為早期每次抓到的都是新文章、slug 不重複；
  // 直到每天定時重抓、同一篇文章第二次出現才爆出來。
  const res = await fetch(`${url}/rest/v1/news_posts?on_conflict=slug`, {
    method: 'POST',
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates'
    },
    body: JSON.stringify(
      records.map((r) => ({
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
    throw new Error(`Supabase upsert 失敗 (${res.status}): ${text}`);
  }
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
    if (valid.length > 0) {
      await upsertNews(valid);
    }
    return json({ ok: true, received: incoming.length, upserted: valid.length, skipped: invalid });
  } catch (err) {
    console.error('❌ 新聞同步失敗:', err);
    return json({ error: String(err) }, 500);
  }
}
