import { Skeleton } from "@/components/ui/skeleton";

// Skeleton có cùng bố cục với trang chi tiết (viewer bên trái, thẻ mua bên
// phải) để khi nội dung thật thay vào không bị nhảy layout.
export default function Loading() {
  return (
    <div
      className="bg-slate-50 min-h-screen py-5 md:py-8"
      aria-busy="true"
      aria-label="Đang tải mẫu hợp đồng"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* VIEWER */}
          <div className="lg:col-span-8">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm md:p-5">
              <div className="grid h-[min(78vh,720px)] min-h-[420px] grid-cols-[64px_minmax(0,1fr)] gap-2 rounded-xl bg-slate-100/90 p-2 sm:grid-cols-[80px_minmax(0,1fr)] sm:gap-3 sm:p-3 md:grid-cols-[100px_minmax(0,1fr)]">
                <div className="space-y-3">
                  <Skeleton className="aspect-[210/297] w-full" />
                  <Skeleton className="aspect-[210/297] w-full" />
                  <Skeleton className="aspect-[210/297] w-full" />
                </div>
                <Skeleton className="h-full w-full rounded-lg" />
              </div>
            </div>
          </div>

          {/* PURCHASE CARD */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 p-4 sm:p-6 space-y-5">
              <Skeleton className="h-6 w-32 rounded-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-20 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
              <div className="space-y-2.5 pt-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
