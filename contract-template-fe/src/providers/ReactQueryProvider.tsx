"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, ReactNode } from "react";

export default function ReactQueryProvider({
  children,
}: {
  children: ReactNode;
}) {
  // Tạo QueryClient instance duy nhất cho Client
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Dữ liệu sẽ được coi là "mới" trong 1 phút (không refetch liên tục)
            staleTime: 60 * 1000,
            // Tự động refetch lại khi ngầm chuyển tab/focus lại trang
            refetchOnWindowFocus: false,
            // Số lần thử lại khi request thất bại
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
