import React, { useContext, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Navbar } from "../components/Navbar.jsx";
import { Footer } from "../components/Footer.jsx";
import { Loading } from "../components/Loading.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart, faCartPlus } from "@fortawesome/free-solid-svg-icons";
import { AuthContext } from "../context/AuthContext.jsx";
import { toast } from "react-hot-toast";
import { FaShoppingCart } from "react-icons/fa";
import { useProductStore } from "../context/ProductsStore.js";
import { useCart } from "../context/CartContext.jsx";

export const CategoryProducts = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { addToCart } = useCart();
  const { products, setProducts } = useProductStore();

  const categoryId = location.pathname.split("/").slice(-1)[0];

  const { isLoading } = useQuery({
    queryKey: ["categoryProducts", categoryId],
    queryFn: async () => {
      const res = await axios.get(`/api/product/category/${categoryId}`);
      setProducts(res.data);
      return res.data;
    },
  });

  const { data: category = [] } = useQuery({
    queryKey: ["categories", categoryId],
    queryFn: async () => {
      const res = await axios.get(`/api/category/${categoryId}`);
      return res.data;
    },
  });

  const { data: favoriteProducts = [] } = useQuery({
    queryKey: ["favorites", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const res = await axios.get(`/api/user/favoriteProducts/${user.id}`);
      return res.data || [];
    },
    enabled: !!user?.id,
    staleTime: 600000,
    cacheTime: 1800000,
  });

  const wishlistMutation = useMutation({
    mutationFn: async (productId) => {
      await axios.put(`/api/user/favoriteProducts/${user.id}`, { productId });
    },
    onMutate: async (productId) => {
      await queryClient.cancelQueries(["favorites", user.id]);
      const previous = queryClient.getQueryData(["favorites", user.id]) || [];
      const exists = previous.some((fav) => fav._id === productId);
      const updated = exists
        ? previous.filter((f) => f._id !== productId)
        : [...previous, { _id: productId }];
      queryClient.setQueryData(["favorites", user.id], updated);
      return { previous };
    },
    onError: (err, productId, context) => {
      queryClient.setQueryData(["favorites", user.id], context.previous);
      toast.error("Failed to update wishlist.");
    },
    onSettled: () => {
      queryClient.invalidateQueries(["favorites", user.id]);
    },
  });

  const isFavorite = (productId) =>
    favoriteProducts?.some((fav) => fav._id === productId);

  return (
    <>
      <Navbar />
      <div className="w-full flex flex-col items-center justify-center py-4 px-12 min-h-screen">
        {isLoading && <Loading />}
        {category && (
          <div className="w-full bg-gray-800 rounded-lg shadow-lg p-6 ">
            <div className="flex flex-col md:flex-row space-x-10">
              <div className="flex-shrink-0 w-full md:w-1/3">
                <img
                  src={category.image?.url}
                  alt={category.name}
                  className="w-full h-64 object-cover rounded-lg shadow-md"
                />
              </div>
              <div className="w-full md:w-2/3 space-y-4 mt-6 md:mt-0">
                <h1 className="text-3xl text-gray-300 text-center font-semibold ">
                  {category.name}
                </h1>
                <p className="text-gray-300 text-right">
                  {category.description}
                </p>
              </div>
            </div>
          </div>
        )}
        {products?.length === 0 && (
          <div className="text-center py-8">
            <h1 className="text-2xl font-semibold">No Products Found</h1>
          </div>
        )}
        {products?.length > 0 && (
          <div className="w-full flex flex-col items-center mb-4">
            <h1 className="w-full text-3xl font-semibold py-4">
              {category.name} Products
            </h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 w-full">
              {products?.map((product) => (
                <div
                  key={product._id}
                  className="bg-gray-800 relative rounded-2xl shadow-md overflow-hidden transition transform hover:-translate-y-1 hover:shadow-lg"
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
        )}
      </div>
      <Footer />
    </>
  );
};
/*<div
                  key={product._id}
                  onClick={() => navigate(`/product/${product._id}`)}
                  className="relative group w-full rounded-lg overflow-hidden shadow-lg bg-white dark:bg-gray-900 hover:scale-105 transition-all duration-300 ease-in-out"
                >
                  <img
                    src={product.images[0]?.url}
                    alt={product.name}
                    className="w-full h-56 object-cover group-hover:opacity-80 transition-opacity duration-300"
                  />
                  <div className="p-4">
                    <h2 className="text-xl font-semibold text-gray-800 ">
                      {product.name}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {product.description}
                    </p>
                  </div>

                  
                  <button
                    className="absolute top-4 right-4 text-2xl text-white transition-transform transform group-hover:scale-110"
                    title="Add to wishlist"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!user) {
                        toast.error("Please log in to add to wishlist.");
                        navigate("/login");
                        return;
                      }
                      wishlistMutation.mutate(product._id);
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faHeart}
                      className={`transition-all ${
                        isFavorite(product._id)
                          ? "text-red-600 scale-110"
                          : "text-gray-500"
                      }`}
                    />
                  </button>

                  
                  <button
                    className="absolute bottom-4 right-4 text-xl text-white bg-black/50 p-3 rounded-full hover:scale-110 transition-all z-10"
                    title="Add to cart"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!user) {
                        toast.error("Please login to add to cart.");
                        navigate("/login");
                        return;
                      }
                      addToCartMutation.mutate(product._id);
                    }}
                  >
                    <FontAwesomeIcon icon={faCartPlus} />
                  </button>
                </div> */
