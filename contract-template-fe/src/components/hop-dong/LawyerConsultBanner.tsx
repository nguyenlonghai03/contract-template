"use client";

import { Phone, MessageSquare, ShieldCheck } from "lucide-react";

export default function LawyerConsultBanner() {
  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 rounded-2xl p-6 text-white shadow-xl border border-slate-700/60 relative overflow-hidden space-y-5">
      {/* Hiệu ứng hình tròn mờ trang trí phía sau */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />

      {/* Badge thương hiệu */}
      <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold px-3 py-1 rounded-full">
        <ShieldCheck className="w-3.5 h-3.5" /> Dịch vụ pháp lý đi kèm
      </div>

      {/* Nội dung tiêu đề */}
      <div className="space-y-2 relative z-10">
        <h3 className="text-lg font-bold text-white leading-snug">
          Cần hiệu chỉnh & rà soát riêng theo yêu cầu?
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          Đội ngũ Luật sư thuộc Công ty Luật Thiên Mã sẵn sàng hỗ trợ tư vấn,
          chỉnh sửa điều khoản hợp đồng đảm bảo an toàn tuyệt đối cho giao dịch
          của bạn.
        </p>
      </div>

      {/* Thông tin hotline & nút liên hệ */}
      <div className="space-y-2.5 pt-2 relative z-10">
        <a
          href="tel:0977523155"
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 text-sm"
        >
          <Phone className="w-4 h-4 fill-current" />
          <span>HOTLINE: 0977 523 155</span>
        </a>

        <a
          href="https://zalo.me"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 font-semibold py-2.5 px-4 rounded-xl border border-slate-600/60 transition flex items-center justify-center gap-2 text-xs"
        >
          <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
          <span>Tư vấn nhanh qua Zalo</span>
        </a>
      </div>
    </div>
  );
}
