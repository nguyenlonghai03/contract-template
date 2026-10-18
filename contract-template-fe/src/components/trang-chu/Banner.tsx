import Link from "next/link";
import { Search, FileText } from "lucide-react";

const Banner = () => {
  return (
    <section className="relative overflow-hidden py-16 md:py-24 px-4 bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* Hiệu ứng nền mờ ảo (Glow background effect) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[500px] h-[300px] bg-purple-200/40 rounded-full blur-3xl"></div>
        <div className="w-[400px] h-[250px] bg-emerald-100/50 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-4xl mx-auto text-center space-y-6">
        {/* Top Badge */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold shadow-sm">
          <FileText className="w-3.5 h-3.5 text-emerald-600" />
          <span>Nền tảng cung cấp hợp đồng số 1 Việt Nam</span>
        </div>

        {/* Main Title */}
        <h1 className="text-4xl capitalize md:text-6xl font-bold text-red-700 tracking-tight">
          Thư viện mẫu hợp đồng chuẩn pháp lý
        </h1>

        {/* Subtitle */}
        <h2 className="text-xl md:text-2xl font-bold text-emerald-600">
          Luật sư soạn - Chuyên nghiệp - Bảo vệ tối đa
        </h2>

        {/* Description */}
        <p className="text-sm md:text-base text-slate-500 max-w-xl mx-auto">
          Được biên soạn và phát hành bởi các luật sư, hãng luật uy tín
        </p>

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
            <Link
              href="/search?q=hop-dong-lao-dong"
              className="text-emerald-600 hover:underline"
            >
              Hợp đồng lao động,
            </Link>
            <Link
              href="/search?q=hop-dong-mua-ban"
              className="text-emerald-600 hover:underline"
            >
              Hợp đồng mua bán,
            </Link>
            <Link
              href="/search?q=hop-dong-thue-nha"
              className="text-emerald-600 hover:underline"
            >
              Hợp đồng thuê nhà
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Banner;
