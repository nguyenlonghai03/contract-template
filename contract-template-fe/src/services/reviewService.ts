import { CreateReviewPayload, GetReviewsResponse } from "@/types/review";
import { REVALIDATE } from "@/lib/config";
import { apiGet } from "./apiFetch";
import { axiosClient } from "./axiosClient";

export const reviewsTag = (contractId: number | string) => `reviews-${contractId}`;

// Lấy danh sách đánh giá đã duyệt (gọi từ Server Component, có cache).
// Review được duyệt tự động; sau khi gửi, refreshContractReviews (reviewActions.ts) xoá tag này ngay.
export const getContractReviews = async (contractId: number): Promise<GetReviewsResponse> => {
  return apiGet<GetReviewsResponse>(`/contracts/${contractId}/reviews`, {
    revalidate: REVALIDATE.reviews,
    tags: [reviewsTag(contractId)],
  });
};

// Gửi đánh giá mới
export const createReview = async (payload: CreateReviewPayload): Promise<void> => {
  await axiosClient.post("/reviews", payload);
};
