import { cache, Suspense } from "react";
import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";

import ContractDocumentViewer from "@/components/hop-dong/ContractDocumentViewer";
import ContractInformation from "@/components/hop-dong/ContractInformation";
import ContractPurchaseCard from "@/components/hop-dong/ContractPurchaseCard";
import CustomerReviews, {
  CustomerReviewsSkeleton,
  loadContractReviews,
} from "@/components/hop-dong/CustomerReviews";
import { resolveBackendUrl, SITE_URL } from "@/lib/config";
import { ApiError } from "@/services/apiFetch";
import { getContractById } from "@/services/contractApi";
import type { Contract } from "@/types/contract";

// ISR: trang được render lần đầu khi có người truy cập rồi cache lại, sau đó
// revalidate nền. Nhờ là route static, <Link> ở trang danh sách prefetch được
// TOÀN BỘ trang chi tiết nên bấm vào là hiển thị ngay, không chờ server.
export const revalidate = 300;

// Mảng rỗng = không prerender lúc build (không phụ thuộc backend khi build),
// mọi slug được render theo yêu cầu ở lần truy cập đầu rồi cache (ISR).
export async function generateStaticParams() {
  return [];
}

// Tách lấy ID ở cuối slug (ví dụ "mau-hop-dong-thue-nha-tro-60" -> "60").
// Chỉ chấp nhận số nguyên dương để không gọi backend với slug rác.
function getIdFromSlug(slug: string): string | undefined {
  const id = slug?.split("-").pop();
  return id && /^[1-9]\d*$/.test(id) ? id : undefined;
}

function contractPath(contract: Contract): string {
  return `/hop-dong/${contract.slug}-${contract.id}`;
}

// cache() khử trùng lặp: generateMetadata và Page dùng chung 1 lần gọi API.
// Trả null khi backend báo 404; lỗi khác (mạng, 5xx) được ném ra để error.tsx
// xử lý — tránh cache nhầm trang 404 khi backend chỉ lỗi tạm thời.
const getContract = cache(async (id: string): Promise<Contract | null> => {
  try {
    const response = await getContractById(id);
    return response?.data ?? null;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
});

type ContractDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({ params }: ContractDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const id = getIdFromSlug(slug);

  if (!id) return {};

  try {
    const contract = await getContract(id);
    if (!contract) return {};

    // Canonical luôn là URL chuẩn (slug thật + id), không phải slug trên URL.
    const url = `${SITE_URL}${contractPath(contract)}`;
    const description = contract.description?.slice(0, 160);
    const previewImage = contract.preview_images?.[0];
    const imageUrl = previewImage ? resolveBackendUrl(previewImage) : undefined;

    return {
      title: contract.title,
      description,
      alternates: { canonical: url },
      openGraph: {
        title: contract.title,
        description,
        url,
        type: "website",
        ...(imageUrl ? { images: [imageUrl] } : {}),
      },
    };
  } catch (error) {
    console.error("Lỗi khi tạo metadata hợp đồng:", error);
    return {};
  }
}

export default async function ContractDetailPage({ params }: ContractDetailPageProps) {
  const { slug } = await params;
  const id = getIdFromSlug(slug);

  if (!id) notFound();

  // Gọi đánh giá SONG SONG với chi tiết hợp đồng (trước đây chạy nối tiếp,
  // tốn thêm 1 round-trip tới backend). Promise này không bao giờ reject.
  const reviewsPromise = loadContractReviews(Number(id));

  const contract = await getContract(id);

  if (!contract) notFound();

  // /hop-dong/abc-60 và URL đúng đều render được: chuyển 308 về URL chuẩn để
  // không bị index trùng nội dung.
  const canonicalPath = contractPath(contract);
  if (`/hop-dong/${slug}` !== canonicalPath) permanentRedirect(canonicalPath);

  return (
    <div className="bg-slate-50 min-h-screen py-5 md:py-8">
      <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-6 md:space-y-8">
        {/* BỐ CỤC CHÍNH */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* CỘT TRÁI */}
          <div className="lg:col-span-8 space-y-6 md:space-y-8">
            <ContractDocumentViewer contract={contract} />

            <ContractInformation contract={contract} />
          </div>

          {/* CỘT PHẢI */}
          <div className="lg:col-span-4">
            <div className="space-y-6 lg:sticky lg:top-24">
              <ContractPurchaseCard contract={contract} />
            </div>
          </div>
        </div>

        {/* ĐÁNH GIÁ KHÁCH HÀNG — stream riêng, không chặn phần nội dung chính */}
        <Suspense fallback={<CustomerReviewsSkeleton />}>
          <CustomerReviews contractId={String(contract.id)} reviewsPromise={reviewsPromise} />
        </Suspense>
      </div>
    </div>
  );
}
