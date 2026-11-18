"use server";

import { updateTag } from "next/cache";

import { reviewsTag } from "./reviewService";

// Gọi sau khi khách gửi đánh giá thành công: review được duyệt tự động nên xoá
// ngay Data Cache danh sách review của hợp đồng để khách thấy review của mình.
export async function refreshContractReviews(contractId: number): Promise<void> {
  if (!Number.isSafeInteger(contractId) || contractId <= 0) return;

  updateTag(reviewsTag(contractId));
}
