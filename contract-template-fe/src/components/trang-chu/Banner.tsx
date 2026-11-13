import SearchBox from "./SearchBox";

const Banner = () => {
  return (
    <section
      aria-labelledby="banner-title"
      className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50 px-4 py-12 sm:py-16 md:py-20 lg:py-24"
    >
      <div className="relative mx-auto max-w-5xl text-center space-y-5 sm:space-y-6">
        {/* MAIN TITLE - H1 */}
        <h1
          id="banner-title"
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-red-700 tracking-tight leading-tight"
        >
          Hệ thống hợp đồng pháp lý
        </h1>

        {/* SUBTITLE */}
        <p className="text-base sm:text-lg md:text-2xl font-semibold text-emerald-600 leading-relaxed max-w-3xl mx-auto">
          Được biên soạn và phát hành bởi luật sư uy tín
        </p>

        {/* SEARCH BOX */}
        <div className="pt-3 sm:pt-5 w-full max-w-2xl mx-auto">
          <SearchBox />

          {/* POPULAR SEARCH */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-sm">
            <span className="font-semibold text-slate-600">
              Tìm kiếm phổ biến:
            </span>

            <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700 hover:bg-emerald-100 transition">
              Hợp đồng lao động
            </span>

            <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700 hover:bg-emerald-100 transition">
              Hợp đồng mua bán
            </span>

            <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700 hover:bg-emerald-100 transition">
              Hợp đồng thuê nhà
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Banner;
