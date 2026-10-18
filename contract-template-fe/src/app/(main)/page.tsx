import Banner from "@/components/trang-chu/Banner";
import ContractCatalog from "@/components/trang-chu/ContractCatalog";
import GuideSection from "@/components/trang-chu/GuideSection";

const HomePage = () => {
  return (
    <div className="space-y-16 pb-16">
      <Banner />
      <GuideSection />
      <ContractCatalog />
    </div>
  );
};

export default HomePage;
