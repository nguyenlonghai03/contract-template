"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Mail } from "lucide-react";

export default function MobileMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <>
      {/* HAMBURGER */}
      <button
        type="button"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-label={isMenuOpen ? "Đóng menu" : "Mở menu"}
        aria-expanded={isMenuOpen}
        aria-controls="mobile-navigation"
        className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition focus:outline-none focus:ring-2 focus:ring-emerald-500"
      >
        {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* MOBILE NAVIGATION */}
      <div
        id="mobile-navigation"
        aria-label="Điều hướng trên thiết bị di động"
        aria-hidden={!isMenuOpen}
        inert={!isMenuOpen}
        className={`md:hidden absolute top-full left-0 w-full bg-white border-t border-slate-100 shadow-lg transition-all duration-300 ease-in-out ${
          isMenuOpen
            ? "opacity-100 visible translate-y-0"
            : "opacity-0 invisible -translate-y-2 pointer-events-none"
        }`}
      >
        <nav
          aria-label="Menu di động"
          className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1"
        >
          <Link
            href="/"
            onClick={closeMenu}
            className="px-4 py-3 rounded-lg font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition"
          >
            Trang chủ
          </Link>

          <Link
            href="/ve-chung-toi"
            onClick={closeMenu}
            className="px-4 py-3 rounded-lg font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition"
          >
            Về chúng tôi
          </Link>

          <div className="border-t border-slate-100 mt-2 pt-3 px-4">
            <a
              href="mailto:nguyenlonghai1412@gmail.com"
              className="flex items-center gap-3 text-sm text-slate-600 hover:text-emerald-700 transition"
            >
              <Mail className="w-4 h-4 text-emerald-600" />
              <span>Email hỗ trợ</span>
            </a>
          </div>
        </nav>
      </div>
    </>
  );
}
