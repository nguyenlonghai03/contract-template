"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  CheckCircle2,
  Star,
  Eye,
  Download,
  ShieldCheck,
  Flame,
  FileText,
} from "lucide-react";

// Dữ liệu mẫu danh mục
const CATEGORIES = [
  { name: "Hợp Đồng Hot", isHot: true },
  { name: "Hợp Đồng Dịch Vụ | Cung Cấp" },
  { name: "Hợp Đồng Lao Động | Nhân sự" },
  { name: "Hợp đồng Khoán | Giao khoán" },
  { name: "Hợp Đồng Thanh Lý | Chấm Dứt" },
  { name: "Hợp Đồng Uỷ Quyền | Đại Diện" },
  { name: "Hợp Đồng Công Nghệ | Phần Mềm" },
  { name: "Hợp Đồng Bản Quyền | Sáng Chế" },
  { name: "Hợp Đồng Bảo Mật | Dữ Liệu" },
  { name: "Hợp Đồng Quảng Cáo | Truyền Tin" },
  { name: "Hợp Đồng Tổ Chức | Sự Kiện" },
  { name: "Hợp Đồng Đầu Tư | Dự Án" },
];

// Dữ liệu mẫu danh sách hợp đồng
const CONTRACT_LIST = [
  {
    id: "1",
    title: "Mẫu hợp đồng thuê nhà trọ - Mẫu word chuẩn 2026, Luật sư biên soạn",
    rating: 4.9,
    views: "109.6K",
    downloads: "829",
    originalPrice: "125.000 đ",
    price: "80.000 đ",
    badge: "Standard",
  },
  {
    id: "2",
    title: "Hợp đồng mua bán xe ô tô mới [mẫu Word chuẩn + file hướng dẫn làm]",
    rating: 4.5,
    views: "76.9K",
    downloads: "581",
    originalPrice: "125.000 đ",
    price: "80.000 đ",
    badge: "Standard",
  },
  {
    id: "3",
    title:
      "Mẫu hợp đồng lao động mới nhất 2026 chuẩn form Bộ Lao Động - Tải file doc/docx",
    rating: 4.7,
    views: "93.6K",
    downloads: "708",
    originalPrice: "125.000 đ",
    price: "80.000 đ",
    badge: "Standard",
  },
  {
    id: "4",
    title:
      "Mẫu hợp đồng thuê đất [bản File Word mới nhất 2026, Luật sư biên soạn]",
    rating: 4.9,
    views: "112.4K",
    downloads: "850",
    originalPrice: "125.000 đ",
    price: "80.000 đ",
    badge: "Standard",
  },
  {
    id: "5",
    title:
      "Hợp đồng dịch vụ [Mẫu file Word, PDF mới nhất + Hướng dẫn làm chuẩn]",
    rating: 4.9,
    views: "113.0K",
    downloads: "855",
    originalPrice: "125.000 đ",
    price: "80.000 đ",
    badge: "Standard",
  },
  {
    id: "6",
    title:
      "Mẫu hợp đồng mua bán đất [File word,pdf chuẩn 2026, Luật sư biên soạn]",
    rating: 4.9,
    views: "115.8K",
    downloads: "876",
    originalPrice: "125.000 đ",
    price: "80.000 đ",
    badge: "Standard",
  },
  {
    id: "7",
    title:
      "Mẫu hợp đồng đặt cọc tiền [File Word,PDF mới nhất 2026, Luật sư biên soạn]",
    rating: 4.9,
    views: "117.5K",
    downloads: "889",
    originalPrice: "125.000 đ",
    price: "80.000 đ",
    badge: "Standard",
  },
];

const ContractCatalog = () => {
  const [activeTab, setActiveTab] = useState("phobien");
  const [searchCategory, setSearchCategory] = useState("");

  const filteredCategories = CATEGORIES.filter((cat) =>
    cat.name.toLowerCase().includes(searchCategory.toLowerCase()),
  );

  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      {/* Khung bao ngoài phong cách ứng dụng Desktop */}
      <div className="bg-slate-100/80 rounded-3xl p-4 md:p-6 shadow-xl border border-slate-200/60">
        {/* HEADER BAR CỦA BẢNG: Nút giao diện + Tabs + Badges */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-6 border-b border-slate-200/80 px-2">
          {/* Badges thông tin góc phải */}
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              10,000+ hợp đồng
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-700">
              <ShieldCheck className="w-3.5 h-3.5" />
              Bảo đảm chất lượng
            </span>
          </div>
        </div>

        {/* THÂN BẢNG: Cột Sidebar trái & Cột Danh sách phải */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* CỘT TRÁI: SIDEBAR (4 Cột) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Box Danh mục */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 space-y-4">
              <h3 className="font-bold text-slate-800 text-sm">
                Danh mục phổ biến
              </h3>

              {/* Input tìm danh mục */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm kiếm danh mục..."
                  value={searchCategory}
                  onChange={(e) => setSearchCategory(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 pr-8 text-slate-700 focus:outline-none focus:border-blue-500"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
              </div>

              {/* List danh mục */}
              <ul className="space-y-2 text-xs text-slate-600 max-h-[380px] overflow-y-auto pr-1">
                {filteredCategories.map((cat, index) => (
                  <li
                    key={index}
                    className={`cursor-pointer hover:text-blue-600 transition truncate flex items-center gap-1 ${
                      cat.isHot ? "font-bold text-slate-800" : ""
                    }`}
                  >
                    <span>•</span>
                    <span>{cat.name}</span>
                  </li>
                ))}
              </ul>

              <button className="w-full py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 transition">
                Xem thêm
              </button>
            </div>

            {/* Box Đảm bảo chất lượng */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 space-y-2.5 text-xs">
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
          <div className="lg:col-span-8 space-y-3">
            {CONTRACT_LIST.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl p-3.5 md:p-4 shadow-sm border border-slate-200/80 hover:shadow-md transition flex flex-col md:flex-row items-start md:items-center justify-between gap-3"
              >
                {/* Trái: Icon Word + Tên + Thông số */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {/* Icon giả lập file Word màu xanh nước biển */}
                  <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm mt-0.5">
                    W
                  </div>

                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/hop-dong/${item.id}`}
                        className="font-semibold text-slate-900 text-sm hover:text-blue-600 transition line-clamp-1"
                      >
                        {item.title}
                      </Link>
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-100">
                        <Flame className="w-3 h-3 text-amber-500 fill-amber-500" />
                        {item.badge}
                      </span>
                    </div>

                    {/* Đánh giá, Lượt xem, Lượt tải */}
                    <div className="flex items-center gap-3 text-xs text-slate-500">
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
                  <span className="text-xs text-slate-400 line-through font-medium">
                    {item.originalPrice}
                  </span>
                  <span className="text-base font-extrabold text-emerald-600">
                    {item.price}
                  </span>
                </div>
              </div>
            ))}

            {/* Nút Xem thêm danh sách */}
            <div className="pt-4 text-center">
              <button className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold px-6 py-2.5 rounded-lg transition shadow-sm">
                Xem thêm
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContractCatalog;
