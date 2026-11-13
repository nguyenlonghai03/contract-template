// 1. Interface cho dữ liệu 1 đánh giá trả về từ API
export type ReviewItem = {
  id: number;
  contract_id: number;
  author_name: string;
  phone: string;
  rating: number;
  comment: string;
  is_approved: boolean;
  created_at: string;
};

// 2. Interface cho Response từ API GET /contracts/:id/reviews
export type GetReviewsResponse = {
  total: number;
  data: ReviewItem[] | null;
};

// 3. Interface cho Payload gửi lên ở API POST /reviews
export type CreateReviewPayload = {
  contract_id: number;
  author_name: string;
  phone: string;
  rating: number;
  comment: string;
};
