"use client";

import { X } from "lucide-react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function SearchInput() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const keywordQuery = searchParams.get("keyword") || "";

  const [searchTerm, setSearchTerm] = useState(keywordQuery);

  const handleClear = () => {
    setSearchTerm("");

    if (pathname === "/tim-kiem") {
      router.push("/tim-kiem");
    } else {
      router.push("/");
    }
  };

  return (
    <>
      <input
        type="text"
        name="keyword"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Nhập tên hợp đồng cần tìm..."
        aria-label="Nhập tên hợp đồng cần tìm"
        autoComplete="off"
        maxLength={150}
        className="w-full px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none text-sm md:text-base bg-transparent"
      />

      {searchTerm && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Xóa từ khóa tìm kiếm"
          className="p-2 text-slate-400 hover:text-slate-700 transition"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </>
  );
}
