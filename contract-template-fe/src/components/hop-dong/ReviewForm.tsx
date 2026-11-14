import { Star, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import type { UseFormReturn, SubmitHandler } from "react-hook-form";
import { ReviewFormValues } from "@/types/reviewSchema";

type ReviewFormProps = {
  form: UseFormReturn<ReviewFormValues>;
  onSubmit: SubmitHandler<ReviewFormValues>;

  rating: number;
  hoverRating: number;

  onRatingChange: (value: number) => void;
  onHoverRatingChange: (value: number) => void;

  isPending: boolean;
  isValidContractId: boolean;

  errorMessage: string;
  successMessage: string;
};

export default function ReviewForm({
  form,
  onSubmit,
  rating,
  hoverRating,
  onRatingChange,
  onHoverRatingChange,
  isPending,
  isValidContractId,
  errorMessage,
  successMessage,
}: ReviewFormProps) {
  const errors = form.formState.errors;

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="pt-5 space-y-4 border-t border-slate-100"
      aria-labelledby="review-form-heading"
    >
      <h3
        id="review-form-heading"
        className="text-sm font-semibold text-slate-900"
      >
        Gửi đánh giá của bạn
      </h3>

      {/* RATING INPUT */}

      <fieldset className="border border-slate-200 rounded-xl p-4 space-y-3">
        <legend className="sr-only">Chất lượng hợp đồng</legend>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-slate-600 font-medium">
            Chất lượng:
          </span>

          <div
            className="flex items-center gap-1"
            onMouseLeave={() => onHoverRatingChange(0)}
          >
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onClick={() => onRatingChange(star)}
                onMouseEnter={() => onHoverRatingChange(star)}
                onFocus={() => onHoverRatingChange(star)}
                onBlur={() => onHoverRatingChange(0)}
                aria-label={`${star} sao`}
                aria-pressed={rating === star}
                className="p-1 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition"
              >
                <Star
                  className={`w-5 h-5 ${
                    star <= (hoverRating || rating)
                      ? "text-amber-400 fill-amber-400"
                      : "text-slate-300"
                  }`}
                  aria-hidden="true"
                />
              </button>
            ))}
          </div>
        </div>
      </fieldset>

      {/* CUSTOMER INFORMATION */}

      <div className="border border-slate-200 rounded-xl p-4 space-y-4 bg-white">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* FULL NAME */}

          <div className="space-y-1.5">
            <label
              htmlFor="review-author-name"
              className="text-sm font-medium text-slate-700"
            >
              Họ và tên
            </label>

            <Input
              id="review-author-name"
              type="text"
              autoComplete="name"
              placeholder="Nhập họ và tên của bạn"
              aria-invalid={!!errors.author_name}
              aria-describedby={
                errors.author_name ? "author-name-error" : undefined
              }
              {...form.register("author_name")}
              className={`text-sm ${
                errors.author_name
                  ? "border-red-300 focus-visible:ring-red-200"
                  : "border-slate-200 focus-visible:ring-emerald-200"
              }`}
            />

            {errors.author_name && (
              <p
                id="author-name-error"
                className="text-xs text-red-500"
                role="alert"
              >
                {errors.author_name.message}
              </p>
            )}
          </div>

          {/* PHONE */}

          <div className="space-y-1.5">
            <label
              htmlFor="review-phone"
              className="text-sm font-medium text-slate-700"
            >
              Số điện thoại
            </label>

            <Input
              id="review-phone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              placeholder="Nhập số điện thoại"
              aria-invalid={!!errors.phone}
              aria-describedby={errors.phone ? "review-phone-error" : undefined}
              {...form.register("phone")}
              className={`text-sm ${
                errors.phone
                  ? "border-red-300 focus-visible:ring-red-200"
                  : "border-slate-200 focus-visible:ring-emerald-200"
              }`}
            />

            {errors.phone && (
              <p
                id="review-phone-error"
                className="text-xs text-red-500"
                role="alert"
              >
                {errors.phone.message}
              </p>
            )}
          </div>
        </div>

        {/* COMMENT */}

        <div className="space-y-1.5">
          <label
            htmlFor="review-comment"
            className="text-sm font-medium text-slate-700"
          >
            Nội dung đánh giá
          </label>

          <Textarea
            id="review-comment"
            rows={5}
            placeholder="Chia sẻ trải nghiệm của bạn về hợp đồng..."
            aria-invalid={!!errors.comment}
            aria-describedby={
              errors.comment ? "review-comment-error" : undefined
            }
            {...form.register("comment")}
            className={`w-full min-h-[120px] text-sm resize-y ${
              errors.comment
                ? "border-red-300 focus-visible:ring-red-200"
                : "border-slate-200 focus-visible:ring-emerald-200"
            }`}
          />

          {errors.comment && (
            <p
              id="review-comment-error"
              className="text-xs text-red-500"
              role="alert"
            >
              {errors.comment.message}
            </p>
          )}
        </div>
      </div>

      {/* SUCCESS / ERROR */}

      {errorMessage && (
        <p
          className="text-sm text-red-500 font-medium"
          role="alert"
          aria-live="assertive"
        >
          {errorMessage}
        </p>
      )}

      {successMessage && (
        <p
          className="text-sm text-emerald-600 font-medium"
          role="status"
          aria-live="polite"
        >
          {successMessage}
        </p>
      )}

      {/* PRIVACY POLICY */}

      <div className="space-y-1 pt-1">
        <div className="flex items-start gap-2.5">
          <input
            type="checkbox"
            id="accept_policy"
            {...form.register("accept_policy")}
            aria-invalid={!!errors.accept_policy}
            aria-describedby={
              errors.accept_policy ? "accept-policy-error" : undefined
            }
            className="mt-1 h-4 w-4 shrink-0 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
          />

          <label
            htmlFor="accept_policy"
            className="text-xs sm:text-sm text-slate-600 leading-relaxed cursor-pointer select-none"
          >
            Tôi đồng ý cho phép thu thập và xử lý số điện thoại, họ tên nhằm mục
            đích hiển thị đánh giá và liên hệ hỗ trợ khi cần thiết. Cam kết bảo
            mật thông tin cá nhân.
          </label>
        </div>

        {errors.accept_policy && (
          <p
            id="accept-policy-error"
            className="text-xs text-red-500 pl-6"
            role="alert"
          >
            {errors.accept_policy.message}
          </p>
        )}
      </div>

      {/* SUBMIT */}

      <div>
        <Button
          type="submit"
          disabled={isPending || !isValidContractId}
          className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition shadow-sm"
        >
          {isPending && (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
          )}

          {isPending ? "Đang gửi đánh giá..." : "Gửi đánh giá"}
        </Button>
      </div>
    </form>
  );
}
