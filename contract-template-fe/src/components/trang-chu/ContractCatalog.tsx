import Link from "next/link";
import { CheckCircle2, ShieldCheck, AlertCircle } from "lucide-react";

import type { ContractResponse, ContractType } from "@/types/contract";
import { getContracts, getContractsByContractType, getContractTypes } from "@/services/contractApi";
import { removeDiacritics } from "@/lib/stringUtils";
import ContractList from "./ContractList";

const PAGE_SIZE = 6;

interface ContractCatalogProps {
  searchQuery?: string;
  selectedType?: string;
  categoryQuery?: string;
  currentPage?: number;
  basePath?: string;
}

export default async function ContractCatalog({
  searchQuery = "",
  selectedType = "",
  categoryQuery = "",
  currentPage = 1,
  basePath = "/",
}: ContractCatalogProps) {
  const trimmedQuery = searchQuery.trim();

  // 1. Danh mục: không bao giờ reject (null = lỗi) để dùng chung cho cả 2 nhánh.
  const typesPromise: Promise<ContractType[] | null> = getContractTypes().then(
    (data) => (Array.isArray(data) ? data : []),
    (error) => {
      console.error("Failed to fetch contract types:", error);
      return null;
    },
  );

  // 2. Danh sách hợp đồng: chỉ khi lọc theo danh mục mới cần chờ danh mục để
  // đổi slug -> id; các trường hợp còn lại gọi SONG SONG với API danh mục
  // (trước đây luôn chạy nối tiếp, tốn thêm 1 round-trip).
  const listPromise: Promise<ContractResponse> = trimmedQuery
    ? getContracts(currentPage, PAGE_SIZE, trimmedQuery)
    : selectedType
      ? typesPromise.then((types) => {
          const selected = types?.find((item) => item.slug === selectedType);

          return selected
            ? getContractsByContractType(selected.id, currentPage, PAGE_SIZE)
            : getContracts(currentPage, PAGE_SIZE);
        })
      : getContracts(currentPage, PAGE_SIZE);

  const [typesData, listResult] = await Promise.all([
    typesPromise,
    listPromise.then(
      (data) => ({ data, error: false }) as const,
      (error) => {
        console.error("Failed to fetch contracts:", error);
        return { data: null, error: true } as const;
      },
    ),
  ]);

  const hasError = typesData === null;
  const contractTypes = typesData ?? [];

  // Chuẩn hóa từ khóa tìm kiếm danh mục
  const normalizedQuery = removeDiacritics(categoryQuery.trim()).toLowerCase();

  // Lọc danh mục
  const filteredContractTypes = normalizedQuery
    ? contractTypes.filter((item) => {
        const name = removeDiacritics(item.name || "").toLowerCase();

        return normalizedQuery
          .split(/\s+/)
          .filter(Boolean)
          .every((token) => name.includes(token));
      })
    : contractTypes;

  return (
    <section
      aria-labelledby="contract-catalog-title"
      className="w-full max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-8 lg:py-10"
    >
      <div className="bg-slate-100/80 rounded-2xl sm:rounded-3xl p-3 sm:p-4 md:p-6 shadow-xl border border-slate-200/60">
        {/* HEADER */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 px-1 pb-4 sm:mb-6 sm:px-2">
          <h2 id="contract-catalog-title" className="text-lg font-bold text-slate-800 sm:text-xl">
            Kho hợp đồng pháp lý
          </h2>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1.5 text-xs font-semibold text-blue-700 sm:text-sm">
              <ShieldCheck className="h-4 w-4" />
              Bảo đảm chất lượng
            </span>

            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-700 sm:text-sm">
              <ShieldCheck className="h-4 w-4" />
              Cập nhật theo quy định mới
            </span>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
          {/* SIDEBAR */}
          <aside className="lg:col-span-4 min-w-0 space-y-4">
            {/* CATEGORY */}
            <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-sm border border-slate-200/80 space-y-4">
              <h3 className="font-bold text-slate-800 text-sm sm:text-base">Danh mục hợp đồng</h3>

              {hasError ? (
                <div role="status" className="flex items-center gap-2 text-sm text-amber-700 py-4">
                  <AlertCircle className="w-4 h-4" />
                  Không thể tải danh mục hợp đồng.
                </div>
              ) : (
                <ul
                  aria-label="Danh sách danh mục hợp đồng"
                  className="space-y-1.5 text-sm text-slate-600 max-h-64 sm:max-h-[355px] overflow-y-auto overscroll-contain pr-1"
                >
                  {filteredContractTypes.map((item) => {
                    const isSelected = selectedType === item.slug;

                    return (
                      <li key={item.id}>
                        <Link
                          href={`${basePath}?type=${encodeURIComponent(item.slug)}`}
                          aria-current={isSelected ? "page" : undefined}
                          scroll={false}
                          className={`w-full flex items-start gap-2 px-2.5 py-2 rounded-lg transition ${
                            isSelected
                              ? "bg-blue-50 text-blue-700 font-semibold"
                              : "text-slate-600 hover:bg-slate-50 hover:text-blue-600"
                          }`}
                        >
                          <span className="shrink-0 mt-0.5">{isSelected ? "●" : "•"}</span>

                          <span className="min-w-0 break-words">{item.name}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}

              {!hasError && filteredContractTypes.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-6">
                  Không tìm thấy danh mục phù hợp.
                </p>
              )}
            </div>

            {/* QUALITY */}
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 shadow-sm border border-slate-200/80 space-y-3">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm sm:text-base">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                Đảm bảo chất lượng
              </h3>

              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5" />
                  <span>Kiểm duyệt bởi luật sư</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5" />
                  <span>Cập nhật theo quy định mới</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5" />
                  <span>Đảm bảo tính pháp lý</span>
                </li>
              </ul>
            </div>
          </aside>

          {/* CONTRACT LIST */}
          <div className="lg:col-span-8 min-w-0">
            <ContractList
              contractData={listResult.data}
              hasError={listResult.error}
              searchQuery={searchQuery}
              selectedType={selectedType}
              currentPage={currentPage}
              basePath={basePath}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
