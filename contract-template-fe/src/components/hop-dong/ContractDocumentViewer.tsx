"use client";

import { useState, useRef } from "react";
import { CheckCircle2 } from "lucide-react";

interface ContractDocumentViewerProps {
  slug?: string;
}

export default function ContractDocumentViewer({
  slug,
}: ContractDocumentViewerProps) {
  const [activePage, setActivePage] = useState(1);
  const totalPages = 5;

  const thumbnailListRef = useRef<HTMLDivElement>(null);
  const contentViewerRef = useRef<HTMLDivElement>(null);

  // Chọn trang từ Thumbnail bên trái -> cuộn trang đó tới vị trí đọc
  const handleSelectPage = (pageNum: number) => {
    setActivePage(pageNum);
    const element = document.getElementById(`contract-page-${pageNum}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-3 md:p-5 relative z-0">
      {/* CONTAINER KHUNG ĐỌC - Giới hạn chiều cao cố định để không đè component dưới */}
      <div className="grid grid-cols-12 gap-3 bg-slate-100/90 rounded-xl p-3 border border-slate-200/80 h-[620px] overflow-hidden">
        {/* ================= CỘT 1: THUMBNAILS (BÊN TRÁI) ================= */}
        <div className="col-span-3 md:col-span-2 flex flex-col items-center bg-transparent py-1 pr-1 border-r border-slate-200/60 overflow-hidden">
          <div
            ref={thumbnailListRef}
            className="w-full h-full overflow-y-auto space-y-3 px-1 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent pr-1"
          >
            {Array.from({ length: totalPages }).map((_, index) => {
              const pageNum = index + 1;
              const isSelected = activePage === pageNum;

              return (
                <div
                  key={pageNum}
                  onClick={() => handleSelectPage(pageNum)}
                  className="cursor-pointer flex flex-col items-center space-y-1 group"
                >
                  {/* Khung mô phỏng trang thu nhỏ */}
                  <div
                    className={`w-full aspect-[1/1.3] bg-white rounded border-2 p-1.5 transition-all shadow-2xs relative flex flex-col justify-between overflow-hidden ${
                      isSelected
                        ? "border-emerald-500 ring-2 ring-emerald-400/30 shadow-md"
                        : "border-slate-300 group-hover:border-slate-400"
                    }`}
                  >
                    <div className="space-y-1 opacity-70">
                      <div className="w-full h-1 bg-slate-400 rounded-full"></div>
                      <div className="w-3/4 h-1 bg-slate-300 rounded-full"></div>
                      <div className="w-full h-0.5 bg-slate-200 rounded-full"></div>
                      <div className="w-full h-0.5 bg-slate-200 rounded-full"></div>
                    </div>
                    <div className="text-[8px] text-center text-slate-300 font-mono">
                      {pageNum}
                    </div>
                  </div>

                  <span
                    className={`text-xs font-semibold ${
                      isSelected
                        ? "text-emerald-700 font-bold"
                        : "text-slate-600"
                    }`}
                  >
                    {pageNum}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ================= CỘT 2: KHUNG ĐỌC VĂN BẢN PDF (BÊN PHẢI) ================= */}
        <div className="col-span-9 md:col-span-10 relative flex rounded-lg overflow-hidden bg-slate-200/50 border border-slate-300 shadow-inner">
          {/* KHU VỰC CUỘN TỪNG TRANG VĂN BẢN */}
          <div
            ref={contentViewerRef}
            className="flex-1 overflow-y-auto p-3 md:p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-400 scrollbar-track-slate-100 relative"
          >
            {Array.from({ length: totalPages }).map((_, index) => {
              const pageNum = index + 1;

              return (
                <div
                  key={pageNum}
                  id={`contract-page-${pageNum}`}
                  className="bg-white min-h-[720px] p-6 md:p-10 border border-slate-200 shadow-sm rounded-sm space-y-5 relative text-slate-800 text-xs md:text-sm leading-relaxed overflow-hidden"
                >
                  {/* CHE MỜ NỬA BÊN PHẢI VĂN BẢN CỦA TRANG CHỐNG SAO CHÉP */}
                  <div className="absolute right-0 top-0 bottom-0 w-[35%] bg-white/70 backdrop-blur-[2.5px] pointer-events-none select-none z-10 border-l border-slate-100/50" />

                  {/* Quốc hiệu tiêu ngữ */}
                  <div className="text-center space-y-1 pb-3 border-b border-slate-100">
                    <h3 className="font-bold text-slate-900 uppercase tracking-wide text-xs md:text-sm">
                      CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                    </h3>
                    <p className="font-bold text-slate-800 text-xs md:text-sm">
                      Độc lập - Tự do - Hạnh phúc
                    </p>
                    <div className="w-20 h-0.5 bg-slate-800 mx-auto mt-1"></div>
                  </div>

                  {/* Tên tiêu đề hợp đồng */}
                  <div className="text-center space-y-1 pt-1">
                    <h2 className="font-bold text-sm md:text-base text-slate-900 uppercase tracking-wide">
                      BIÊN BẢN THANH LÝ HỢP ĐỒNG CHUYỂN NHƯỢNG SALON TÓC
                    </h2>
                    <p className="text-[11px] text-slate-500 italic">
                      Số: ....../TLHĐ
                    </p>
                  </div>

                  {/* Nội dung mẫu giả lập */}
                  <div className="space-y-4 pt-2">
                    <p>
                      Các thành phần tham gia xác nhận có đầy đủ năng lực hành
                      vi dân sự, thẩm quyền đại diện hoặc giấy ủy quyền hợp lệ
                      để thanh lý hợp đồng và xác nhận hoàn thành các nghĩa vụ
                      liên quan.
                    </p>

                    <div className="space-y-2">
                      <h4 className="font-bold text-slate-900">
                        II. Thông Tin Về Salon Và Hợp Đồng Chuyển Nhượng
                      </h4>
                      <p>
                        Tên salon đang sử dụng: ....................... Địa chỉ
                        hoạt động: ....................................... Diện
                        tích sử dụng khoảng ....... m². Salon gồm khu lễ tân,
                        khu chờ, khu cắt tóc, khu gội đầu, khu hóa chất, khu
                        chăm sóc tóc, kho hàng, khu vệ sinh, khu nghỉ nhân viên
                        hoặc các khu vực khác.
                      </p>
                      <p>
                        Mặt bằng được sử dụng theo hình thức sở
                        hữu/thuê/mượn/hợp tác. Thông tin về bên cho thuê hoặc
                        bên cho thuê: ....... Hợp đồng thuê mặt bằng số: ......
                        ký ngày ...../...../20.... Giá thuê tại: ......
                        đồng/tháng. Thời hạn thuê còn lại: ...... Tiền đặt cọc
                        mặt bằng, nếu có: ...... đồng.
                      </p>
                      <p>
                        Theo Hợp đồng chuyển nhượng salon tóc, phạm vi chuyển
                        nhượng gồm toàn bộ mặt bằng, tài sản, máy móc, thiết bị,
                        ghế, gương, nội thất, dụng cụ nghề, bảng hiệu, biển
                        hiệu, thương hiệu, phần mềm quản lý, dữ liệu khách hàng,
                        tài khoản truyền thông, hồ sơ thuê mặt bằng, quyền khai
                        thác hoạt động salon hoặc hạng mục khác. Nội dung cụ thể
                        là: ....................
                      </p>
                    </div>

                    <div className="space-y-2 pt-2">
                      <h4 className="font-bold text-slate-900">
                        III. Kết Quả Thực Hiện Hợp Đồng
                      </h4>
                      <p>
                        Bên chuyển nhượng xác nhận đã hoàn thành/chưa hoàn thành
                        nghĩa vụ bàn giao tài sản theo hợp đồng. Các hạng mục đã
                        bàn giao gồm hiện trạng mặt bằng, máy móc thiết bị...
                      </p>
                    </div>
                  </div>

                  {/* Số trang góc dưới */}
                  <div className="absolute bottom-3 left-0 right-0 text-center text-[11px] font-mono text-slate-400">
                    {pageNum}
                  </div>
                </div>
              );
            })}
          </div>

          {/* DẢI BANNER BÊN PHẢI MÀU XANH LÁ (CỐ ĐỊNH SÁT MÉP PHẢI CỦA KHUNG READ) */}
          <div className="w-12 md:w-16 bg-emerald-600 text-white flex flex-col justify-between items-center py-6 px-1 shrink-0 select-none border-l border-emerald-700 z-20">
            {/* Các icon tính năng xoay chữ dọc */}
            <div className="space-y-10 flex flex-col items-center">
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center border border-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-[10px] font-bold tracking-tight writing-vertical text-emerald-50 whitespace-nowrap">
                  Hợp đồng đầy đủ
                </span>
              </div>

              <div className="flex flex-col items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center border border-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-[10px] font-bold tracking-tight writing-vertical text-emerald-50 whitespace-nowrap">
                  Định dạng Word
                </span>
              </div>

              <div className="flex flex-col items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center border border-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-[10px] font-bold tracking-tight writing-vertical text-emerald-50 whitespace-nowrap">
                  Hỗ trợ pháp lý
                </span>
              </div>
            </div>

            {/* Chữ Tải xuống và nhận ngay xoay dọc */}
            <div className="pt-4 border-t border-emerald-500/60 w-full flex justify-center">
              <span className="text-[11px] md:text-xs font-black uppercase tracking-wider text-white writing-vertical whitespace-nowrap">
                Tải xuống và nhận ngay
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
