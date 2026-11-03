import ContractCatalog from "@/components/trang-chu/ContractCatalog";
import SearchBox from "@/components/trang-chu/SearchBox";
import { Suspense } from "react";

export default function SearchPage() {
  return (
    <div className="bg-slate-50 min-h-screen pb-12">
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-4 space-y-4 pt-[100px]">
        <Suspense>
          <SearchBox />
          <ContractCatalog />
        </Suspense>
      </div>
    </div>
  );
}
