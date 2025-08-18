// src/pages/Products.jsx
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import { Loading } from "../components/Loading.jsx";
import { FaShoppingCart } from "react-icons/fa";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Navbar } from "../components/Navbar.jsx";
import { Footer } from "../components/Footer.jsx";
import { useCart } from "../context/CartContext.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart } from "@fortawesome/free-solid-svg-icons";
import { useProductStore } from "../context/ProductsStore.js";
import { useSearch } from "../context/SearchContext.jsx";
import { useMediaQuery } from "react-responsive";

export const Products = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { addToCart } = useCart();
  const [searchParams] = useSearchParams();
  const urlSearch = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const { searchValue, setSearchValue } = useSearch();

  const { products, stockMap, setProducts, updateProductStock, safeAddToCart } =
    useProductStore();

  const queryClient = useQueryClient();
  const isSmallScreen = useMediaQuery({ maxWidth: 640 });
  const itemsPerPage = isSmallScreen ? 2 : 4; // currently unused

  // Fetch products by category
  const { isLoading, isError } = useQuery({
    queryKey: ["products", category],
    queryFn: async () => {
      let endpoint = "/api/product";
      switch (category) {
        case "most-selling":
          endpoint = "/api/product/topSelling";
          break;
        case "top-rated":
          endpoint = "/api/product/topRated";
          break;
        case "discounts":
          endpoint = "/api/product/discounts";
          break;
        case "private":
          endpoint = "/api/product/private";
          break;
        default:
          endpoint = "/api/product";
      }
      const { data } = await axios.get(endpoint);
      setProducts(data); // Zustand sync
      return data;
    },
  });

  // Fetch user's favorites
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

      // keep consistent structure (not just {_id})
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

  useEffect(() => {
    if (urlSearch !== searchValue) {
      setSearchValue(urlSearch);
    }
  }, [urlSearch, searchValue, setSearchValue]);

  const filteredProducts = products.filter(
    (p) =>
      !searchValue ||
      p.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      p.category.toLowerCase().includes(searchValue.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="w-full flex mt-20 justify-center items-center">
        <Loading />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-10 text-red-500">
        Error fetching products
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="min-h-screen px-4 py-8 sm:px-12 md:px-4 lg:px-16 xl:px-16">
        <h1 className="text-3xl font-bold mb-8">
          {category === "most-selling"
            ? "Most Selling"
            : category === "top-rated"
            ? "Top Rated"
            : category === "discounts"
            ? "Special Offers"
            : category === "private"
            ? "Negmet Heliopolis Products"
            : "All Products"}
        </h1>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {filteredProducts.map((product) => {
            const stock = stockMap[product._id] ?? product.stock;
            const imageUrl = product.images?.[0]?.url || "/placeholder.png";

            return (
              <div
                key={product._id}
                className="bg-gray-800 relative rounded-2xl shadow-md overflow-hidden transition transform hover:-translate-y-1 hover:shadow-lg"
              >
                <button
                  title="Add to Wishlist"
                  aria-label="Add to Wishlist"
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
                    className={`text-xl transition-all ${
                      isFavorite(product._id)
                        ? "text-red-500 scale-110"
                        : "text-gray-200"
                    }`}
                  />
                </button>

                {product.discount && (
                  <div className="absolute top-0 left-0 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-tl-2xl rounded-md z-40">
                    {product.discount}% OFF
                  </div>
                )}

                <Link to={`/product/${product._id}`}>
                  <img
                    src={imageUrl}
                    alt={product.name || "Product"}
                    className="w-full h-[250px] object-cover"
                  />
                  <div className="p-4">
                    <h2 className="text-lg font-semibold text-white">
                      {product.name}
                    </h2>
                    <p className="text-sm text-gray-400 mb-1">
                      {product.category}
                    </p>
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
                        stock > 0 ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {stock > 0 ? `In Stock: ${stock}` : "Out of Stock"}
                    </p>
                  </div>
                </Link>

                <div className="px-4 pb-4 flex items-center justify-center">
                  <button
                    disabled={stock === 0}
                    title="Add to Cart"
                    aria-label="Add to Cart"
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (!user) {
                        toast.error("Please log in to add to cart.");
                        navigate("/login");
                        return;
                      }
                      await safeAddToCart(product._id, async () => {
                        const result = await addToCart(product._id);
                        if (
                          result?.updatedProduct &&
                          result.updatedProduct._id
                        ) {
                          updateProductStock(
                            result.updatedProduct._id,
                            result.updatedProduct.stock
                          );
                        }
                      });
                    }}
                    className={`${
                      stock === 0
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-indigo-600 hover:bg-indigo-700"
                    } text-white px-16 py-1 rounded-lg text-sm flex items-center gap-1`}
                  >
                    <FaShoppingCart /> Add
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <Footer />
    </div>
  );
};
