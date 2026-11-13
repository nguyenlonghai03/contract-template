import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <Skeleton className="h-5 w-48" />

      <div className="bg-white rounded-2xl p-6 space-y-5">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/3" />

        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>

        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    </div>
  );
}
