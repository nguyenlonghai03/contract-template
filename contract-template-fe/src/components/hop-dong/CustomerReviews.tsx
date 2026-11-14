import { connection } from "next/server";

import { getContractReviews } from "@/services/reviewService";
import type { GetReviewsResponse } from "@/types/review";
import CustomerReviewsClient from "./CustomerReviewsClient";

type CustomerReviewsProps = {
  contractId: string;
};

type Review = NonNullable<GetReviewsResponse["data"]>[number];

// Che số điện thoại ngay tại server trước khi gửi xuống client
function maskPhoneNumber(phone: string): string {
  if (!phone || phone.length < 7) return phone;

  return `${phone.slice(0, 3)}****${phone.slice(-3)}`;
}

export default async function CustomerReviews({
  contractId,
}: CustomerReviewsProps) {
  // Đảm bảo dữ liệu được lấy khi có request thực tế,
  // không bị cố định tại thời điểm build.
  await connection();

  const numericContractId = Number(contractId);

  const isValidContractId =
    Number.isSafeInteger(numericContractId) && numericContractId > 0;

  let initialReviews: Review[] = [];
  let initialError = false;

  if (isValidContractId) {
    try {
      const response = await getContractReviews(numericContractId);

      // Chỉ truyền thông tin đã được che số điện thoại xuống client
      initialReviews = (response?.data ?? []).map((review) => ({
        ...review,
        phone: maskPhoneNumber(review.phone),
      }));
    } catch (error) {
      console.error("Failed to fetch customer reviews:", error);
      initialError = true;
    }
  }

  return (
    <CustomerReviewsClient
      contractId={contractId}
      initialReviews={initialReviews}
      initialError={initialError}
    />
  );
}
