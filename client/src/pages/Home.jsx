import { Navbar } from "../components/Navbar.jsx";
import { Banners } from "../components/Banners.jsx";
import { Discounts } from "../components/Discounts.jsx";
import { Categories } from "../components/Categories.jsx";
import { TopRated } from "../components/TopRatedProducts.jsx";
import { Footer } from "../components/Footer.jsx";
import { PrivateProducts } from "../components/PrivateProducts.jsx";
import { MostSelling } from "../components/MostSelling.jsx";
import { OurBranches } from "../components/Branches.jsx";

export const Home = () => {
  return (
    <div className="w-full flex flex-col">
      <Navbar />
      <div
        className={`transition-all flex flex-col items-center justify-center
          
        `}
      >
        <Banners />
        <div className="w-full  py-8 flex flex-col justify-center items-center">
          <Discounts />
          <Categories />
          <PrivateProducts />
          <TopRated />
          <MostSelling />
        </div>
      </div>
      <OurBranches />
      <Footer />
    </div>
  );
};
