import { getContractReviews } from "@/services/reviewService";
import type { Review } from "@/types/review";
import { Skeleton } from "@/components/ui/skeleton";
import CustomerReviewsClient from "./CustomerReviewsClient";

type ReviewsResult = {
  reviews: Review[];
  error: boolean;
};

// Che số điện thoại ngay tại server trước khi gửi xuống client
function maskPhoneNumber(phone: string): string {
  if (!phone || phone.length < 7) return phone;

  return `${phone.slice(0, 3)}****${phone.slice(-3)}`;
}

// Tải đánh giá của 1 hợp đồng. Không bao giờ reject để có thể khởi chạy sớm
// (song song với API chi tiết hợp đồng) mà không sinh unhandled rejection.
export async function loadContractReviews(
  contractId: number,
): Promise<ReviewsResult> {
  if (!Number.isSafeInteger(contractId) || contractId <= 0) {
    return { reviews: [], error: false };
  }

  try {
    const response = await getContractReviews(contractId);

    // Chỉ truyền thông tin đã được che số điện thoại xuống client
    return {
      reviews: (response?.data ?? []).map((review) => ({
        ...review,
        phone: maskPhoneNumber(review.phone),
      })),
      error: false,
    };
  } catch (error) {
    console.error("Failed to fetch customer reviews:", error);
    return { reviews: [], error: true };
  }
}

type CustomerReviewsProps = {
  contractId: string;
  reviewsPromise: Promise<ReviewsResult>;
};

export default async function CustomerReviews({
  contractId,
  reviewsPromise,
}: CustomerReviewsProps) {
  const { reviews, error } = await reviewsPromise;

  return (
    <CustomerReviewsClient
      contractId={contractId}
      initialReviews={reviews}
      initialError={error}
    />
  );
}

export function CustomerReviewsSkeleton() {
  return (
    <section
      aria-busy="true"
      aria-label="Đang tải đánh giá"
      className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-4 sm:p-6 md:p-8 space-y-4"
    >
      <Skeleton className="h-6 w-56" />
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-16 w-full" />
    </section>
  );
}
