export default function GalleryModal({ property, onClose }) {
  if (!property) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div>
            <h3 className="font-bold text-lg">{property.title}</h3>
            <p className="text-xs text-slate-400">實境照片相簿 (共 {property.images.length} 張)</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl font-bold px-2 py-1">
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {property.images.map((imgUrl, index) => (
            <div key={index} className="h-56 bg-slate-800 rounded-xl overflow-hidden border border-slate-700">
              <img src={imgUrl} alt={`物件實景 ${index + 1}`} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>

        <div className="pt-2 flex justify-end">
          <a
            href={property.lineLink}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-6 py-2.5 rounded-xl transition shadow"
          >
            💬 帶著這套物件諮詢官方 LINE
          </a>
        </div>
      </div>
    </div>
  );
}
