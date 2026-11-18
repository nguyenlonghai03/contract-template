import type { MetadataRoute } from "next";
import { getContracts } from "@/services/contractApi";

// Backend giới hạn tối đa 200 bản ghi / trang (maxPageLimit).
const PAGE_SIZE = 200;
// Chặn vòng lặp vô hạn nếu backend trả totalPages sai.
const MAX_PAGES = 50;

// Liệt kê TOÀN BỘ hợp đồng đã Published (phân trang tới hết), lastModified
// lấy theo updated_at thật của từng hợp đồng.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://hopdongphaply.vn";

  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/tim-kiem`,
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  try {
    const contractUrls: MetadataRoute.Sitemap = [];

    for (let page = 1; page <= MAX_PAGES; page++) {
      const response = await getContracts(page, PAGE_SIZE);

      for (const contract of response.data) {
        const updatedAt = new Date(contract.updated_at);

        contractUrls.push({
          url: `${baseUrl}/hop-dong/${contract.slug}-${contract.id}`,
          ...(Number.isNaN(updatedAt.getTime()) ? {} : { lastModified: updatedAt }),
          changeFrequency: "weekly",
          priority: 0.8,
        });
      }

      if (page >= response.totalPages || response.data.length === 0) break;
    }

    return [...staticUrls, ...contractUrls];
  } catch (error) {
    console.error("Lỗi khi tạo sitemap từ API hợp đồng:", error);
    return staticUrls;
  }
}
