"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Contract } from "@/types/contract";

// Định nghĩa Interface cho Contract dựa theo cấu trúc dữ liệu BE của bạn

type ContractDocumentViewerProps = {
  contract: Contract;
  baseUrl?: string; // Dùng nếu cần nối domain vào đường dẫn ảnh của BE (ví dụ: "https://your-api.com")
};

export default function ContractDocumentViewer({
  contract,
  baseUrl = "",
}: ContractDocumentViewerProps) {
  // Lấy danh sách ảnh từ preview_images của BE, nếu không có thì dùng mảng rỗng
  const images = contract?.preview_images || [];
  const totalPages = images.length;

  const [activePage, setActivePage] = useState(1);

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

  // Xử lý khi cuộn ở khung bên phải để cập nhật activePage ở thumbnail tương ứng
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const scrollPosition = container.scrollTop;
    const pageHeight = container.clientHeight;

    // Tính toán trang hiện tại dựa trên vị trí cuộn
    const currentPage = Math.round(scrollPosition / pageHeight) + 1;
    if (
      currentPage >= 1 &&
      currentPage <= totalPages &&
      currentPage !== activePage
    ) {
      setActivePage(currentPage);
    }
  };

  if (totalPages === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 text-center text-slate-500">
        Không có hình ảnh preview cho hợp đồng này.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-3 md:p-5 relative ">
      {/* CONTAINER KHUNG ĐỌC - Giới hạn chiều cao cố định để không đè component dưới */}
      <div className="grid grid-cols-12 gap-3 bg-slate-100/90 rounded-xl p-3 border border-slate-200/80 h-[620px] overflow-hidden">
        {/* ================= CỘT 1: THUMBNAILS (BÊN TRÁI) ================= */}
        <div className="col-span-3 md:col-span-2 flex flex-col items-center bg-transparent py-1 pr-1 border-r border-slate-200/60 overflow-hidden">
          <div
            ref={thumbnailListRef}
            className="w-full h-full overflow-y-auto space-y-3 px-1 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent pr-1"
          >
            {images.map((imgSrc, index) => {
              const pageNum = index + 1;
              const fullImgUrl = imgSrc.startsWith("http")
                ? imgSrc
                : `${baseUrl}${imgSrc}`;
              const isSelected = activePage === pageNum;

              return (
                <div
                  key={pageNum}
                  onClick={() => handleSelectPage(pageNum)}
                  className="cursor-pointer flex flex-col items-center space-y-1 group"
                >
                  {/* Khung hiển thị ảnh thu nhỏ từ BE */}
                  <div
                    className={`w-full aspect-[1/1.414] bg-white rounded border-2 transition-all shadow-2xs relative flex flex-col justify-between overflow-hidden ${
                      isSelected
                        ? "border-emerald-500 ring-2 ring-emerald-400/30 shadow-md"
                        : "border-slate-300 group-hover:border-slate-400"
                    }`}
                  >
                    <Image
                      src={fullImgUrl}
                      alt={`Thumbnail trang ${pageNum}`}
                      fill
                      className="object-cover object-top"
                      sizes="150px"
                      unoptimized // Xóa khi get ảnh từ cloudflare
                    />
                  </div>

                  <span
                    className={`text-sm font-semibold ${
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

        {/* ================= CỘT 2: KHUNG ĐỌC ẢNH HỢP ĐỒNG (BÊN PHẢI) ================= */}
        <div className="col-span-9 md:col-span-10 relative flex rounded-lg overflow-hidden bg-slate-200/50 border border-slate-300 shadow-inner">
          {/* KHU VỰC CUỘN TỪNG TRANG ẢNH */}
          <div
            ref={contentViewerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto p-3 md:p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-400 scrollbar-track-slate-100 relative flex flex-col items-center"
          >
            {images.map((imgSrc, index) => {
              const pageNum = index + 1;
              const fullImgUrl = imgSrc.startsWith("http")
                ? imgSrc
                : `${baseUrl}${imgSrc}`;

              return (
                <div
                  key={pageNum}
                  id={`contract-page-${pageNum}`}
                  className="bg-white w-full max-w-3xl min-h-[720px] p-4 md:p-6 border border-slate-200 shadow-sm rounded-sm relative flex flex-col items-center justify-center"
                >
                  {/* Hiển thị ảnh thật từ BE thay vì chữ cứng */}
                  <div className="relative w-full h-[700px] flex items-center justify-center">
                    <Image
                      src={fullImgUrl}
                      alt={`${contract.title} - Trang ${pageNum}`}
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 100vw, 800px"
                      priority={pageNum === 1}
                      unoptimized // Xóa khi get ảnh từ cloudflare
                    />
                  </div>

                  {/* Số trang góc dưới */}
                  <div className="absolute bottom-3 left-0 right-0 text-center text-[11px] text-slate-400">
                    Trang {pageNum} / {totalPages}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
