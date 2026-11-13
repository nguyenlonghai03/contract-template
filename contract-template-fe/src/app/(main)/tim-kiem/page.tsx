import ContractCatalog from "@/components/trang-chu/ContractCatalog";
import SearchBox from "@/components/trang-chu/SearchBox";

interface SearchPageProps {
  searchParams: Promise<{
    keyword?: string;
    type?: string;
    page?: string;
  }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const currentPage = Math.max(1, Number(params.page) || 1);

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <div className="mx-auto max-w-7xl space-y-4 px-4 pt-[100px] md:px-6">
        <SearchBox />
        <ContractCatalog
          searchQuery={params.keyword || ""}
          selectedType={params.type || ""}
          currentPage={currentPage}
          basePath="/tim-kiem"
        />
      </div>
    </div>
  );
}
