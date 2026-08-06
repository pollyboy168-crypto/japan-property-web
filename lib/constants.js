// ----------------------------------------------------------------
// 🏢 日本法人與官方 LINE 帳號設定（首頁與物件詳情頁共用）
// ----------------------------------------------------------------
export const OFFICIAL_LINE_ID = '@267fmlaq';
export const OFFICIAL_LINE_URL = `https://line.me/ti/p/${OFFICIAL_LINE_ID}`;

export const companyInfo = {
  jpCompanyName: '株式会社和日',
  jpCompanyEn: 'Kazuhi Co., Ltd.',
  address: '大阪府大阪市中央区日本橋二丁目8-15',
  licenseNo: '法人番号 1200-01-288148',
  lineUrl: OFFICIAL_LINE_URL,
  email: 'contact@kazuhi-property.com',
  flagshipUrl: 'https://www.shinsai-wings-osakastay.com/'
};

// 高清建築/民宿圖片池 (避免完全重複圖片)
export const BACKUP_IMAGES = [
  'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80'
];

export const jpyToTwd = 0.21;

export function formatPropertyPrice(amountJPY, currency) {
  if (currency === 'TWD') {
    const twd = Math.round(amountJPY * jpyToTwd);
    return `NT$ ${(twd / 10000).toFixed(0)} 萬`;
  }
  return `¥ ${Math.round(amountJPY / 10000).toLocaleString()} 萬日圓`;
}
