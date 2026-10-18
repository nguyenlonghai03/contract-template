"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface ContractInformationProps {
  slug?: string;
}

export default function ContractInformation({
  slug,
}: ContractInformationProps) {
  // Quản lý Tab được chọn ("overview" | "guide")
  const [activeTab, setActiveTab] = useState<"overview" | "guide">("overview");

  // Quản lý trạng thái Xem thêm / Thu gọn
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden space-y-6">
      {/* ================= 1. THANH TAB ĐIỀU HƯỚNG ================= */}
      <div className="flex border-b border-slate-200/80 px-6 pt-4">
        <button
          onClick={() => setActiveTab("overview")}
          className={`flex-1 pb-3 text-sm md:text-base font-semibold text-center transition border-b-2 relative ${
            activeTab === "overview"
              ? "border-emerald-600 text-emerald-600 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          Giới thiệu
        </button>

        <button
          onClick={() => setActiveTab("guide")}
          className={`flex-1 pb-3 text-sm md:text-base font-semibold text-center transition border-b-2 relative ${
            activeTab === "guide"
              ? "border-emerald-600 text-emerald-600 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <span>Hướng dẫn</span>
          {/* Dấu chấm màu xanh nhỏ góc phải Tab Hướng dẫn */}
          <span className="absolute top-0 right-1/4 w-2 h-2 bg-emerald-500 rounded-full" />
        </button>
      </div>

      <div className="p-6 md:p-8 pt-0 space-y-6 text-slate-700 leading-relaxed text-sm md:text-base">
        {/* ================= TAB 1: GIỚI THIỆU ================= */}
        {activeTab === "overview" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Khối tóm tắt đầu trang */}
            <div className="bg-slate-50/80 border border-slate-200/70 rounded-xl p-4 text-slate-700 text-sm leading-relaxed">
              Biên bản thanh lý hợp đồng chuyển nhượng salon tóc được sử dụng để
              xác nhận việc các bên đã hoàn tất các thỏa thuận liên quan đến
              chuyển nhượng salon. Văn bản ghi nhận tình trạng bàn giao tài sản,
              thanh toán và chấm dứt quyền, nghĩa vụ của các bên.
            </div>

            {/* Khối Nội dung chính có tính năng Xem thêm / Thu gọn */}
            <div className="relative">
              <div
                className={`space-y-6 transition-all duration-300 overflow-hidden ${
                  !isExpanded ? "max-h-[320px]" : "max-h-none"
                }`}
              >
                {/* Mục 1: Thông tin hợp đồng */}
                <div className="space-y-3">
                  <h3 className="text-lg md:text-xl font-bold text-slate-900">
                    Thông tin hợp đồng
                  </h3>
                  <p>
                    Biên bản thanh lý hợp đồng chuyển nhượng salon tóc được lập
                    khi bên chuyển nhượng và bên nhận chuyển nhượng đã hoàn
                    thành việc bàn giao salon hoặc thống nhất kết thúc hợp đồng.
                    Văn bản giúp xác nhận giá trị chuyển nhượng, tình trạng
                    thanh toán, mặt bằng, nội thất, máy móc, thiết bị và các tài
                    sản được chuyển giao kèm salon.
                  </p>
                  <p>
                    Đối với salon tóc, giao dịch chuyển nhượng thường bao gồm
                    nhiều tài sản phục vụ kinh doanh như ghế cắt tóc, giường
                    gội, máy sấy, máy hấp tóc, gương, tủ kệ, máy tính, camera,
                    biển hiệu và các sản phẩm chăm sóc tóc. Ngoài ra, hai bên có
                    thể phải đối chiếu tiền thuê mặt bằng, tiền đặt cọc, hàng
                    tồn kho và công nợ. Vì vậy, biên bản thanh lý căn ghi nhận
                    cụ thể các nội dung đã hoàn tất để hạn chế tranh chấp sau
                    khi bàn giao.
                  </p>
                </div>

                {/* Mục 2: Tầm quan trọng */}
                <div className="space-y-3">
                  <h3 className="text-lg md:text-xl font-bold text-slate-900">
                    Tầm quan trọng của biên bản thanh lý hợp đồng chuyển nhượng
                    salon tóc
                  </h3>
                  <p>
                    Salon tóc có thể được chuyển nhượng cùng lúc cả mặt bằng
                    kinh doanh, trang thiết bị, nội thất, hàng hóa và các tài
                    sản khác. Nếu chỉ xác nhận bằng lời nói rằng đã hoàn tất
                    chuyển nhượng, các bên có thể gặp khó khăn khi xác định
                    chính xác những gì đã được bàn giao và nghĩa vụ nào đã kết
                    thúc.
                  </p>
                  <p>
                    Biên bản thanh lý hợp đồng chuyển nhượng salon tóc giúp ghi
                    nhận:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-slate-600">
                    <li>
                      Thông tin của bên chuyển nhượng và bên nhận chuyển nhượng.
                    </li>
                    <li>
                      Danh mục thiết bị, công cụ và tài sản bàn giao thực tế.
                    </li>
                    <li>
                      Xác nhận số tiền chuyển nhượng đã thanh toán và công nợ
                      còn lại (nếu có).
                    </li>
                    <li>
                      Cam kết không khiếu nại phát sinh sau khi ký biên bản
                      thanh lý.
                    </li>
                  </ul>
                </div>
              </div>

              {/* Hiệu ứng mờ đè ở dưới khi bị thu gọn */}
              {!isExpanded && (
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none" />
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 2: HƯỚNG DẪN ================= */}
        {activeTab === "guide" && (
          <div className="space-y-6 animate-fadeIn">
            <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 uppercase">
              Hướng dẫn điền BIÊN BẢN THANH LÝ HỢP ĐỒNG CHUYỂN NHƯỢNG SALON TÓC
            </h2>

            <div className="text-sm space-y-1 text-slate-700">
              <p>
                <strong>Tên biên bản:</strong> Biên bản thanh lý hợp đồng chuyển
                nhượng salon tóc
              </p>
              <p>
                <strong>Mục đích:</strong> Xác nhận việc hoàn tất chuyển nhượng
                salon tóc, bàn giao tài sản, đối chiếu thanh toán và xác định
                các quyền, nghĩa vụ còn lại của các bên.
              </p>
            </div>

            <div className="relative">
              <div
                className={`space-y-6 transition-all duration-300 overflow-hidden ${
                  !isExpanded ? "max-h-[380px]" : "max-h-none"
                }`}
              >
                {/* Mục 1 */}
                <div className="space-y-2">
                  <h3 className="text-base md:text-lg font-bold text-slate-900">
                    1. Đối tượng áp dụng
                  </h3>
                  <p>
                    Mẫu biên bản được sử dụng giữa{" "}
                    <strong>bên chuyển nhượng salon tóc</strong> và{" "}
                    <strong>bên nhận chuyển nhượng salon tóc</strong> sau khi
                    các bên hoàn tất những công việc theo hợp đồng.
                  </p>
                  <p>
                    Nếu có kế toán, người quản lý hoặc người được ủy quyền tham
                    gia đối chiếu tài chính thì cần ghi rõ tư cách tham gia của
                    người đó.
                  </p>
                </div>

                {/* Mục 2 */}
                <div className="space-y-2">
                  <h3 className="text-base md:text-lg font-bold text-slate-900">
                    2. Thông tin về hợp đồng chuyển nhượng
                  </h3>
                  <p>Ghi đầy đủ:</p>
                  <ul className="list-disc pl-5 space-y-1 text-slate-600">
                    <li>Số hợp đồng chuyển nhượng.</li>
                    <li>Ngày ký hợp đồng.</li>
                    <li>
                      Họ tên/tên doanh nghiệp của bên chuyển nhượng và bên nhận
                      chuyển nhượng.
                    </li>
                    <li>Địa chỉ salon tóc.</li>
                    <li>Giá trị chuyển nhượng.</li>
                    <li>
                      Các tài sản, trang thiết bị và quyền lợi được chuyển giao
                      theo hợp đồng.
                    </li>
                    <li>
                      Các phụ lục hoặc thỏa thuận sửa đổi, bổ sung nếu có.
                    </li>
                  </ul>
                  <p className="pt-1">
                    Cần đối chiếu nội dung biên bản thanh lý với hợp đồng gốc để
                    tránh bỏ sót tài sản hoặc nghĩa vụ đã thỏa thuận.
                  </p>
                </div>

                {/* Mục 3 */}
                <div className="space-y-2">
                  <h3 className="text-base md:text-lg font-bold text-slate-900">
                    3. Xác nhận việc bàn giao salon tóc
                  </h3>
                  <p>
                    Đây là nội dung quan trọng của biên bản. Cần xác nhận tình
                    trạng bàn giao thực tế, bao gồm toàn bộ danh mục tài sản và
                    hiện trạng kinh doanh thực tế tại thời điểm bàn giao. Nghĩa
                    vụ chưa hoàn thành cũng cần được ghi rõ bên chịu trách nhiệm
                    và thời hạn xử lý trong biên bản để hạn chế tranh chấp về
                    sau.
                  </p>
                </div>
              </div>

              {/* Hiệu ứng mờ đè ở dưới khi bị thu gọn */}
              {!isExpanded && (
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none" />
              )}
            </div>
          </div>
        )}

        {/* ================= NÚT BẤM XEM THÊM / THU GỌN ================= */}
        <div className="pt-4 border-t border-slate-100 flex justify-center">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-emerald-600 transition bg-white px-4 py-2 rounded-full border border-slate-200/80 shadow-2xs hover:border-emerald-300"
          >
            <span>{isExpanded ? "Thu gọn" : "Xem thêm"}</span>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
