import Link from "next/link";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../ui/pagination";

import type { ContractResponse } from "@/types/contract";
import { formatPrice } from "@/lib/format";

import { AlertCircle, CheckCircle2, Download, Eye, SearchX, Star } from "lucide-react";

type ContractListProps = {
  // Dữ liệu được ContractCatalog tải sẵn (song song với API danh mục)
  contractData: ContractResponse | null;
  hasError?: boolean;
  searchQuery?: string;
  currentPage?: number;
  selectedType?: string;
  basePath?: string;
};

export default function ContractList({
  contractData,
  hasError = false,
  searchQuery = "",
  currentPage = 1,
  selectedType = "",
  basePath = "/",
}: ContractListProps) {
  const contracts = contractData?.data ?? [];
  const totalPages = contractData?.totalPages ?? 0;

  // Tạo URL phân trang và giữ nguyên bộ lọc hiện tại
  const getPageUrl = (page: number) => {
    const params = new URLSearchParams();

    if (searchQuery.trim()) {
      params.set("keyword", searchQuery.trim());
    }

    if (selectedType) {
      params.set("type", selectedType);
    }

    if (page > 1) {
      params.set("page", String(page));
    }

    const queryString = params.toString();

    return queryString ? `${basePath}?${queryString}` : basePath;
  };

  return (
    <div className="lg:col-span-8 space-y-3">
      <div className="space-y-3 min-h-[550px] [overflow-anchor:none]">
        {/* ERROR */}
        {hasError ? (
          <div
            role="alert"
            className="min-h-[480px] bg-white rounded-2xl border border-slate-200/80 flex flex-col items-center justify-center text-center p-8 shadow-xs"
          >
            <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 mb-5">
              <AlertCircle className="w-8 h-8" />
            </div>

            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Không thể tải danh sách hợp đồng
            </h3>

            <p className="text-sm text-slate-500 max-w-md">
              Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại sau.
            </p>
          </div>
        ) : contracts.length === 0 ? (
          /* EMPTY STATE */
          <div className="min-h-[480px] bg-white rounded-2xl border border-slate-200/80 flex flex-col items-center justify-center text-center p-8 shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 mb-5 shadow-sm">
              <SearchX className="w-8 h-8" />
            </div>

            <h3 className="text-lg font-bold text-slate-900 mb-1.5">
              {searchQuery.trim()
                ? "Không tìm thấy mẫu hợp đồng phù hợp"
                : "Chưa có mẫu hợp đồng nào"}
            </h3>

            <p className="text-sm text-slate-500 max-w-md mb-6 leading-relaxed">
              {searchQuery.trim() ? (
                <>
                  Không có kết quả cho từ khóa{" "}
                  <span className="font-semibold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded">
                    &ldquo;{searchQuery}&rdquo;
                  </span>
                  . Vui lòng kiểm tra lại chính tả hoặc thử từ khóa khác.
                </>
              ) : (
                "Hiện tại danh mục này chưa có biểu mẫu hợp đồng. Vui lòng quay lại sau."
              )}
            </p>

            {searchQuery.trim() && (
              <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-4 text-left max-w-md w-full mb-6 shadow-xs">
                <div className="flex items-center gap-2 font-semibold text-slate-800 text-sm mb-3">
                  <AlertCircle className="w-4 h-4 text-blue-600" />
                  <span>Gợi ý để tìm kiếm chính xác hơn:</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-600">
                  {[
                    "Kiểm tra lỗi chính tả từ khóa",
                    "Sử dụng từ khóa ngắn gọn hơn",
                    "Dùng từ tổng quát (VD: Thuê nhà, Lao động)",
                    "Chọn trực tiếp từ danh mục bên trái",
                  ].map((suggestion) => (
                    <div
                      key={suggestion}
                      className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200/60"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                      <span>{suggestion}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* CONTRACT LIST */
          contracts.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl p-3.5 md:p-4 shadow-sm border border-slate-200/80 hover:shadow-md transition flex flex-col md:flex-row items-start md:items-center justify-between gap-3"
            >
              {/* LEFT */}
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm mt-0.5">
                  W
                </div>

                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/hop-dong/${item.slug}-${item.id}`}
                      prefetch
                      className="font-semibold text-slate-900 text-sm hover:text-blue-600 transition line-clamp-1"
                    >
                      {item.title}
                    </Link>

                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  </div>

                  <div className="flex items-center gap-3 text-sm text-slate-500">
                    <span className="flex items-center gap-1 text-amber-500 font-bold">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      {item.rating}
                    </span>

                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5 text-slate-400" />
                      {item.views} lượt xem
                    </span>

                    <span className="flex items-center gap-1">
                      <Download className="w-3.5 h-3.5 text-slate-400" />
                      {item.downloads} lượt tải
                    </span>
                  </div>
                </div>
              </div>

              {/* RIGHT */}
              <div className="flex md:flex-col items-center md:items-end justify-between w-full md:w-auto shrink-0 border-t md:border-t-0 pt-2 md:pt-0 border-slate-100">
                {formatPrice(item.originalPrice) && (
                  <span className="text-sm text-slate-400 line-through font-medium">
                    {formatPrice(item.originalPrice)} đ
                  </span>
                )}

                <span className="text-base font-extrabold text-emerald-600">
                  {formatPrice(item.price)} đ
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* PAGINATION */}
      {!hasError && totalPages > 1 && (
        <Pagination className="pt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                text="Trang trước"
                href={getPageUrl(currentPage - 1)}
                aria-disabled={currentPage <= 1}
                className={currentPage <= 1 ? "pointer-events-none opacity-40" : "cursor-pointer"}
              />
            </PaginationItem>

            {Array.from({ length: totalPages }, (_, index) => {
              const pageNum = index + 1;

              return (
                <PaginationItem key={pageNum}>
                  <PaginationLink
                    href={getPageUrl(pageNum)}
                    isActive={currentPage === pageNum}
                    aria-current={currentPage === pageNum ? "page" : undefined}
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              );
            })}

            <PaginationItem>
              <PaginationNext
                text="Trang sau"
                href={getPageUrl(currentPage + 1)}
                aria-disabled={currentPage >= totalPages}
                className={
                  currentPage >= totalPages ? "pointer-events-none opacity-40" : "cursor-pointer"
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
