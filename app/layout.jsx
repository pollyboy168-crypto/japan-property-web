import './globals.css';

export const metadata = {
  title: '日本地產與民宿投資專家｜一站式置產與託管顧問',
  description: '專為台灣買家打造的日本不動產與合法民宿投資平台，提供精準物件評估、180天/365天牌照分析與包租代管服務。',
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-TW">
      <body className="bg-slate-50 text-slate-800 min-h-screen">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="text-xl font-extrabold text-blue-900 tracking-tight">
              JapanProp<span className="text-blue-600">.tw</span> <span className="text-xs font-normal text-slate-500 ml-2">日本地產/民宿專門</span>
            </div>
            <nav className="hidden md:flex gap-6 text-sm font-medium">
              <a href="#properties" className="hover:text-blue-600">精選物件</a>
              <a href="#minshuku" className="hover:text-blue-600">民宿特輯與試算</a>
              <a href="#cases" className="hover:text-blue-600">成功案例</a>
            </nav>
            <a href="https://line.me" className="bg-emerald-500 text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-emerald-600 transition-colors">
              LINE 專人諮詢
            </a>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}