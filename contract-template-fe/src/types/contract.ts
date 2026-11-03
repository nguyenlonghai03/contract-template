// ================= 1. HỢP ĐỒNG (CONTRACT) =================
export type Contract = {
  id: string;
  slug: string;
  code: string;
  title: string;
  categoryId: string;
  categoryName?: string;
  price: number;
  originalPrice: number;
  viewCount: number;
  downloadCount: number;
  description: string;
  contentOverview?: string;
  contentGuide?: string;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
  views: number;
  rating: number;
  downloads: number;
  preview_images: string[];
};

export type ContractType = {
  id: string;
  name: string;
  slug?: string;
};

export type ContractResponse = {
  data: Contract[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

// ================= 2. ĐÁNH GIÁ (REVIEWS) =================
export type ContractReview = {
  id: string;
  contractId: string;
  avatarText: string;
  name: string;
  phone: string;
  rating: number;
  content: string;
  date: string;
  isApproved?: boolean;
};

// ================= 3. THANH TOÁN & ĐƠN HÀNG (PAYMENT & ORDER) =================
export type PaymentOrder = {
  orderId: string;
  contractSlug: string;
  amount: number;
  bankName: string;
  accountNo: string;
  accountName: string;
  transferContent: string;
  status: "PENDING" | "SUCCESS" | "CANCELLED";
  qrCodeUrl?: string;
};

export type PaymentStatusResponse = {
  success: boolean;
  message: string;
  status: "Pending" | "Success" | "Cancelled";
};
