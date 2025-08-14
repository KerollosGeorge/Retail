/* import { useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { FaPlus, FaMinus } from "react-icons/fa";
import toast from "react-hot-toast";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loading } from "../components/Loading";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

export const Cart = () => {
  const { token } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      const res = await axios.get("/api/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    },
    enabled: !!token,
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ productId, quantity }) => {
      const res = await axios.put("/api/cart/updateQuantity", {
        productId,
        quantity,
      });
      return res.data;
    },
    onMutate: async ({ productId, quantity }) => {
      await queryClient.cancelQueries(["cart"]);
      const previousCart = queryClient.getQueryData(["cart"]);

      const item = previousCart?.products.find(
        (p) => p.productId._id === productId
      );

      if (!item) {
        toast.error("Product not found in cart.");
        return { previousCart, shouldUpdate: false };
      }

      const stock = item.productId.stock;
      console.log(stock);

      if (quantity < 1) {
        toast.error("Quantity must be at least 1.");
        return { previousCart, shouldUpdate: false };
      }

      if (quantity > stock) {
        toast.error("Requested quantity exceeds available stock.");
        return { previousCart, shouldUpdate: false };
      }

      // Optimistically update the UI
      queryClient.setQueryData(["cart"], (old) => {
        if (!old) return old;
        return {
          ...old,
          products: old.products.map((p) =>
            p.productId._id === productId ? { ...p, quantity } : p
          ),
        };
      });

      return { previousCart, shouldUpdate: true };
    },
    onError: (err, _, context) => {
      const message =
        err.response?.data?.message || "Failed to update quantity.";
      toast.error(message);
      if (context?.previousCart) {
        queryClient.setQueryData(["cart"], context.previousCart);
      }
    },
    onSettled: (_, __, ___, context) => {
      if (context?.shouldUpdate) {
        queryClient.invalidateQueries(["cart"]);
      }
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: async (productId) => {
      return await axios.put("/api/cart/remove", { productId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["cart"]);
      toast.success("Item removed from cart!");
    },
    onError: (err) => {
      toast.error(
        err.response?.data?.message || "Failed to remove item from cart."
      );
    },
  });

  if (isLoading)
    return (
      <div className="w-[100vw] py-11 flex items-center justify-center">
        <Loading />
      </div>
    );

  if (!data || data.products.length === 0)
    return (
      <>
        <Navbar />
        <div className="text-center my-20 text-xl h-[30vh]">
          Your cart is empty.
          <br />
          <button
            onClick={() => navigate("/products")}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Browse Products
          </button>
        </div>
        <Footer />
      </>
    );

  const subtotal = data.products.reduce(
    (acc, item) => acc + item.productId.price * item.quantity,
    0
  );

  const discountTotal = data.products.reduce((acc, item) => {
    const discount = item.productId.discount || 0;
    const discountedPrice = item.productId.price * (1 - discount / 100);
    return acc + (item.productId.price - discountedPrice) * item.quantity;
  }, 0);

  const total = subtotal - discountTotal;

  return (
    <>
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-10">
        <h2 className="text-3xl font-bold mb-10 text-center">
          🛒 My Shopping Cart
        </h2>

        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="text-gray-200 bg-gray-800">
              <tr className="border-b border-gray-700">
                <th className="p-4">Description</th>
                <th className="p-4 text-center">Quantity</th>
                <th className="p-4 text-center">Remove</th>
                <th className="p-4 text-right pr-12">Price</th>
              </tr>
            </thead>
            <tbody>
              {data.products.map((item) => {
                const { productId, quantity } = item;
                const hasDiscount = productId.discount > 0;
                const discountedPrice =
                  productId.price * (1 - (productId.discount || 0) / 100);

                return (
                  <tr key={productId._id} className="border-b border-gray-700">
                    <td className="p-4 flex items-center space-x-4">
                      <img
                        src={productId.images[0]?.url}
                        alt={productId.name}
                        className="w-20 h-20 object-cover rounded-lg border border-gray-600"
                      />
                      <div>
                        <p className="font-semibold">{productId.name}</p>
                        <p className="text-sm">{productId.description}</p>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center space-x-3">
                        <button
                          onClick={() =>
                            quantity > 1 &&
                            updateQuantityMutation.mutate({
                              productId: productId._id,
                              quantity: quantity - 1,
                            })
                          }
                          className="px-2 py-1 border rounded bg-gray-700 text-gray-200 hover:bg-gray-600 transition disabled:opacity-50"
                          disabled={quantity <= 1}
                        >
                          <FaMinus />
                        </button>
                        {!isLoading && data && (
                          <span className="text-xl">{quantity}</span>
                        )}
                        <button
                          onClick={() =>
                            updateQuantityMutation.mutate({
                              productId: productId._id,
                              quantity: quantity + 1,
                            })
                          }
                          className="px-2 py-1 border rounded bg-gray-700 text-gray-200 hover:bg-gray-600 transition"
                        >
                          <FaPlus />
                        </button>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        className="p-2 text-gray-200 bg-gray-700 hover:bg-red-500 hover:text-white transition-all rounded-md"
                        onClick={() => removeItemMutation.mutate(productId._id)}
                      >
                        <FontAwesomeIcon className="text-2xl" icon={faXmark} />
                      </button>
                    </td>
                    <td className="p-4 text-right font-semibold">
                      {hasDiscount ? (
                        <>
                          <span className="line-through text-sm text-gray-500 mr-1">
                            L.E {productId.price.toFixed(2)}
                          </span>
                          <span className="text-green-600">
                            L.E {discountedPrice.toFixed(2)}
                          </span>
                        </>
                      ) : (
                        <>L.E {productId.price.toFixed(2)}</>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-10">
          <div className="bg-gray-800 text-gray-200 rounded p-4 space-y-2 text-sm max-w-md ml-auto">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>L.E {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Discount</span>
              <span className="text-green-600">
                − L.E {discountTotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>L.E {total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-center sm:justify-end mt-8 space-y-3 sm:space-y-0 sm:space-x-4">
          <button
            onClick={() => toast.success("Checkout feature coming soon!")}
            className="bg-blue-600 text-white text-lg px-6 py-3 rounded hover:bg-blue-700 transition"
          >
            Checkout
          </button>
          <button
            onClick={() => navigate("/products")}
            className="border border-gray-500 px-6 py-3 rounded hover:bg-gray-700 transition"
          >
            Continue Shopping
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
}; */

// pages/Cart.jsx
import { useCart } from "../context/CartContext";
import { FaPlus, FaMinus } from "react-icons/fa";
import toast from "react-hot-toast";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { Loading } from "../components/Loading";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

export const Cart = () => {
  const {
    cart,
    isLoading,
    updateQuantity,
    updateQuantityLoading,
    removeItem,
    removeItemLoading,
    clearCart,
    clearCartLoading,
  } = useCart();
  const navigate = useNavigate();
  console.log(cart);

  if (isLoading) return <Loading />;

  if (!cart || cart.products.length === 0)
    return (
      <>
        <Navbar />
        <div className="text-center my-20 text-xl h-[30vh]">
          Your cart is empty.
          <br />
          <button
            onClick={() => navigate("/products")}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Browse Products
          </button>
        </div>
        <Footer />
      </>
    );

  const subtotal = cart.products.reduce(
    (acc, item) => acc + (item.productId?.price ?? 0) * item.quantity,
    0
  );

  const discountTotal = cart.products.reduce((acc, item) => {
    const price = item.productId?.price ?? 0;
    const discount = item.productId?.discount || 0;
    const discountedPrice = price * (1 - discount / 100);
    return acc + (price - discountedPrice) * item.quantity;
  }, 0);

  const total = subtotal - discountTotal;

  return (
    <>
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-10">
        <h2 className="text-3xl font-bold mb-10 text-center">🛒 My Cart</h2>

        <div className="w-full overflow-x-auto min-w-[490px]">
          <table className="w-full text-left border-collapse">
            <thead className="text-gray-200 bg-gray-800">
              <tr className="border-b border-gray-700">
                <th className="p-4">Description</th>
                <th className="p-4 text-center">Quantity</th>
                <th className="p-4 text-center">Remove</th>
                <th className="p-4 text-right pr-12">Price</th>
              </tr>
            </thead>
            <tbody>
              {cart.products.map((item) => {
                const product = item.productId;
                const quantity = item.quantity;
                if (!product)
                  return (
                    <tr key={item._id}>
                      <td colSpan="4" className="text-center text-red-500 p-4">
                        This product is no longer available.
                      </td>
                    </tr>
                  );

                const hasDiscount = product.discount > 0;
                const discountedPrice =
                  (product.price ?? 0) * (1 - (product.discount || 0) / 100);

                return (
                  <tr key={product._id} className="border-b border-gray-700">
                    <td className="p-4 flex items-center space-x-4">
                      <img
                        src={product.images?.[0]?.url}
                        alt={product.name}
                        className="w-20 h-20 object-cover rounded-lg border border-gray-600"
                      />
                      <div>
                        <p className="font-semibold">{product.name}</p>
                        <p className="text-sm text-gray-400 truncate w-60">
                          {product.description}
                        </p>
                        {product.stock !== undefined && (
                          <p className="text-xs text-gray-400 mt-1">
                            {product.stock} in stock
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center space-x-3">
                        <button
                          onClick={() =>
                            quantity > 1 &&
                            updateQuantity({
                              productId: product._id,
                              quantity: quantity - 1,
                            })
                          }
                          disabled={quantity <= 1 || updateQuantityLoading}
                          className="px-2 py-1 border rounded bg-gray-700 text-gray-200 hover:bg-gray-600 transition disabled:opacity-50"
                        >
                          <FaMinus />
                        </button>
                        <span className="text-xl font-medium">{quantity}</span>
                        <button
                          onClick={() =>
                            updateQuantity({
                              productId: product._id,
                              quantity: quantity + 1,
                            })
                          }
                          disabled={updateQuantityLoading}
                          className="px-2 py-1 border rounded bg-gray-700 text-gray-200 hover:bg-gray-600 transition disabled:opacity-50"
                        >
                          <FaPlus />
                        </button>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        className="p-2 text-gray-200 bg-gray-700 hover:bg-red-500 hover:text-white transition-all rounded-md disabled:opacity-50"
                        onClick={() => removeItem({ productId: product._id })}
                        disabled={removeItemLoading}
                      >
                        <FontAwesomeIcon className="text-2xl" icon={faXmark} />
                      </button>
                    </td>
                    <td className="p-4 text-right font-semibold">
                      {hasDiscount ? (
                        <>
                          <span className="line-through text-sm text-gray-500 mr-1">
                            L.E {(product.price ?? 0).toFixed(2)}
                          </span>
                          <span className="text-green-500">
                            L.E {(discountedPrice ?? 0).toFixed(2)}
                          </span>
                        </>
                      ) : (
                        <>L.E {(product.price ?? 0).toFixed(2)}</>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-10">
          <div className="bg-gray-800 text-gray-200 rounded p-4 space-y-2 text-sm max-w-md ml-auto">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>L.E {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Discount</span>
              <span className="text-green-600">
                − L.E {discountTotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>L.E {total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-center sm:justify-end mt-8 space-y-3 sm:space-y-0 sm:space-x-4">
          <button
            onClick={() => toast.success("Checkout feature coming soon!")}
            className="bg-blue-600 text-white text-lg px-6 py-3 rounded hover:bg-blue-700 transition"
          >
            Checkout
          </button>
          <button
            onClick={() => navigate("/products")}
            className="border border-gray-500 px-6 py-3 rounded hover:bg-gray-700 transition"
          >
            Continue Shopping
          </button>
          <button
            onClick={clearCart}
            disabled={clearCartLoading}
            className="text-red-500 hover:text-red-700 text-sm px-4 py-2 border border-red-500 rounded transition disabled:opacity-50"
          >
            Clear Cart
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
};
