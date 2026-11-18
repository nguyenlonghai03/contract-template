import { useState } from "react";
import { Star, ChevronDown, ChevronUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getAvatarText } from "@/lib/stringUtils";
import { Review } from "@/types/review";

type ReviewListProps = {
  reviews: Review[];
  initialError: boolean;
  onRetry: () => void;
};

export default function ReviewList({ reviews, initialError, onRetry }: ReviewListProps) {
  const [visibleCount, setVisibleCount] = useState(3);

  const displayedReviews = reviews.slice(0, visibleCount);
  const hasMore = reviews.length > visibleCount;

  return (
    <div className="space-y-4">
      {/* HEADER */}

      <h2 id="customer-reviews-heading" className="text-base sm:text-lg font-bold text-slate-900">
        Đánh giá từ khách hàng ({reviews.length})
      </h2>

      {/* ERROR */}

      {initialError ? (
        <div className="py-5 text-center space-y-3" role="alert">
          <p className="text-sm text-red-500">Không thể tải danh sách đánh giá.</p>

          <Button type="button" variant="outline" size="sm" onClick={onRetry}>
            Thử lại
          </Button>
        </div>
      ) : reviews.length === 0 ? (
        /* EMPTY STATE */

        <p className="text-sm text-slate-500 italic py-2">
          Chưa có đánh giá nào cho hợp đồng này. Hãy là người đầu tiên đánh giá!
        </p>
      ) : (
        <>
          {/* REVIEW ITEMS */}

          <ul className="divide-y divide-slate-100">
            {displayedReviews.map((item) => (
              <li key={item.id} className="py-4 first:pt-0 last:pb-1">
                <article className="space-y-2">
                  {/* CUSTOMER INFORMATION */}

                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <span
                        className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-sm flex items-center justify-center shrink-0"
                        aria-hidden="true"
                      >
                        {getAvatarText(item.author_name)}
                      </span>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                          <span className="font-bold text-slate-900 break-words">
                            {item.author_name}
                          </span>

                          <span className="text-slate-300 hidden sm:inline" aria-hidden="true">
                            |
                          </span>

                          <span className="font-medium text-slate-600">{item.phone}</span>

                          <span className="text-slate-300 hidden sm:inline" aria-hidden="true">
                            |
                          </span>

                          <span className="text-slate-400 text-xs sm:text-sm">
                            {item.created_at}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* RATING */}

                    <div
                      className="flex items-center gap-0.5 shrink-0 pl-[42px] sm:pl-0"
                      role="img"
                      aria-label={`Đánh giá ${item.rating} trên 5 sao`}
                    >
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3.5 h-3.5 ${
                            star <= item.rating ? "text-amber-400 fill-amber-400" : "text-slate-200"
                          }`}
                          aria-hidden="true"
                        />
                      ))}
                    </div>
                  </div>

                  {/* COMMENT */}

                  <p className="text-sm text-slate-600 leading-relaxed pl-[42px] whitespace-pre-line break-words">
                    {item.comment}
                  </p>
                </article>
              </li>
            ))}
          </ul>

          {/* SHOW MORE / COLLAPSE */}

          {(hasMore || visibleCount > 3) && (
            <div className="pt-2 flex justify-center">
              {hasMore ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setVisibleCount((prev) => prev + 3)}
                  className="text-sm font-semibold text-slate-600 hover:text-slate-900 border-slate-200 rounded-xl gap-1.5"
                >
                  Xem thêm
                  <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setVisibleCount(3)}
                  className="text-sm font-semibold text-slate-600 hover:text-slate-900 border-slate-200 rounded-xl gap-1.5"
                >
                  Thu gọn
                  <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
                </Button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
