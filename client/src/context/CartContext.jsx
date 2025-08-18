// context/CartContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useProductStore } from "./ProductsStore";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [updateQuantityLoading, setUpdateQuantityLoading] = useState(false);
  const [removeItemLoading, setRemoveItemLoading] = useState(false);
  const [clearCartLoading, setClearCartLoading] = useState(false);

  const { updateProductStock, bulkUpdateStocks } = useProductStore();

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const { data } = await axios.get("/api/cart"); // returns populated + total
        setCart(data);

        // Hydrate stockMap from populated cart items (no extra requests)
        if (data?.products?.length) {
          const stocks = data.products
            .filter((i) => i?.productId?._id)
            .map((i) => ({ _id: i.productId._id, stock: i.productId.stock }));
          if (stocks.length) bulkUpdateStocks(stocks);
        }
      } catch (err) {
        console.error("Error loading cart:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCart();
  }, [bulkUpdateStocks]);

  const addToCart = async (productId, qty = 1) => {
    try {
      const { data } = await axios.put("/api/cart/add", {
        productId,
        quantity: qty,
      });
      setCart({ ...data.cart, total: data.total });

      if (data.updatedProduct?._id) {
        updateProductStock(data.updatedProduct._id, data.updatedProduct.stock);
      }
      toast.success("Added to cart");
      return data.updatedProduct; // so callers can use it if they want
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to add to cart");
      throw err;
    }
  };

  const updateQuantity = async ({ productId, quantity }) => {
    try {
      setUpdateQuantityLoading(true);
      const { data } = await axios.put("/api/cart/updateQuantity", {
        productId,
        quantity,
      });
      setCart({ ...data.cart, total: data.total });
      if (data.updatedProduct?._id) {
        updateProductStock(data.updatedProduct._id, data.updatedProduct.stock);
      }
      toast.success("Quantity updated");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update quantity");
    } finally {
      setUpdateQuantityLoading(false);
    }
  };

  const removeItem = async ({ productId }) => {
    try {
      setRemoveItemLoading(true);
      const { data } = await axios.put("/api/cart/remove", { productId });
      setCart({ ...data.cart, total: data.total });
      if (data.updatedProduct?._id) {
        updateProductStock(data.updatedProduct._id, data.updatedProduct.stock);
      }
      toast.success("Item removed");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to remove item");
    } finally {
      setRemoveItemLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setClearCartLoading(true);
      const { data } = await axios.put("/api/cart/clear");
      setCart({ products: [], total: 0 });

      if (
        Array.isArray(data.restoredProducts) &&
        data.restoredProducts.length
      ) {
        // refresh many stocks at once
        bulkUpdateStocks(
          data.restoredProducts.map((p) => ({ _id: p._id, stock: p.stock }))
        );
      }
      toast.success("Cart cleared");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to clear cart");
    } finally {
      setClearCartLoading(false);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoading,
        addToCart,
        updateQuantity,
        updateQuantityLoading,
        removeItem,
        removeItemLoading,
        clearCart,
        clearCartLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);

/*import { createContext, useContext } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";
import { AuthContext } from "./AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import { useProductStore } from "./ProductsStore.js";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { token, user } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const { updateProductStock } = useProductStore.getState();

  // Fetch cart
  const { data: cart, isLoading } = useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      const res = await axios.get("/api/cart");
      return res.data;
    },
    enabled: !!token,
  });

  // ✅ Add to cart mutation
  const addToCart = useMutation({
    mutationFn: async (productId) => {
      const res = await axios.put("/api/cart/add", {
        productId,
        quantity: 1,
      });
      return res.data;
    },

    // ✅ Optimistically update stock
    onMutate: async (productId) => {
      await queryClient.cancelQueries(["cart"]);

      const { stockMap, updateProductStock } = useProductStore.getState();
      const currentStock = stockMap[productId];

      const previousStock =
        typeof currentStock === "number" ? currentStock : undefined;

      if (previousStock > 0 || previousStock === undefined) {
        updateProductStock(productId, (previousStock ?? 1) - 1);
      }

      return { productId, previousStock };
    },

    // ✅ Confirm true stock from backend
    onSuccess: (data) => {
      const updatedProduct = data.updatedProduct;
      useProductStore
        .getState()
        .updateProductStock(updatedProduct._id, updatedProduct.stock);

      toast.success("Added to cart!");
      queryClient.invalidateQueries(["cart"]);
    },

    // 🔴 Roll back if error occurs
    onError: (error, _, context) => {
      if (context?.previousStock !== undefined) {
        useProductStore
          .getState()
          .updateProductStock(context.productId, context.previousStock);
      }
      toast.error(error.response?.data?.message || "Failed to add to cart.");
    },
  });
   const addToCart = useMutation({
    mutationFn: async (productId) => {
      const res = await axios.put("/api/cart/add", {
        productId,
        quantity: 1,
      });
      return res.data;
    },
    onSuccess: (data) => {
      const updatedProduct = data.updatedProduct;
      updateProductStock(updatedProduct._id, updatedProduct.stock);
      toast.success("Added to cart!");
      queryClient.invalidateQueries(["cart"]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to add to cart.");
    },
  }); */

/* const addToCart = useMutation({
    mutationFn: async (productId) => {
      if (!user?.id) throw new Error("unauthorized");

      await axios.put("/api/cart/add", {
        productId,
        quantity: 1,
      });

      return productId; // return for onSuccess
    },
    onSuccess: (productId) => {
      toast.success("Product added to cart!");
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["products"] }); // ✅ refresh product stock

      // ✅ Dynamically update stock for this product in the "products" cache
      queryClient.setQueryData(["products"], (oldProducts) => {
        if (!oldProducts) return [];
        return oldProducts.map((product) =>
          product._id === productId && product.stock > 0
            ? { ...product, stock: product.stock - 1 }
            : product
        );
      });

      // ✅ Also update single product query if it's cached
      queryClient.setQueryData(["product", productId], (oldProduct) => {
        if (!oldProduct) return;
        return {
          ...oldProduct,
          stock: oldProduct.stock > 0 ? oldProduct.stock - 1 : 0,
        };
      });
    },
    onError: (error) => {
      if (error.message === "unauthorized") {
        toast.error("You need to log in to add to cart!");
        navigate("/login");
      } else {
        toast.error(
          error?.response?.data?.message || "Failed to add product to cart."
        );
      }
    },
  }); 

  const updateQuantity = useMutation({
    mutationFn: ({ productId, quantity }) =>
      axios.put("/api/cart/updateQuantity", { productId, quantity }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart"] }),
    onError: (err) =>
      toast.error(err.response?.data?.message || "Failed to update quantity"),
  });

  const removeItem = useMutation({
    mutationFn: ({ productId }) => axios.put("/api/cart/remove", { productId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Item removed");
    },
    onError: () => toast.error("Failed to remove item"),
  });
  const clearCart = useMutation({
    mutationFn: () => axios.put("/api/cart/clear"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Cart cleared.");
    },
    onError: () => toast.error("Failed to clear cart."),
  });

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoading,

        // ✅ Add to Cart
        addToCart: addToCart.mutate,
        addToCartLoading: addToCart.isPending,

        updateQuantity: updateQuantity.mutate,
        updateQuantityLoading: updateQuantity.isPending,

        removeItem: removeItem.mutate,
        removeItemLoading: removeItem.isPending,

        clearCart: clearCart.mutate,
        clearCartLoading: clearCart.isPending,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);*/

/* import { createContext, useContext } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";
import { AuthContext } from "./AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import { useProductStore } from "./ProductsStore.js";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { token, user } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const { updateProductStock } = useProductStore.getState();

  // Fetch cart
  const { data: cart, isLoading } = useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      const res = await axios.get("/api/cart");
      return res.data;
    },
    enabled: !!token,
  });

  // ✅ Add to cart with optimistic stock update
  const addToCart = useMutation({
    mutationFn: async (productId) => {
      const res = await axios.put("/api/cart/add", {
        productId,
        quantity: 1,
      });
      return res.data;
    },
    onMutate: async (productId) => {
      await queryClient.cancelQueries(["cart"]);
      const { stockMap, updateProductStock } = useProductStore.getState();
      const currentStock = stockMap[productId];
      const previousStock =
        typeof currentStock === "number" ? currentStock : undefined;

      if (previousStock > 0 || previousStock === undefined) {
        updateProductStock(productId, (previousStock ?? 1) - 1);
      }

      return { productId, previousStock };
    },
    onSuccess: (data) => {
      const updatedProduct = data.updatedProduct;
      updateProductStock(updatedProduct._id, updatedProduct.stock);
      toast.success("Added to cart!");
      queryClient.invalidateQueries(["cart"]);
    },
    onError: (error, _, context) => {
      if (context?.previousStock !== undefined) {
        updateProductStock(context.productId, context.previousStock);
      }
      toast.error(error.response?.data?.message || "Failed to add to cart.");
    },
  });

  // ✅ Update quantity with real-time stock sync
  const updateQuantity = useMutation({
    mutationFn: ({ productId, quantity }) =>
      axios.put("/api/cart/updateQuantity", { productId, quantity }),
    onSuccess: (res) => {
      const updatedProduct = res.data.updatedProduct;
      updateProductStock(updatedProduct._id, updatedProduct.stock);
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Failed to update quantity"),
  });

  // ✅ Remove item and restore stock
  const removeItem = useMutation({
    mutationFn: ({ productId }) => axios.put("/api/cart/remove", { productId }),
    onSuccess: (res) => {
      const updatedProduct = res.data.updatedProduct;
      updateProductStock(updatedProduct._id, updatedProduct.stock);
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Item removed");
    },
    onError: () => toast.error("Failed to remove item"),
  });

  // ✅ Clear cart and restore stock for all products
  const clearCart = useMutation({
    mutationFn: () => axios.put("/api/cart/clear"),
    onSuccess: (res) => {
      const updatedProducts = res.data.updatedProducts;
      if (Array.isArray(updatedProducts)) {
        updatedProducts.forEach((p) => updateProductStock(p._id, p.stock));
      }
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Cart cleared.");
    },
    onError: () => toast.error("Failed to clear cart."),
  });

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoading,

        addToCart: addToCart.mutate,
        addToCartLoading: addToCart.isPending,

        updateQuantity: updateQuantity.mutate,
        updateQuantityLoading: updateQuantity.isPending,

        removeItem: removeItem.mutate,
        removeItemLoading: removeItem.isPending,

        clearCart: clearCart.mutate,
        clearCartLoading: clearCart.isPending,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
 */
