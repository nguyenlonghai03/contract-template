import { CreateReviewPayload, GetReviewsResponse } from "@/types/review";
import { axiosClient } from "./axiosClient";

// 4. Object chứa các hàm API service
// Hàm lấy danh sách đánh giá
export const getContractReviews = async (
  contractId: number,
): Promise<GetReviewsResponse> => {
  const response = (await axiosClient.get(
    `/contracts/${contractId}/reviews`,
  )) as GetReviewsResponse;
  return response;
};

// Hàm gửi đánh giá mới
export const createReview = async (
  payload: CreateReviewPayload,
): Promise<void> => {
  await axiosClient.post("/reviews", payload);
};
