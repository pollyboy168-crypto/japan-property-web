// ----------------------------------------------------------------
// 🏢 日本法人與官方 LINE 帳號設定（首頁與物件詳情頁共用）
// ----------------------------------------------------------------
export const OFFICIAL_LINE_ID = '@267fmlaq';
export const OFFICIAL_LINE_URL = `https://line.me/ti/p/${OFFICIAL_LINE_ID}`;

// ----------------------------------------------------------------
// 🔎 網站品牌名稱（SEO）
//
// 原本站名直接用法人名「株式会社和日」，問題是「和日」兩個字太泛用，
// 搜尋競爭者一大堆，根本排不到我們；而且對台灣買家來說，日文法人名
// 看不出這個站是在賣什麼。
//
// 但也不能反過來把站名塞成「日本買房大阪房產投資民泊」這種關鍵字堆疊——
// Google 的「網站名稱」功能明確要的是**品牌**，判定成關鍵字堆疊時會直接
// 忽略我們宣告的名稱、自己從別處挑一個顯示，反而失去控制權。
//
// 折衷作法：品牌 + 真實關鍵字組成一個「可被擁有的詞組」。
// 「和日大阪房產」保留了法人與網域的連結（和日 / her-yow），
// 又內含「大阪房產」這個實際會被搜尋的字，整體夠獨特、搜得到也記得住。
// ----------------------------------------------------------------
export const SITE_NAME = '和日大阪房產';
export const SITE_NAME_EN = 'Kazuhi Osaka Property';
export const SITE_TAGLINE = '台灣人的大阪置產與特區民泊顧問';

export const companyInfo = {
  siteName: SITE_NAME,
  siteNameEn: SITE_NAME_EN,
  siteTagline: SITE_TAGLINE,
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
