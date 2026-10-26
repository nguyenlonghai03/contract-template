"use client";

import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function SearchBox() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const keywordQuery = searchParams.get("q") || "";
  const [searchTerm, setSearchTerm] = useState(keywordQuery);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    // Điều hướng sang trang tìm kiếm kèm query parameter `q`
    router.push(`/tim-kiem?q=${encodeURIComponent(searchTerm.trim())}`);
  };

  return (
    <form
      onSubmit={handleSearch}
      className="flex items-center bg-white rounded-full p-2 border border-slate-200 shadow-xl shadow-slate-100 transition-all hover:border-emerald-300"
    >
      <div className="pl-4 text-slate-400">
        <Search className="w-5 h-5" />
      </div>
      <input
        type="text"
        name="q"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Nhập tên hợp đồng, dịch vụ pháp lý cần tìm..."
        className="w-full px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none text-sm md:text-base bg-transparent"
      />
      <button
        type="submit"
        className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold px-6 py-2.5 rounded-full text-sm md:text-base shadow-md shadow-emerald-200 transition whitespace-nowrap shrink-0"
      >
        TÌM KIẾM
      </button>
    </form>
  );
}
