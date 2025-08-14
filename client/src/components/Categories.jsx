import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import { useMediaQuery } from "react-responsive";
import { useNavigate } from "react-router-dom";

export const Categories = () => {
  const navigate = useNavigate();
  const [start, setStart] = useState(0);

  const isSmallScreen = useMediaQuery({ maxWidth: 640 });
  const itemsPerPage = isSmallScreen ? 2 : 4;

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await axios.get("/api/category");
      return data;
    },
  });

  if (!categories.length) {
    return (
      <div className="text-center text-gray-500 py-8">
        No categories available.
      </div>
    );
  }

  const totalItems = categories.length;
  const handleNext = () =>
    setStart((prev) => (prev + 1 >= totalItems ? prev : prev + 1));

  const handlePrev = () => setStart((prev) => (prev - 1 < 0 ? 0 : prev - 1));

  return (
    <div id="categories" className="w-full flex flex-col items-center mt-8">
      <div className="w-full max-w-6xl flex justify-between items-center px-4">
        <h2 className="text-3xl font-bold">Categories</h2>
        <div className="flex items-center gap-4">
          <FontAwesomeIcon
            icon={faChevronLeft}
            className={`text-2xl text-[#0098b3] ${
              start === 0 ? "cursor-not-allowed" : "cursor-pointer"
            }`}
            onClick={start === 0 ? null : handlePrev}
          />
          <FontAwesomeIcon
            icon={faChevronRight}
            className={`text-2xl text-[#0098b3] ${
              start + itemsPerPage >= totalItems
                ? "cursor-not-allowed"
                : "cursor-pointer"
            }`}
            onClick={start + itemsPerPage >= totalItems ? null : handleNext}
          />
          <span
            className="cursor-pointer text-2xl text-[#0098b3] hover:underline"
            onClick={() => navigate("/categories")}
          >
            All
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6 w-full max-w-6xl px-4">
        {categories.slice(start, start + itemsPerPage).map((category) => (
          <div
            key={category._id}
            onClick={() => navigate(`/category/${category._id}`)}
            className=" bg-gray-800 relative group rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl cursor-pointer transition-transform duration-300 hover:scale-105"
          >
            <img
              src={category.image.url}
              alt={category.name}
              className="w-full h-60 object-cover"
            />
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
              <span className="text-3xl md:text-4xl font-bold text-white text-center px-2">
                {category.name}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
