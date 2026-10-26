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

// ================= 4. TRÌNH XEM TRƯỚC TÀI LIỆU (DOCUMENT VIEWER) =================
export type ContractPage = {
  pageNumber: number;
  thumbnailUrl?: string;
  textContent?: string;
  isSecured?: boolean;
};

// ================= 5. PROPS CHO CÁC COMPONENT CHÍNH =================
export type ContractDetailPageProps = {
  contract: Contract;
  initialReviews: ContractReview[];
  relatedContracts: Contract[];
};

export type ContractDocumentViewerProps = {
  slug: string;
  pages?: ContractPage[];
};

export type ContractInformationProps = {
  contract: Contract;
};

export type ContractPurchaseCardProps = {
  contract: Contract;
};

export type ContractReviewsProps = {
  contractId: string;
  initialReviews: ContractReview[];
};
