import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// 排程執行（Windows 工作排程器）不會帶上使用者的環境變數，所以腳本自己
// 從 .env.local 讀。這樣「手動跑」跟「排程跑」的行為才會一致——不然只有
// 排程那條會因為找不到 SYNC_SECRET 而失敗，而且失敗在背景沒人看得到。
export function loadEnv() {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const envPath = path.join(here, '..', '.env.local');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)$/i);
    if (!m) continue;
    const key = m[1];
    let val = m[2].trim().replace(/^["']|["']$/g, '');
    if (!process.env[key]) process.env[key] = val;
  }
}

export function requireEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`缺少環境變數 ${name}（請確認 .env.local 有設定）`);
  return v;
}

export const stamp = () => new Date().toISOString().replace('T', ' ').slice(0, 19);
