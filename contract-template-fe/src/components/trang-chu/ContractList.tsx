"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../ui/pagination";
import { ContractResponse } from "@/types/contract";
import { getContracts } from "@/services/contractApi";
import { useState } from "react";
import { Skeleton } from "../ui/skeleton";
import Link from "next/link";
import { CheckCircle2, Download, Eye, Star } from "lucide-react";

type ContractListProps = {
  searchQuery?: string;
};

const ContractList = ({ searchQuery }: ContractListProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Query lấy danh sách hợp đồng bên phải có phân trang từ Backend
  const { data: contractData, isLoading: isContractsLoading } =
    useQuery<ContractResponse>({
      queryKey: ["contracts", currentPage, searchQuery],
      queryFn: () => getContracts(currentPage, pageSize, searchQuery),
      placeholderData: (previousData) => previousData, // Giữ dữ liệu cũ khi chuyển trang để mượt hơn
    });

  return (
    <div className="lg:col-span-8 space-y-3">
      <div className="space-y-3 min-h-[550px]">
        {isContractsLoading ? (
          // Hiển thị khung Skeleton của Shadcn khi đang tải trang lần đầu
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-3.5 md:p-4 shadow-sm border border-slate-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 animate-pulse"
              >
                {/* Trái: Icon giả lập + Tiêu đề & Thông số */}
                <div className="flex items-center gap-3 flex-1 w-full">
                  {/* Ô vuông icon chữ W */}
                  <Skeleton className="w-9 h-9 rounded-lg bg-slate-200 shrink-0" />

                  <div className="space-y-2 flex-1">
                    {/* Dòng tiêu đề hợp đồng */}
                    <Skeleton className="h-4 w-4/5 bg-slate-200 rounded-md" />
                    {/* Dòng thông số (sao, lượt xem, lượt tải) */}
                    <Skeleton className="h-3 w-3/5 bg-slate-200 rounded-md" />
                  </div>
                </div>

                {/* Phải: Giá tiền */}
                <div className="flex md:flex-col items-center md:items-end justify-between w-full md:w-auto shrink-0 border-t md:border-t-0 pt-2 md:pt-0 border-slate-100 gap-1.5">
                  <Skeleton className="h-3 w-16 bg-slate-200 rounded-md" />
                  <Skeleton className="h-4 w-20 bg-slate-200 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Hiển thị danh sách hợp đồng thật
          contractData?.data.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl p-3.5 md:p-4 shadow-sm border border-slate-200/80 hover:shadow-md transition flex flex-col md:flex-row items-start md:items-center justify-between gap-3"
            >
              {/* Trái: Icon Word + Tên + Thông số */}
              <div className="flex items-start gap-3 flex-1 min-w-0">
                {/* Icon giả lập file Word màu xanh nước biển */}
                <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm mt-0.5">
                  W
                </div>

                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/hop-dong/${item.slug}-${item.id}`}
                      className="font-semibold text-slate-900 text-sm hover:text-blue-600 transition line-clamp-1"
                    >
                      {item.title}
                    </Link>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  </div>

                  {/* Đánh giá, Lượt xem, Lượt tải */}
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

              {/* Phải: Giá gạch & Giá hiện tại */}
              <div className="flex md:flex-col items-center md:items-end justify-between w-full md:w-auto shrink-0 border-t md:border-t-0 pt-2 md:pt-0 border-slate-100">
                <span className="text-sm text-slate-400 line-through font-medium">
                  {item.originalPrice}
                </span>
                <span className="text-base font-extrabold text-emerald-600">
                  {item.price}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
      {contractData && contractData.totalPages > 1 && (
        <Pagination className="pt-4 fix">
          <PaginationContent>
            {/* Nút Previous */}
            <PaginationItem>
              <PaginationPrevious
                text="Trang trước"
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage > 1) setCurrentPage((prev) => prev - 1);
                }}
                className={
                  currentPage === 1
                    ? "pointer-events-none opacity-40"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>

            {/* Các nút số trang */}
            {Array.from({ length: contractData.totalPages }, (_, index) => {
              const pageNum = index + 1;
              return (
                <PaginationItem key={pageNum}>
                  <PaginationLink
                    href="#"
                    isActive={currentPage === pageNum}
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage(pageNum);
                    }}
                    className="cursor-pointer"
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              );
            })}

            {/* Nút Next */}
            <PaginationItem>
              <PaginationNext
                text="Trang sau"
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage < contractData.totalPages)
                    setCurrentPage((prev) => prev + 1);
                }}
                className={
                  currentPage === contractData.totalPages
                    ? "pointer-events-none opacity-40"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default ContractList;
