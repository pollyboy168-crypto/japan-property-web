import { createClient } from '@supabase/supabase-js';
import { OFFICIAL_LINE_ID, BACKUP_IMAGES } from '@/lib/constants';

// ----------------------------------------------------------------
// 💡 Supabase Client 初始化設定
// 金鑰一律從環境變數讀取，Cloudflare Pages 專案設定裡必須配置
// NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY（見 CLAUDE.md）
// ----------------------------------------------------------------
export function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    console.error('❌ 缺少 NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY 環境變數，請參考 .env.local.example 設定。');
  }

  return createClient(url, anonKey);
}

// 把 Supabase 原始資料列轉換成前端／詳情頁顯示用的物件物件
// 首頁與物件詳情頁、sitemap 共用同一套邏輯，避免兩邊各自維護一份而失準
export function normalizeProperty(item, index = 0) {
  const propTitle = item.title_zh || '大阪精選投資物業';
  const propId = item.id || `JP-${index}`;

  // 💰 售價自動加價 30% (+30% Margin)
  const rawPrice = item.price_jpy || 50000000;
  const markedUpPriceJPY = Math.round(rawPrice * 1.3);
  const propPriceWan = `${Math.round(markedUpPriceJPY / 10000).toLocaleString()} 萬日圓`;

  // 🖼️ 照片多樣化解析邏輯
  let parsedImages = [];
  try {
    if (typeof item.images === 'string') {
      parsedImages = JSON.parse(item.images);
    } else if (Array.isArray(item.images)) {
      parsedImages = item.images;
    }
  } catch (e) {
    parsedImages = [];
  }

  if (!parsedImages || parsedImages.length === 0) {
    if (item.image_url) {
      parsedImages = [item.image_url];
    } else {
      // 自動挑選備用圖池中的不同圖片，避免全站一樣
      const fallbackImg = BACKUP_IMAGES[index % BACKUP_IMAGES.length];
      parsedImages = [fallbackImg];
    }
  }
  const coverImage = parsedImages[0];

  // 📝 獨一無二動態生成客製化文案描述
  const roiVal = item.roi || (6.5 + (index % 3) * 0.8).toFixed(1);
  let dynamicDesc = item.description_zh;
  if (!dynamicDesc || dynamicDesc.includes('大阪府大阪市内の厳選収益物件')) {
    dynamicDesc = `位於${item.location || '大阪府大阪市'}核心圈，預售包套價約 ${propPriceWan}，預估淨收益率達 ${roiVal}%。周邊商圈發達，適合做 365 天特區民泊或穩定日圓被動收入投資。`;
  }

  // 💬 全數導向官方 LINE，帶入該物件資訊
  const defaultMsg = `您好！我對【${propTitle}】(編號: ${propId} / 包套價: ${propPriceWan}) 感興趣，請提供詳細資料與專員對接！`;
  const customLineLink = `https://line.me/ti/p/${OFFICIAL_LINE_ID}?text=${encodeURIComponent(defaultMsg)}`;

  return {
    id: propId,
    title: propTitle,
    location: item.location || '大阪府大阪市',
    structure: item.type || '收益型不動產/民泊',
    priceJPY: markedUpPriceJPY,
    description: dynamicDesc,
    roi: roiVal,
    tags: [item.type || '收益不動產', `預估 ROI ${roiVal}%`],
    imageUrl: coverImage,
    images: parsedImages,
    lineLink: customLineLink,
    isFlagship: propId === 'prop-shinsai-wings'
  };
}

export async function getAllProperties() {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .range(0, 999)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Supabase 讀取失敗:', error);
    return [];
  }

  if (!data || data.length === 0) return [];

  return data.map((item, index) => normalizeProperty(item, index));
}

export async function getPropertyById(id) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return null;

  return normalizeProperty(data, 0);
}
