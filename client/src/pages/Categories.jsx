import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Navbar } from "../components/Navbar.jsx";
import { Footer } from "../components/Footer.jsx";
import { Loading } from "../components/Loading.jsx";

export const CategoriesPage = () => {
  const navigate = useNavigate();

  const {
    data: categories = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await axios.get("/api/category");
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="w-full flex mt-20 justify-center items-center">
        <Loading />
      </div>
    );
  }

  if (isError || !categories.length) {
    return (
      <div className="text-center text-red-500 py-10">
        Failed to load categories.
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="min-h-screen px-4 py-8 sm:px-12 md:px-4 lg:px-16 xl:px-20">
        <h1 className="text-3xl font-bold mb-8 ">All Categories</h1>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {categories.map((category) => (
            <div
              key={category._id}
              onClick={() => navigate(`/category/${category._id}`)}
              className="bg-gray-800 relative group rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl cursor-pointer transition-transform duration-300 hover:scale-105"
            >
              <img
                src={category.image.url}
                alt={category.name}
                className="w-full h-60 object-cover"
              />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                <span className="text-2xl md:text-3xl font-bold text-white text-center px-2">
                  {category.name}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};
