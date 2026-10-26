"use client";

import { ArrowUp } from "lucide-react";

export default function ScrollToTopButton() {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div className="flex justify-end mb-6">
      <button
        onClick={scrollToTop}
        className="flex items-center gap-1.5 text-slate-800 font-semibold hover:text-emerald-600 transition group"
      >
        <ArrowUp className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
        <span>Lên đầu trang</span>
      </button>
    </div>
  );
}
