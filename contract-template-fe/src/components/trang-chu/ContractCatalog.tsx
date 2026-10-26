"use client";

import { useEffect, useState } from "react";
import { Search, CheckCircle2, ShieldCheck, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getContractTypes } from "@/services/contractApi";
import { ContractType } from "@/types/contract";
import { Skeleton } from "../ui/skeleton";
import { removeDiacritics } from "@/lib/stringUtils";
import ContractList from "./ContractList";
import { useSearchParams } from "next/navigation";

const ContractCatalog = () => {
  const [searchContractTypes, setSearchContractTypes] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | number | null>(null);
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("q") || "";

  const { data: contractTypes, isLoading: isContractTypesLoading } = useQuery<
    ContractType[]
  >({
    queryKey: ["contract-types"],
    queryFn: getContractTypes,
  });

  // Xử lý debounce: Chờ 300ms sau khi người dùng ngưng gõ mới cập nhật debouncedQuery
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchContractTypes);
    }, 300); // 300 mili-giây

    // Cleanup function: Xóa timeout cũ nếu người dùng vẫn đang tiếp tục gõ
    return () => clearTimeout(timer);
  }, [searchContractTypes]);

  // Thuật toán tìm kiếm thông minh: Hỗ trợ cả gõ có dấu, không dấu, viết tắt, lộn xộn
  const filteredContractTypes = contractTypes?.filter((item: ContractType) => {
    const rawName = item.name || "";

    const itemNameNormalized = removeDiacritics(rawName);
    const queryNormalized = removeDiacritics(debouncedQuery.trim());

    if (!queryNormalized) return true;

    // Tách từ khóa người dùng nhập thành các từ riêng lẻ
    const tokens = queryNormalized.split(/\s+/).filter(Boolean);
    const uniqueTokens = Array.from(new Set(tokens));

    return uniqueTokens.every((token) => itemNameNormalized.includes(token));
  });

  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      {/* Khung bao ngoài phong cách ứng dụng Desktop */}
      <div className="bg-slate-100/80 rounded-3xl p-4 md:p-6 shadow-xl border border-slate-200/60">
        {/* HEADER BAR CỦA BẢNG: Nút giao diện + Tabs + Badges */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-6 border-b border-slate-200/80 px-2">
          {/* Badges thông tin góc phải */}
          <div className="flex items-center gap-2 text-sm font-semibold">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-700">
              <ShieldCheck className="w-3.5 h-3.5" />
              Bảo đảm chất lượng
            </span>
          </div>
        </div>

        {/* THÂN BẢNG: Cột Sidebar trái & Cột Danh sách phải */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start ">
          {/* CỘT TRÁI: SIDEBAR (4 Cột) */}
          <div className="lg:col-span-4 space-y-4 ">
            {/* Box Danh mục */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 space-y-4">
              <h3 className="font-bold text-slate-800 text-sm">
                Danh mục phổ biến
              </h3>

              {/* Input tìm danh mục */}
              <div className="relative">
                <input
                  type="text"
                  disabled={isContractTypesLoading}
                  placeholder="Tìm kiếm danh mục..."
                  value={searchContractTypes} // Gắn giá trị state
                  onChange={(e) => setSearchContractTypes(e.target.value)}
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 pr-8 text-slate-700 focus:outline-none focus:border-blue-500"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
              </div>
              {isContractTypesLoading ? (
                /* Hiển thị vòng tròn xoay (Spinner) kết hợp Skeleton khi đang tải */
                <div className="flex flex-col items-center justify-center py-8 space-y-3 min-h-[200px]">
                  <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                  <div className="w-full space-y-2 px-1">
                    <Skeleton className="h-4 w-full bg-slate-200 rounded-md" />
                    <Skeleton className="h-4 w-full bg-slate-200 rounded-md" />
                    <Skeleton className="h-4 w-full bg-slate-200 rounded-md" />
                  </div>
                </div>
              ) : (
                // List danh mục
                <ul className="space-y-2 text-sm text-slate-600 max-h-[355px] overflow-y-auto pr-1">
                  {filteredContractTypes &&
                    filteredContractTypes.map((item) => {
                      const isSelected = selectedId === item.id;

                      return (
                        <li
                          key={item.id}
                          className={`cursor-pointer hover:text-blue-600 transition truncate flex items-center gap-1 
                          ${
                            isSelected
                              ? "text-blue-600 font-bold scale-[1.02]" // Style khi được click chọn (đậm, xanh, nổi bật)
                              : "hover:text-blue-600 font-normal" // Style bình thường
                          }`}
                          onClick={() => setSelectedId(item.id)}
                        >
                          <span>•</span>
                          <span>{item.name}</span>
                        </li>
                      );
                    })}
                </ul>
              )}
            </div>

            {/* Box Đảm bảo chất lượng */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 space-y-2.5 text-sm">
              <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Đảm bảo chất lượng
              </h4>
              <ul className="space-y-1.5 text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  Kiểm duyệt bởi luật sư
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  Cập nhật theo quy định mới
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  Đảm bảo tính pháp lý
                </li>
              </ul>
            </div>
          </div>

          {/* CỘT PHẢI: DANH SÁCH HỢP ĐỒNG (8 Cột) */}
          <ContractList key={searchQuery} searchQuery={searchQuery} />
        </div>
      </div>
    </section>
  );
};

export default ContractCatalog;
