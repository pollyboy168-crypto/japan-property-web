'use client';

// 純瀏覽器端（localStorage）的訪客個人紀錄，不經過任何伺服器，不是集體統計數字。
// 只在 client component 裡使用；SSR 階段 window 不存在，每個函式都要擋。

const RECENTLY_VIEWED_KEY = 'kazuhi_recently_viewed';
const FAVORITES_KEY = 'kazuhi_favorites';
const MAX_RECENTLY_VIEWED = 12;

function readJSON(key, fallback) {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}

function writeJSON(key, value) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    // localStorage 滿了或被瀏覽器封鎖時靜默失敗，不影響瀏覽網站
  }
}

// ---------------- 瀏覽紀錄 ----------------

export function getRecentlyViewed() {
  return readJSON(RECENTLY_VIEWED_KEY, []);
}

export function recordView(id) {
  if (!id) return;
  const existing = getRecentlyViewed().filter((entry) => entry.id !== id);
  const updated = [{ id, viewedAt: Date.now() }, ...existing].slice(0, MAX_RECENTLY_VIEWED);
  writeJSON(RECENTLY_VIEWED_KEY, updated);
}

// ---------------- 收藏清單 ----------------

export function getFavorites() {
  return readJSON(FAVORITES_KEY, []);
}

export function isFavorite(id) {
  return getFavorites().includes(id);
}

export function toggleFavorite(id) {
  const current = getFavorites();
  const updated = current.includes(id)
    ? current.filter((favId) => favId !== id)
    : [...current, id];
  writeJSON(FAVORITES_KEY, updated);
  return updated;
}
