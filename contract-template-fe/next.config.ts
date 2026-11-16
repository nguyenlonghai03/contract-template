import type { NextConfig } from "next";

// Cho phép next/image tải ảnh từ chính backend đang cấu hình (thay vì chỉ
// localhost:8080 như trước — production sẽ bị chặn).
const apiUrl = new URL(
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api",
);
const apiProtocol = apiUrl.protocol.replace(":", "") as "http" | "https";

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },

  experimental: {
    // Giữ trang động (trang chủ/tìm kiếm có searchParams) trong client cache
    // 30s: bấm "Back" từ trang chi tiết về danh sách hiển thị tức thì thay vì
    // gọi lại server. Trang tĩnh/ISR (chi tiết hợp đồng) giữ 5 phút.
    staleTimes: {
      dynamic: 30,
      static: 300,
    },
  },

  images: {
    remotePatterns: [
      {
        protocol: apiProtocol,
        hostname: apiUrl.hostname,
        port: apiUrl.port,
        pathname: "/storage/**",
      },
      {
        protocol: apiProtocol,
        hostname: apiUrl.hostname,
        port: apiUrl.port,
        pathname: "/api/previews/**",
      },
    ],

    // Chỉ bật trong môi trường development
    dangerouslyAllowLocalIP: process.env.NODE_ENV === "development",
  },
};

export default nextConfig;
