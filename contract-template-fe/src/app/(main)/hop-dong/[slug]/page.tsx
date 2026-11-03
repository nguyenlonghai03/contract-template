import ContractDocumentViewer from "@/components/hop-dong/ContractDocumentViewer";
import ContractInformation from "@/components/hop-dong/ContractInformation";
import ContractPurchaseCard from "@/components/hop-dong/ContractPurchaseCard";
import CustomerReviews from "@/components/hop-dong/CustomerReviews";
import LawyerConsultBanner from "@/components/hop-dong/LawyerConsultBanner";
import { getContractById } from "@/services/contractApi";
import { notFound } from "next/navigation";

type ContractDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ContractDetailPage({
  params,
}: ContractDetailPageProps) {
  // 1. Lấy slug từ params (Next.js 15)
  const { slug } = await params;

  // 2. Tách lấy ID ở cuối chuỗi slug (ví dụ "mau-hop-dong-thue-nha-tro-60" -> "60")
  const id = slug ? slug.split("-").pop() : undefined;

  if (!id) {
    notFound();
  }

  // 3. Gọi API lấy thông tin chi tiết hợp đồng trực tiếp tại Server
  let contract = null;
  try {
    const response = await getContractById(id);
    contract = response?.data || response;
  } catch (error) {
    console.error("Lỗi khi tải chi tiết hợp đồng:", error);
    notFound(); // Trả về trang 404 nếu không tìm thấy ID hợp đồng
  }

  if (!contract) {
    notFound();
  }

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 space-y-8">
        {/* BỐ CỤC 2 CỘT CHÍNH */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* CỘT TRÁI (8 Cột): Document Viewer & Thông tin bài viết */}
          <div className="lg:col-span-8 space-y-8">
            {/* Truyền object contract chứa preview_images vào component xem trước */}
            <ContractDocumentViewer
              contract={contract}
              baseUrl={process.env.NEXT_API_BASE_URL}
            />

            {/* Truyền thông tin chi tiết hợp đồng vào phần mô tả */}
            <ContractInformation contract={contract} />
            <CustomerReviews />
          </div>

          {/* CỘT PHẢI (4 Cột): Giá tiền, Nút Tải ngay & Banner tư vấn */}
          <div className="lg:col-span-4 space-y-6 sticky top-24">
            {/* Truyền thông tin giá, id hợp đồng vào card mua hàng */}
            <ContractPurchaseCard contract={contract} />

            {/* Banner Luật sư tư vấn */}
            {/* <LawyerConsultBanner /> */}
          </div>
        </div>
      </div>
    </div>
  );
}
