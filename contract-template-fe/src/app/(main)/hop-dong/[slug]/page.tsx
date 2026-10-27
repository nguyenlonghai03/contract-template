import ContractDocumentViewer from "@/components/hop-dong/ContractDocumentViewer";
import ContractInformation from "@/components/hop-dong/ContractInformation";
import ContractPurchaseCard from "@/components/hop-dong/ContractPurchaseCard";
import CustomerReviews from "@/components/hop-dong/CustomerReviews";
import LawyerConsultBanner from "@/components/hop-dong/LawyerConsultBanner";

type ContractDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ContractDetailPage({
  params,
}: ContractDetailPageProps) {
  // Lấy ID từ chuỗi slug (ví dụ "mau-hop-dong-thue-nha-tro-60" -> lấy số 60)
  const { slug } = await params;
  // 2. Tách lấy ID ở cuối chuỗi slug
  const id = slug ? slug.split("-").pop() : undefined;

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 space-y-8">
        {/* BỐ CỤC 2 CỘT CHÍNH */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* CỘT TRÁI (8 Cột): Document Viewer & Thông tin bài viết */}
          <div className="lg:col-span-8 space-y-8">
            {/* 1. Trình xem trước file Word/PDF */}
            <ContractDocumentViewer />

            {/* 2. Chi tiết mô tả & Bình luận đánh giá */}
            <ContractInformation />
            <CustomerReviews />
          </div>

          {/* CỘT PHẢI (4 Cột): Giá tiền, Nút Tải ngay & Banner tư vấn */}
          <div className="lg:col-span-4 space-y-6 sticky top-24">
            {/* 1. Card Mua / Tải hợp đồng */}
            <ContractPurchaseCard />

            {/* 2. Banner Luật sư tư vấn */}
            <LawyerConsultBanner />
          </div>
        </div>
      </div>
    </div>
  );
}
