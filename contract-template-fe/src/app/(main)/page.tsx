import Banner from "@/components/trang-chu/Banner";
import ContractCatalog from "@/components/trang-chu/ContractCatalog";

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
    <>
      <Banner />
      <ContractCatalog
        searchQuery={params.keyword || ""}
        selectedType={params.type || ""}
        currentPage={currentPage}
        basePath="/"
      />
    </>
  );
}
