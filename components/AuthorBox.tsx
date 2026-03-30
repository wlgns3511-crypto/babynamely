export function AuthorBox() {
  return (
    <div className="mt-10 flex gap-4 p-5 bg-pink-50 border-pink-200 border rounded-xl">
      <div className="flex-shrink-0 w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center text-2xl">
        <span>👶</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="font-semibold text-slate-900 text-sm">Baby Names Research Team</span>
          <span className="text-xs px-2 py-0.5 bg-pink-100 text-pink-800 rounded-full font-medium">Name Data Specialists</span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed mb-2">Our team analyzes historical naming data from the Social Security Administration spanning 140+ years, cross-referenced with US Census records and hospital birth data to provide comprehensive popularity trends and cultural context for every name.</p>
        <div className="flex flex-wrap gap-2">
          <span className="text-xs bg-pink-100 text-pink-800 px-2 py-0.5 rounded">✓ SSA Baby Names Database</span>
          <span className="text-xs bg-pink-100 text-pink-800 px-2 py-0.5 rounded">✓ US Census Data</span>
          <span className="text-xs bg-pink-100 text-pink-800 px-2 py-0.5 rounded">✓ Hospital Birth Records</span>
        </div>
      </div>
    </div>
  );
}
