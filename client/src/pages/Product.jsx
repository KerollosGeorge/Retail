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
import useFetch from "../hooks/useFetch.js";
import { Navbar } from "../components/Navbar.jsx";
import { Footer } from "../components/Footer.jsx";
import { RelatedProducts } from "../components/RelatedProducts.jsx";
import { CartContext } from "../context/CartContext.jsx";

export const Product = () => {
  const { user } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);
  const queryClient = useQueryClient();
  const [seeMore, setSeeMore] = useState(true);
  const [seeDetails, setSeeDetails] = useState(false);
  const [seeReviews, setSeeReviews] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, loading } = useFetch(`http://localhost:7000/api/product/${id}`);

  const { data: favoriteProducts = [] } = useQuery({
    queryKey: ["favorites", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await axios.get(`/api/user/favoriteProducts/${user.id}`);
      return data || [];
    },
    enabled: !!user?.id,
  });

  const wishlistMutation = useMutation({
    mutationFn: async (productId) => {
      if (!user?.id) {
        toast.error("You need to log in to add to wishlist!");
        return;
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
        context.previousFavorites
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries(["favorites", user?.id]);
    },
  });

  const isFavorite = favoriteProducts.some((fav) => fav._id === data?._id);

  if (loading || !data)
    return <div className="text-center py-20">Loading...</div>;

  return (
    <div className="w-full flex flex-col items-center justify-center">
      <Navbar />

      <div className=" px-8 py-10 lg:w-[80%] transition-all grid md:grid-cols-2 gap-10 shadow-md shadow-gray-500 rounded-xl mt-8 ">
        {/* Product Image + Wishlist */}
        <div className="relative flex flex-col items-center">
          <div className="sticky top-20">
            <img
              src={data.images?.[0]?.url}
              alt={data.name}
              className="w-[350px] h-[400px] rounded-xl object-cover shadow"
            />
            {data.discount && (
              <div className="absolute top-2 left-2 bg-red-500 text-white px-3 py-1 text-sm rounded-md">
                {data.discount}% OFF
              </div>
            )}
            <FontAwesomeIcon
              icon={faHeart}
              className={`absolute top-3 right-3 text-3xl cursor-pointer transition-all duration-300 ${
                isFavorite ? "text-red-500 scale-110" : "text-gray-400"
              }`}
              title="Add to Wishlist"
              onClick={() => wishlistMutation.mutate(data._id)}
            />
          </div>
        </div>

        {/* Product Info */}
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-bold">{data.name}</h1>

          <div className="flex items-center gap-4">
            {data?.discount ? (
              <>
                <p className="text-2xl font-semibold text-green-600">
                  EGP {data.discountedPrice}
                </p>
                <p className="line-through text-gray-400 text-lg">
                  EGP {data.price}
                </p>
              </>
            ) : (
              <p className="text-2xl font-semibold text-blue-600">
                EGP {data.price}
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
            {seeMore && <p className="mt-2 ml-3">{data.description}</p>}
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
                {data.brand && (
                  <div>
                    <strong>Brand: </strong>
                    <span>{data.brand}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <strong>Rating:</strong>
                  <span>{data.rating}</span>
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }, (_, i) => (
                      <FontAwesomeIcon
                        key={i}
                        icon={faStar}
                        className={`text-sm ${
                          i < data.rating ? "text-yellow-400" : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Reviews */}
          {data.reviews?.length > 0 && (
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
                  {data.reviews.map((review, i) => (
                    <li key={i}>{review}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <button
            className="mt-6 bg-[#0098b3] text-white py-2 px-6 rounded-lg hover:bg-[#36b0c6] transition duration-200 self-start"
            title="Add to cart"
            onClick={(e) => {
              e.stopPropagation();
              if (!user) {
                toast.error("Please log in to add to cart.");
                navigate("/login");
                return;
              }
              addToCart(id);
            }}
          >
            Add to Cart
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
