import Link from "next/link";
import { Search, FileText } from "lucide-react";

const Banner = () => {
  return (
    <section className="relative overflow-hidden py-16 md:py-24 px-4  from-slate-50 via-white to-slate-50">
      <div className="relative max-w-4xl mx-auto text-center space-y-6">
        {/* Main Title */}
        <h1 className="text-4xl capitalize md:text-6xl font-bold text-red-700 tracking-tight">
          Hệ Thống Hợp Đồng Pháp Lý
        </h1>

        {/* Subtitle */}
        <h2 className="text-xl md:text-2xl font-bold text-emerald-600">
          Được biên soạn và phát hành bởi luật sư uy tín
        </h2>

        {/* Search Bar Box */}
        <div className="pt-4 max-w-2xl mx-auto">
          <form
            action="/search"
            method="GET"
            className="flex items-center bg-white rounded-full p-2 border border-slate-200 shadow-xl shadow-slate-100 transition-all hover:border-emerald-300"
          >
            <div className="pl-4 text-slate-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              name="q"
              placeholder="Hợp đồng mua bán..."
              className="w-full px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none text-sm md:text-base bg-transparent"
            />
            <button
              type="submit"
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold px-6 py-2.5 rounded-full text-sm md:text-base shadow-md shadow-emerald-200 transition whitespace-nowrap shrink-0"
            >
              TÌM NGAY
            </button>
          </form>

          {/* Popular Search Suggestions */}
          <div className="mt-3 text-xs md:text-sm text-slate-500 flex flex-wrap items-center justify-center gap-1.5">
            <span className="font-medium">Tìm kiếm phổ biến:</span>
            <span className="text-emerald-600">Hợp đồng lao động,</span>
            <span className="text-emerald-600">Hợp đồng mua bán,</span>
            <span className="text-emerald-600">Hợp đồng thuê nhà</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Banner;
