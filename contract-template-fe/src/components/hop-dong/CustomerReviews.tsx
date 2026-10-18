"use client";

import { useState } from "react";
import { Star, ChevronDown } from "lucide-react";

interface ReviewItem {
  id: string;
  avatarText: string;
  name: string;
  phone: string;
  date: string;
  content: string;
}

export default function CustomerReviews() {
  // Dữ liệu mẫu chính xác theo hình ảnh
  const [reviews, setReviews] = useState<ReviewItem[]>([
    {
      id: "1",
      avatarText: "QT",
      name: "Quang Trường",
      phone: "096****567",
      date: "10/04/2025",
      content:
        "Là chuyên viên pháp chế, tôi đánh giá cao tính chính xác của các mẫu hợp đồng. Đề xuất thêm tính năng kiểm tra tính hợp lệ của văn bản theo quy định hiện hành.",
    },
    {
      id: "2",
      avatarText: "HVT",
      name: "Hoàng Văn Tú",
      phone: "096****012",
      date: "08/04/2025",
      content:
        "phí tải quá mềm, ai từng ngồi tự soạn word mới biết nó cực đến cỡ nào.",
    },
    {
      id: "3",
      avatarText: "TH",
      name: "Thu Hương",
      phone: "098****219",
      date: "05/04/2025",
      content:
        "Tôi là kế toán và thấy các mẫu hợp đồng tài chính rất chuyên nghiệp. Mong dự án sẽ thêm tính năng tự động điền thông tin từ dữ liệu có sẵn.",
    },
    {
      id: "3",
      avatarText: "TH",
      name: "Thu Hương",
      phone: "098****219",
      date: "05/04/2025",
      content:
        "Tôi là kế toán và thấy các mẫu hợp đồng tài chính rất chuyên nghiệp. Mong dự án sẽ thêm tính năng tự động điền thông tin từ dữ liệu có sẵn.",
    },
  ]);

  // States quản lý Form gửi đánh giá
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [commentText, setCommentText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const newReview: ReviewItem = {
      id: Date.now().toString(),
      avatarText: "KH",
      name: "Khách hàng",
      phone: "091****888",
      date: new Date().toLocaleDateString("vi-VN"),
      content: commentText,
    };

    setReviews([newReview, ...reviews]);
    setCommentText("");
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 md:p-8 space-y-6 text-slate-800">
      {/* Tiêu đề phần đánh giá */}
      <h3 className="text-base md:text-lg font-bold text-slate-900">
        Đánh giá từ khách hàng ({reviews.length})
      </h3>

      {/* Danh sách các đánh giá */}
      <div className="divide-y divide-slate-100">
        {reviews.map((item) => (
          <div key={item.id} className="py-5 first:pt-0 last:pb-2 space-y-2">
            {/* Header thông tin người dùng */}
            <div className="flex items-center gap-2 text-xs md:text-sm">
              {/* Badge Avatar dạng chữ cái đầu */}
              <span className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-xs flex items-center justify-center shrink-0">
                {item.avatarText}
              </span>

              {/* Tên | SĐT | Ngày */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-slate-900">{item.name}</span>
                <span className="text-slate-300 font-light">|</span>
                <span className="font-medium text-slate-700">{item.phone}</span>
                <span className="text-slate-400 text-xs ml-1">{item.date}</span>
              </div>
            </div>

            {/* Nội dung đánh giá */}
            <p className="text-xs md:text-sm text-slate-600 leading-relaxed pl-9">
              {item.content}
            </p>
          </div>
        ))}
      </div>

      {/* Nút Xem thêm đánh giá */}
      <div className="flex justify-center pt-2">
        <button className="flex items-center gap-1.5 px-5 py-2 text-xs md:text-sm font-medium text-slate-700 bg-white border border-slate-200/90 rounded-xl hover:bg-slate-50 transition shadow-2xs">
          <ChevronDown className="w-4 h-4 text-slate-500" />
          <span>Xem thêm đánh giá</span>
        </button>
      </div>

      {/* Khung Nhập Đánh Giá Mới */}
      <form onSubmit={handleSubmit} className="pt-4 space-y-4">
        <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-white focus-within:border-emerald-500 transition">
          {/* Chọn số sao đánh giá */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Đánh giá</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="focus:outline-none transition"
                >
                  <Star
                    className={`w-4 h-4 ${
                      star <= (hoverRating || rating)
                        ? "text-amber-400 fill-amber-400"
                        : "text-amber-400 stroke-[1.5]"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Ô nhập nội dung đánh giá */}
          <textarea
            rows={3}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Hãy để lại những đánh giá mang tính xây dựng, các bình luận sẽ được kiểm duyệt!"
            className="w-full text-xs md:text-sm text-slate-700 placeholder-slate-400 focus:outline-none bg-transparent resize-y"
          />
        </div>

        {/* Nút Gửi đánh giá */}
        <div>
          <button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs md:text-sm px-5 py-2.5 rounded-xl transition shadow-sm"
          >
            Gửi đánh giá
          </button>
        </div>
      </form>
    </div>
  );
}
