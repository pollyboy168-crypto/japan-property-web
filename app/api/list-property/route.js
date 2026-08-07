import { getSupabaseClient } from '@/lib/supabase';

// Cloudflare Pages (@cloudflare/next-on-pages) 要求動態路由使用 edge runtime
export const runtime = 'edge';

// ----------------------------------------------------------------
// 🏠 屋主刊登出售
//
// 這支 API 只把屋主送出的內容寫進 property_submissions（待審核表），
// **不會直接寫進 properties、不會直接上架**。理由寫在
// supabase/property_submissions.sql：房地產金額高，未經查證的公開投稿
// 直接對外顯示會有實質誤導買家的風險，一定要人工看過再轉上架。
// ----------------------------------------------------------------

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

// 價格允許屋主用「萬日圓」或直接填日圓，兩種都收，統一換算成日圓整數。
// 填 12000（萬）跟填 120000000（日圓）是同一個意思，不要因為單位理解
// 不同就把屋主的物件價格記錯一萬倍。
function parsePriceToJPY(raw) {
  if (raw === undefined || raw === null || raw === '') return null;
  const n = Number(String(raw).replace(/[,\s]/g, ''));
  if (!Number.isFinite(n) || n <= 0) return null;
  // 一億日圓以下的數字，實務上不可能是「日圓」單位的大阪整棟物件開價，
  // 判定成「萬日圓」比較合理
  return n < 1000000 ? Math.round(n * 10000) : Math.round(n);
}

async function sendNotificationEmail(s) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.LEAD_NOTIFICATION_EMAIL;
  if (!apiKey || !to) {
    console.error('❌ 缺少 RESEND_API_KEY / LEAD_NOTIFICATION_EMAIL，略過寄信通知。');
    return;
  }

  const priceLine =
    s.price_jpy != null ? `${(s.price_jpy / 10000).toLocaleString()} 萬日圓` : '（未填）';

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Kazuhi 官網通知 <onboarding@resend.dev>',
        to: [to],
        subject: `【屋主刊登】${s.title}`,
        html: `
          <p><strong>有屋主要出售物件，請至 Supabase 後台審核。</strong></p>
          <p>屋主：${s.owner_name}（${s.owner_contact}）</p>
          <hr />
          <p>物件名稱：${s.title}</p>
          <p>地點：${s.location}</p>
          <p>開價：${priceLine}</p>
          <p>類型：${s.property_type || '（未填）'}</p>
          <p>面積：${s.size_sqm != null ? s.size_sqm + ' ㎡' : '（未填）'}</p>
          <p>建築年：${s.build_year || '（未填）'}</p>
          <p>民泊/旅館業執照：${s.has_minpaku ? '有' : '無或未說明'}</p>
          <p>補充說明：${s.note || '（無）'}</p>
          <p>送出頁面：${s.source_url || '（無）'}</p>
        `
      })
    });
    if (!res.ok) console.error('❌ Resend 寄信失敗:', res.status, await res.text());
  } catch (err) {
    // 寄信失敗不影響刊登本身是否成功，只記 log（跟 leads 同樣的取捨）
    console.error('❌ Resend 寄信發生例外:', err);
  }
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch (e) {
    return json({ error: '請求格式錯誤' }, 400);
  }

  const {
    ownerName,
    ownerContact,
    title,
    location,
    price,
    propertyType,
    sizeSqm,
    buildYear,
    hasMinpaku,
    note,
    sourceUrl,
    website
  } = body;

  // honeypot：人類看不到這個欄位，填了就是機器人 → 靜默回成功但不寫入
  if (website) return json({ ok: true });

  if (!ownerName || !ownerContact) return json({ error: '請填寫姓名與聯絡方式' }, 400);
  if (!title || !location) return json({ error: '請填寫物件名稱與地點' }, 400);

  const record = {
    owner_name: String(ownerName).slice(0, 100),
    owner_contact: String(ownerContact).slice(0, 100),
    title: String(title).slice(0, 200),
    location: String(location).slice(0, 200),
    price_jpy: parsePriceToJPY(price),
    property_type: propertyType ? String(propertyType).slice(0, 60) : null,
    size_sqm: sizeSqm ? Number(String(sizeSqm).replace(/[,\s]/g, '')) || null : null,
    build_year: buildYear ? String(buildYear).slice(0, 40) : null,
    has_minpaku: Boolean(hasMinpaku),
    note: note ? String(note).slice(0, 2000) : null,
    source_url: sourceUrl || null
  };

  const supabase = getSupabaseClient();
  const { error } = await supabase.from('property_submissions').insert(record);

  if (error) {
    // property_submissions 這張表要手動跑 SQL 建立（見 supabase/property_submissions.sql）。
    // 表還沒建好時不要讓屋主看到「送出失敗」——他不會再送第二次，我們就永久
    // 失去這個賣方。改成降級寫進 leads（那張表一定存在），把物件資料塞進
    // message 欄位，業務端一樣收得到 Email 通知，一筆都不會漏。
    console.error('❌ 寫入 property_submissions 失敗，改寫入 leads:', error);

    const summary = [
      `【屋主刊登】${record.title}`,
      `地點：${record.location}`,
      `開價：${record.price_jpy != null ? (record.price_jpy / 10000).toLocaleString() + ' 萬日圓' : '未填'}`,
      `類型：${record.property_type || '未填'}`,
      `面積：${record.size_sqm != null ? record.size_sqm + ' ㎡' : '未填'}`,
      `建築年：${record.build_year || '未填'}`,
      `民泊執照：${record.has_minpaku ? '有' : '無或未說明'}`,
      `補充：${record.note || '無'}`
    ].join('\n');

    const { error: leadErr } = await supabase.from('leads').insert({
      name: record.owner_name,
      contact: record.owner_contact,
      message: summary,
      property_id: 'OWNER-SUBMISSION',
      property_title: record.title,
      source_url: record.source_url
    });

    if (leadErr) {
      console.error('❌ 降級寫入 leads 也失敗:', leadErr);
      return json({ error: '送出失敗，請稍後再試或直接透過 LINE 聯絡我們' }, 500);
    }
  }

  await sendNotificationEmail(record);

  return json({ ok: true });
}
