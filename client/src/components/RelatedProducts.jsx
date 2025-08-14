import { useContext, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCaretLeft,
  faCaretRight,
  faHeart,
  faCartPlus,
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { AuthContext } from "../context/AuthContext.jsx";
import axios from "axios";
import { useCart } from "../context/CartContext.jsx";
import { FaShoppingCart } from "react-icons/fa";
import { useMediaQuery } from "react-responsive";

export const RelatedProducts = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const { addToCart } = useCart();
  const queryClient = useQueryClient();
  const [start, setStart] = useState(0);

  const isSmallScreen = useMediaQuery({ maxWidth: 640 });
  const itemsPerPage = isSmallScreen ? 2 : 4;

  // Fetch Related Products
  const {
    data: products = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["relatedProducts", id],
    queryFn: async () => {
      const { data } = await axios.get(`/api/product/related/${id}`);
      return data;
    },
    staleTime: 600000,
    cacheTime: 1800000,
    retry: 2,
  });

  // Fetch user's favorite products
  const { data: favoriteProducts = [] } = useQuery({
    queryKey: ["favorites", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await axios.get(`/api/user/favoriteProducts/${user.id}`);
      return data || [];
    },
    enabled: !!user?.id,
    staleTime: 600000,
    cacheTime: 1800000,
    retry: 2,
  });

  const isFavorite = (productId) =>
    favoriteProducts.some((fav) => fav._id === productId);

  const wishlistMutation = useMutation({
    mutationFn: async (productId) => {
      await axios.put(`/api/user/favoriteProducts/${user.id}`, { productId });
    },
    onMutate: async (productId) => {
      await queryClient.cancelQueries(["favorites", user.id]);
      const previous = queryClient.getQueryData(["favorites", user.id]) || [];
      const exists = previous.some((f) => f._id === productId);
      const updated = exists
        ? previous.filter((f) => f._id !== productId)
        : [...previous, { _id: productId }];
      queryClient.setQueryData(["favorites", user.id], updated);
      return { previous };
    },
    onError: (_, __, context) => {
      queryClient.setQueryData(["favorites", user.id], context.previous);
      toast.error("Failed to update wishlist.");
    },
    onSettled: () => {
      queryClient.invalidateQueries(["favorites", user.id]);
    },
  });

  const totalItems = products.length;
  const handleNext = () =>
    setStart((prev) =>
      prev + itemsPerPage >= totalItems ? prev : prev + itemsPerPage
    );
  const handlePrev = () =>
    setStart((prev) => (prev - itemsPerPage < 0 ? 0 : prev - itemsPerPage));

  if (isLoading) return <p>Loading related products...</p>;
  if (error)
    return <p className="text-red-500">Failed to load related products</p>;
  if (!products.length) {
    return (
      <div className="w-full flex flex-col m-4">
        <span className="text-2xl">Related Products</span>
        <p className="text-gray-500 indent-9">
          No related products available right now.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center mt-8">
      <div className="w-full max-w-6xl flex justify-between items-center px-4">
        <h2 className="text-3xl font-bold">Related Products</h2>
        <div className="flex items-center gap-4">
          <FontAwesomeIcon
            icon={faChevronLeft}
            className={`text-2xl text-[#0098b3]  ${
              start === 0 ? "cursor-not-allowed" : " cursor-pointer"
            }`}
            onClick={start === 0 ? null : handlePrev}
          />
          <FontAwesomeIcon
            icon={faChevronRight}
            className={`text-2xl text-[#0098b3] ${
              start + itemsPerPage >= totalItems
                ? " cursor-not-allowed"
                : "cursor-pointer"
            }`}
            onClick={start + itemsPerPage >= totalItems ? null : handleNext}
          />
          {/*           <span
            className="cursor-pointer text-2xl text-[#0098b3] hover:underline"
            onClick={() => navigate("/top-rated")}
          >
            All
          </span> */}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6 w-full max-w-6xl px-4">
        {products.slice(start, start + itemsPerPage).map((product) => (
          <div
            key={product._id}
            className="w-full bg-gray-800 relative rounded-2xl shadow-md overflow-hidden transition transform hover:-translate-y-1 hover:shadow-lg"
          >
            {/* Wishlist Button - outside the Link */}
            <button
              title="Add to Wishlist"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                if (!user) {
                  toast.error("Please log in to add to wishlist.");
                  navigate("/login");
                  return;
                }
                wishlistMutation.mutate(product._id);
              }}
              className="absolute top-0 right-1 text-white bg-black/50 hover:bg-black/70 rounded-full p-1 z-50"
            >
              <FontAwesomeIcon
                icon={faHeart}
                className={`text-xl transition-all  ${
                  isFavorite(product._id)
                    ? "text-red-500 scale-110"
                    : "text-gray-200"
                }`}
              />
            </button>

            {/* Discount badge - also outside the Link */}
            {product.discount && (
              <div className="absolute top-0 left-0 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-tl-2xl rounded-md z-40">
                {product.discount}% OFF
              </div>
            )}

            {/* Link wraps only non-interactive product content */}
            <Link to={`/product/${product._id}`}>
              <img
                src={product.images[0].url}
                alt={product.title}
                className="w-full h-[250px] object-cover"
              />
              <div className="p-4">
                <h2 className="text-lg font-semibold text-white">
                  {product.name}
                </h2>
                <p className="text-sm text-gray-400 mb-1">{product.category}</p>
                {product.discount ? (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-indigo-500 font-bold text-base">
                      EGP {product.discountedPrice}
                    </span>
                    <span className="text-md text-gray-400 line-through">
                      EGP {product.price}
                    </span>
                  </div>
                ) : (
                  <p className="text-indigo-500 font-bold text-base mt-1">
                    EGP {product.price}
                  </p>
                )}
                <p
                  className={`text-sm mt-1 ${
                    product.stock > 0 ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {product.stock > 0
                    ? `In Stock: ${product.stock}`
                    : "Out of Stock"}
                </p>
              </div>
            </Link>

            {/* Add to Cart Button */}
            <div className="px-4 pb-4 flex items-center justify-center">
              <button
                disabled={product.stock === 0}
                title="Add to Cart"
                onClick={(e) => {
                  e.stopPropagation();
                  if (!user) {
                    toast.error("Please log in to add to cart.");
                    navigate("/login");
                    return;
                  }
                  addToCart(product._id, product.stock);
                }}
                className={`${
                  product.stock === 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700"
                } text-white px-16 py-1 rounded-lg text-sm flex items-center gap-1`}
              >
                <FaShoppingCart /> Add
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
