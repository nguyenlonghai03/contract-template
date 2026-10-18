"use client";

import { useState } from "react";
import { QrCode, FileText, Download, Play, CheckCircle } from "lucide-react";

const GuideSection = () => {
  // Trạng thái giả lập để chuyển qua lại giữa các bước hướng dẫn
  const [activeStep, setActiveStep] = useState(1);

  return (
    <section className="max-w-6xl mx-auto px-4 py-12">
      {/* Khung bọc tổng thể kiểu khung mô phỏng (Card Container) */}
      <div className="bg-white rounded-3xl p-6 md:p-10 shadow-xl border border-slate-200/60 space-y-8">
        {/* TIÊU ĐỀ CHÍNH */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Chỉ với <span className="text-emerald-600">3 bước</span> để tải về
            hợp đồng bạn cần
          </h2>
        </div>

        {/* KHUNG HIỂN THỊ MÔ PHỎNG (MOCKUP DISPLAY BOX) */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-8 shadow-inner">
          {/* Cột trái: Nội dung thuyết minh theo bước */}
          <div className="space-y-6 max-w-md">
            <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full">
              Bước {activeStep} / 3
            </div>

            {activeStep === 1 && (
              <div className="space-y-3 animate-fadeIn">
                <h3 className="text-2xl font-bold text-slate-900">
                  1. Xem trước tài liệu PDF
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Xem trực tuyến toàn bộ nội dung chi tiết của mẫu hợp đồng
                  trước khi quyết định tải về, đảm bảo đúng nhu cầu sử dụng của
                  bạn.
                </p>
                <div className="flex items-center gap-2 text-xs font-medium text-emerald-600">
                  <CheckCircle className="w-4 h-4" /> Minh bạch toàn bộ nội dung
                </div>
              </div>
            )}

            {activeStep === 2 && (
              <div className="space-y-3 animate-fadeIn">
                <h3 className="text-2xl font-bold text-slate-900">
                  2. Quét mã QR thanh toán
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Quét mã QR bằng điện thoại và thanh toán tự động qua hệ thống
                  SePAY. Hệ thống sẽ tự động xác nhận giao dịch trong vài giây.
                </p>
                <div className="flex items-center gap-2 text-xs font-medium text-emerald-600">
                  <CheckCircle className="w-4 h-4" /> Thanh toán an toàn, tức
                  thì
                </div>
              </div>
            )}

            {activeStep === 3 && (
              <div className="space-y-3 animate-fadeIn">
                <h3 className="text-2xl font-bold text-slate-900">
                  3. Nhận link tải file Word / PDF
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Ngay sau khi thanh toán thành công, bạn sẽ nhận được liên kết
                  tải file văn bản định dạng Word (.docx) và PDF để chỉnh sửa và
                  sử dụng ngay.
                </p>
                <div className="flex items-center gap-2 text-xs font-medium text-emerald-600">
                  <CheckCircle className="w-4 h-4" /> Sở hữu trọn đời tài liệu
                </div>
              </div>
            )}

            {/* Các nút chuyển bước tương tác */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setActiveStep(1)}
                className={`w-3 h-3 rounded-full transition ${activeStep === 1 ? "bg-emerald-600 w-8" : "bg-slate-300"}`}
              />
              <button
                onClick={() => setActiveStep(2)}
                className={`w-3 h-3 rounded-full transition ${activeStep === 2 ? "bg-emerald-600 w-8" : "bg-slate-300"}`}
              />
              <button
                onClick={() => setActiveStep(3)}
                className={`w-3 h-3 rounded-full transition ${activeStep === 3 ? "bg-emerald-600 w-8" : "bg-slate-300"}`}
              />
            </div>
          </div>

          {/* Cột phải: Khung mô phỏng hình ảnh/video giao diện thanh toán giống ảnh mẫu */}
          <div className="relative bg-white border border-slate-200 rounded-2xl p-4 shadow-lg w-full md:w-[420px] flex flex-col items-center justify-center min-h-[260px] overflow-hidden group">
            {activeStep === 1 && (
              <div className="text-center space-y-3 py-6">
                <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                  <FileText className="w-7 h-7" />
                </div>
                <div className="font-bold text-slate-800 text-sm">
                  Giao diện xem trước PDF
                </div>
                <p className="text-xs text-slate-500 max-w-xs">
                  Hiển thị rõ ràng các điều khoản, quốc hiệu, tiêu ngữ và chữ ký
                  mẫu.
                </p>
              </div>
            )}

            {activeStep === 2 && (
              <div className="text-center space-y-3 py-6">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                  <QrCode className="w-7 h-7" />
                </div>
                <div className="font-bold text-slate-800 text-sm">
                  Quét mã QR bằng điện thoại
                </div>
                <p className="text-xs text-slate-500 max-w-xs">
                  Nội dung chuyển khoản được cấu hình sẵn, khớp mã tự động 100%.
                </p>
              </div>
            )}

            {activeStep === 3 && (
              <div className="text-center space-y-3 py-6">
                <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                  <Download className="w-7 h-7" />
                </div>
                <div className="font-bold text-slate-800 text-sm">
                  Tải về file Word / PDF thành công
                </div>
                <p className="text-xs text-slate-500 max-w-xs">
                  File sạch, chuẩn định dạng pháp lý sẵn sàng điền thông tin.
                </p>
              </div>
            )}

            {/* Hiệu ứng nút Play giả lập video hướng dẫn */}
            <div className="absolute inset-0 bg-slate-900/10 opacity-0 group-hover:opacity-100 transition flex items-center justify-center pointer-events-none">
              <div className="w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-lg">
                <Play className="w-5 h-5 fill-current ml-0.5" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GuideSection;
