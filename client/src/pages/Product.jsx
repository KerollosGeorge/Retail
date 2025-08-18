import {
  faChevronDown,
  faChevronUp,
  faHeart,
  faStar,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useContext, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { AuthContext } from "../context/AuthContext.jsx";
import { Navbar } from "../components/Navbar.jsx";
import { Footer } from "../components/Footer.jsx";
import { RelatedProducts } from "../components/RelatedProducts.jsx";
import { CartContext } from "../context/CartContext.jsx";
import { useProductStore } from "../context/ProductsStore.js";

export const Product = () => {
  const { user } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);
  const { stockMap, updateProductStock } = useProductStore();
  const queryClient = useQueryClient();

  const [seeMore, setSeeMore] = useState(true);
  const [seeDetails, setSeeDetails] = useState(false);
  const [seeReviews, setSeeReviews] = useState(false);

  const { id } = useParams();
  const navigate = useNavigate();

  // Fetch product details with react-query
  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const res = await axios.get(`/api/product/${id}`);
      return res.data;
    },
    refetchOnWindowFocus: true, // ✅ Refetch when user returns to page
  });

  // Fetch favorites
  const { data: favoriteProducts = [] } = useQuery({
    queryKey: ["favorites", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await axios.get(`/api/user/favoriteProducts/${user.id}`);
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Wishlist mutation
  const wishlistMutation = useMutation({
    mutationFn: async (productId) => {
      if (!user?.id) {
        toast.error("You need to log in to add to wishlist!");
        throw new Error("Not logged in");
      }
      await axios.put(`/api/user/favoriteProducts/${user.id}`, { productId });
    },
    onMutate: async (productId) => {
      await queryClient.cancelQueries(["favorites", user?.id]);
      const previousFavorites = queryClient.getQueryData([
        "favorites",
        user?.id,
      ]);
      queryClient.setQueryData(["favorites", user?.id], (old = []) => {
        const exists = old.some((f) => f._id === productId);
        return exists
          ? old.filter((f) => f._id !== productId)
          : [...old, { _id: productId }];
      });
      return { previousFavorites };
    },
    onError: (_, __, context) => {
      queryClient.setQueryData(
        ["favorites", user?.id],
        context?.previousFavorites || []
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries(["favorites", user?.id]);
    },
  });

  const isFavorite = favoriteProducts.some((fav) => fav._id === product?._id);

  if (isLoading || !product)
    return <div className="text-center py-20">Loading...</div>;

  // Merge live stock from store with product data
  const liveStock = stockMap[product._id] ?? product.stock;

  return (
    <div className="w-full flex flex-col items-center justify-center">
      <Navbar />

      <div className="px-8 py-10 lg:w-[80%] transition-all grid md:grid-cols-2 gap-10 shadow-md shadow-gray-500 rounded-xl mt-8">
        {/* Product Image + Wishlist */}
        <div className="relative flex flex-col items-center">
          <div className="sticky top-20">
            <img
              src={product.images?.[0]?.url}
              alt={product.name}
              className="w-[350px] h-[400px] rounded-xl object-cover shadow"
            />
            {product.discount && (
              <div className="absolute top-2 left-2 bg-red-500 text-white px-3 py-1 text-sm rounded-md">
                {product.discount}% OFF
              </div>
            )}
            <FontAwesomeIcon
              icon={faHeart}
              className={`absolute top-3 right-3 text-3xl cursor-pointer transition-all duration-300 ${
                isFavorite ? "text-red-500 scale-110" : "text-gray-400"
              }`}
              title="Add to Wishlist"
              onClick={() => wishlistMutation.mutate(product._id)}
            />
          </div>
        </div>

        {/* Product Info */}
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-bold">{product.name}</h1>

          <p className="text-gray-500">Stock: {liveStock}</p>

          <div className="flex items-center gap-4">
            {product?.discount ? (
              <>
                <p className="text-2xl font-semibold text-green-600">
                  EGP {product.discountedPrice}
                </p>
                <p className="line-through text-gray-400 text-lg">
                  EGP {product.price}
                </p>
              </>
            ) : (
              <p className="text-2xl font-semibold text-blue-600">
                EGP {product.price}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="border-t pt-4">
            <div
              className="flex items-center justify-between cursor-pointer font-semibold"
              onClick={() => setSeeMore((prev) => !prev)}
            >
              <span>Description</span>
              <FontAwesomeIcon icon={seeMore ? faChevronUp : faChevronDown} />
            </div>
            {seeMore && <p className="mt-2 ml-3">{product.description}</p>}
          </div>

          {/* Product Details */}
          <div className="border-t pt-4">
            <div
              className="flex items-center justify-between cursor-pointer font-semibold"
              onClick={() => setSeeDetails((prev) => !prev)}
            >
              <span>Product Details</span>
              <FontAwesomeIcon
                icon={seeDetails ? faChevronUp : faChevronDown}
              />
            </div>
            {seeDetails && (
              <div className="mt-2 space-y-2">
                {product.brand && (
                  <div>
                    <strong>Brand: </strong>
                    <span>{product.brand}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <strong>Rating:</strong>
                  <span>{product.rating}</span>
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }, (_, i) => (
                      <FontAwesomeIcon
                        key={i}
                        icon={faStar}
                        className={`text-sm ${
                          i < product.rating
                            ? "text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Reviews */}
          {product.reviews?.length > 0 && (
            <div className="border-t pt-4">
              <div
                className="flex items-center justify-between cursor-pointer font-semibold"
                onClick={() => setSeeReviews((prev) => !prev)}
              >
                <span>Reviews</span>
                <FontAwesomeIcon
                  icon={seeReviews ? faChevronUp : faChevronDown}
                />
              </div>
              {seeReviews && (
                <ul className="mt-3 list-disc list-inside text-gray-600">
                  {product.reviews.map((review, i) => (
                    <li key={i}>{review}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <button
            className="mt-6 bg-[#0098b3] text-white py-2 px-6 rounded-lg hover:bg-[#36b0c6] transition duration-200 self-start"
            title="Add to cart"
            disabled={liveStock <= 0}
            onClick={async (e) => {
              e.stopPropagation();
              if (!user) {
                toast.error("Please log in to add to cart.");
                navigate("/login");
                return;
              }
              try {
                const updatedProd = await addToCart(id);
                updateProductStock(updatedProd._id, updatedProd.stock); // ✅ sync live stock
              } catch {}
            }}
          >
            {liveStock > 0 ? "Add to Cart" : "Out of Stock"}
          </button>
        </div>
      </div>

      <div className="w-full mt-4 mb-10 px-4">
        <RelatedProducts />
      </div>

      <Footer />
    </div>
  );
};
