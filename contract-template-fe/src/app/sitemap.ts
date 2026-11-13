import type { MetadataRoute } from "next";

//Đây mới là sitemap cơ bản. Sau này chúng ta sẽ bổ sung URL của từng hợp đồng lấy từ database/API. Không nên khai báo hàng nghìn URL bằng tay.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://hopdongphaply.vn";

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/hop-dong`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];
}
