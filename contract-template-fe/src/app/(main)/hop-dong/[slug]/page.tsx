import ContractDocumentViewer from "@/components/hop-dong/ContractDocumentViewer";
import ContractInformation from "@/components/hop-dong/ContractInformation";
import ContractPurchaseCard from "@/components/hop-dong/ContractPurchaseCard";
import CustomerReviews from "@/components/hop-dong/CustomerReviews";
import LawyerConsultBanner from "@/components/hop-dong/LawyerConsultBanner";

interface PageProps {
  params: {
    slug: string;
  };
}

export default async function ContractDetailPage({ params }: PageProps) {
  const { slug } = params;

  // Sau này sẽ fetch data dựa vào slug từ API/Database Go backend
  // const contractData = await getContractBySlug(slug);

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 space-y-8">
        {/* BỐ CỤC 2 CỘT CHÍNH */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* CỘT TRÁI (8 Cột): Document Viewer & Thông tin bài viết */}
          <div className="lg:col-span-8 space-y-8">
            {/* 1. Trình xem trước file Word/PDF */}
            <ContractDocumentViewer slug={slug} />

            {/* 2. Chi tiết mô tả & Bình luận đánh giá */}
            <ContractInformation slug={slug} />
            <CustomerReviews />
          </div>

          {/* CỘT PHẢI (4 Cột): Giá tiền, Nút Tải ngay & Banner tư vấn */}
          <div className="lg:col-span-4 space-y-6 sticky top-24">
            {/* 1. Card Mua / Tải hợp đồng */}
            <ContractPurchaseCard slug={slug} />

            {/* 2. Banner Luật sư tư vấn */}
            <LawyerConsultBanner />
          </div>
        </div>
      </div>
    </div>
  );
}
