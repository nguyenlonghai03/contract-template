"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

import { Skeleton } from "@/components/ui/skeleton";
import { CustomerReviewsClientProps } from "@/types/review";

import ReviewList from "./ReviewList";

// Form đánh giá nằm cuối trang và kéo theo react-hook-form + zod + axios
// (~250KB JS chưa nén) — tải lazy để không chặn hiển thị trang chi tiết.
const ReviewFormContainer = dynamic(() => import("./ReviewFormContainer"), {
  loading: () => (
    <div className="space-y-3" aria-busy="true">
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
  ),
});

export default function CustomerReviewsClient({
  contractId,
  initialReviews,
  initialError,
}: CustomerReviewsClientProps) {
  const router = useRouter();

  return (
    <section
      aria-labelledby="customer-reviews-heading"
      className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-4 sm:p-6 md:p-8 space-y-6 text-slate-800"
    >
      {/* REVIEW LIST */}
      <ReviewList
        reviews={initialReviews}
        initialError={initialError}
        onRetry={() => router.refresh()}
      />

      {/* REVIEW FORM */}
      <ReviewFormContainer contractId={contractId} />
    </section>
  );
}
