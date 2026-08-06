import { getSupabaseClient } from '@/lib/supabase';

// Cloudflare Pages (@cloudflare/next-on-pages) 要求動態路由使用 edge runtime
export const runtime = 'edge';

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

async function sendNotificationEmail(lead) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.LEAD_NOTIFICATION_EMAIL;
  if (!apiKey || !to) {
    console.error('❌ 缺少 RESEND_API_KEY / LEAD_NOTIFICATION_EMAIL，略過寄信通知。');
    return;
  }

  const propertyLine = lead.property_title
    ? `<p>詢問物件：${lead.property_title}（${lead.property_id}）</p>`
    : '';

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Kazuhi 官網通知 <onboarding@resend.dev>',
        to: [to],
        subject: `【官網留名單】${lead.name}`,
        html: `
          <p>官網有新的留名單：</p>
          <p>姓名：${lead.name}</p>
          <p>聯絡方式：${lead.contact}</p>
          ${propertyLine}
          <p>留言：${lead.message || '（無）'}</p>
          <p>來源網址：${lead.source_url || '（無）'}</p>
        `
      })
    });

    if (!res.ok) {
      console.error('❌ Resend 寄信失敗:', res.status, await res.text());
    }
  } catch (err) {
    // Email 寄送失敗不影響留名單本身是否成功，只記 log
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

  const { name, contact, message, propertyId, propertyTitle, sourceUrl, website } = body;

  // honeypot：這個欄位人類看不到也不會填，機器人才會填 → 靜默略過，不寫入也不報錯
  if (website) {
    return json({ ok: true });
  }

  if (!name || !contact) {
    return json({ error: '請填寫姓名與聯絡方式' }, 400);
  }

  const supabase = getSupabaseClient();
  const { error } = await supabase.from('leads').insert({
    name,
    contact,
    message: message || null,
    property_id: propertyId || null,
    property_title: propertyTitle || null,
    source_url: sourceUrl || null
  });

  if (error) {
    console.error('❌ 寫入 leads 失敗:', error);
    return json({ error: '送出失敗，請稍後再試或直接透過 LINE 詢問' }, 500);
  }

  await sendNotificationEmail({ name, contact, message, property_id: propertyId, property_title: propertyTitle, source_url: sourceUrl });

  return json({ ok: true });
}
