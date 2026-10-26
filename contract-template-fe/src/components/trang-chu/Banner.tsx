import SearchBox from "./SearchBox";

const Banner = () => {
  return (
    <section className="relative overflow-hidden py-16 md:py-24 px-4 from-slate-50 via-white to-slate-50">
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
          <SearchBox />

          {/* Popular Search Suggestions */}
          <div className="mt-3 text-sm md:text-sm text-slate-500 flex flex-wrap items-center justify-center gap-1.5">
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
