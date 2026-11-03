import Banner from "@/components/trang-chu/Banner";
import ContractCatalog from "@/components/trang-chu/ContractCatalog";
import { Suspense } from "react";

const HomePage = () => {
  return (
    <div className="space-y-16 pb-16">
      <Banner />
      {/* <GuideSection /> */}
      <Suspense>
        <ContractCatalog />
      </Suspense>
    </div>
  );
};

export default HomePage;
