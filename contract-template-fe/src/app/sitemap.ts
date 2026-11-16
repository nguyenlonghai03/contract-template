import type { MetadataRoute } from "next";
import { getContracts } from "@/services/contractApi";

// Lấy toàn bộ hợp đồng đã Published để liệt kê URL thật trong sitemap,
// thay vì khai báo tay. limit lớn vì /api/contracts đã lọc status=published
// phía backend (xem contract_controller.go GetContracts).
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://hopdongphaply.vn";

  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/tim-kiem`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  try {
    const response = await getContracts(1, 200);

    // Lưu ý: Contract.updatedAt (camelCase) không khớp field thật của API
    // (backend trả "updated_at", snake_case) nên không dùng được type-safe ở
    // đây — dùng thời điểm build sitemap làm lastModified thay vì sai lệch.
    const contractUrls: MetadataRoute.Sitemap = response.data.map(
      (contract) => ({
        url: `${baseUrl}/hop-dong/${contract.slug}-${contract.id}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      }),
    );

    return [...staticUrls, ...contractUrls];
  } catch (error) {
    console.error("Lỗi khi tạo sitemap từ API hợp đồng:", error);
    return staticUrls;
  }
}
