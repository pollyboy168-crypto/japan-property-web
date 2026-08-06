import { getSupabaseClient } from './supabase.js';
import { OFFICIAL_LINE_ID, BACKUP_IMAGES } from './constants.js';

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

// 「相似物件」推薦：同地區優先，再依價格與 ROI 接近程度排序。
// 直接重用 getAllProperties()（資料量只有幾百筆，成本很低），純前端/伺服器端計算，
// 不需要另外寫 Supabase 查詢語法。
export async function getSimilarProperties(currentProperty, limit = 4) {
  if (!currentProperty) return [];

  const all = await getAllProperties();
  const currentRoi = parseFloat(currentProperty.roi) || 0;

  return all
    .filter((item) => item.id !== currentProperty.id)
    .map((item) => {
      const sameLocation = item.location === currentProperty.location ? 1 : 0;
      const priceDiff = Math.abs(item.priceJPY - currentProperty.priceJPY) / currentProperty.priceJPY;
      const roiDiff = Math.abs((parseFloat(item.roi) || 0) - currentRoi);

      // 同地區權重最高，其次是價格與 ROI 越接近分數越高
      const score = sameLocation * 10 - priceDiff * 3 - roiDiff * 0.5;
      return { item, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.item);
}
