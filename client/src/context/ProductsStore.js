// context/ProductsStore.js
import { create } from "zustand";

export const useProductStore = create((set, get) => ({
  stockMap: {}, // Holds live stock data
  pendingAdditions: {}, // Flags to prevent multiple clicks
  products: [],

  // Set initial products and stock
  setProducts: (products) => {
    const stockMap = {};
    products.forEach((product) => {
      stockMap[product._id] = product.stock;
    });
    set({ products, stockMap });
  },

  // Set individual product stock manually
  setStock: (productId, stock) =>
    set((state) => ({
      stockMap: {
        ...state.stockMap,
        [productId]: stock,
      },
    })),

  // Update product stock reactively
  updateProductStock: (productId, newStock) =>
    set((state) => ({
      stockMap: {
        ...state.stockMap,
        [productId]: newStock,
      },
    })),

  // Prevent double additions
  setPendingAddition: (productId, isPending) =>
    set((state) => ({
      pendingAdditions: {
        ...state.pendingAdditions,
        [productId]: isPending,
      },
    })),

  // Smart handler to prevent race condition
  safeAddToCart: async (productId, addToCart) => {
    const { pendingAdditions } = get();
    if (pendingAdditions[productId]) return;
    get().setPendingAddition(productId, true);
    try {
      await addToCart(productId);
    } catch (err) {
      console.error("Add to cart error:", err);
    } finally {
      get().setPendingAddition(productId, false);
    }
  },
}));

/* import { create } from "zustand";

export const useProductStore = create((set, get) => ({
  products: [],
  stockMap: {},

  setProducts: (products) => {
    const stockMap = {};
    products.forEach((product) => {
      stockMap[product._id] = product.stock;
    });

    set(() => ({
      products,
      stockMap,
    }));
  },

  updateProductStock: (productId, newStock) =>
    set((state) => ({
      stockMap: {
        ...state.stockMap,
        [productId]: newStock,
      },
    })),

  updateMultipleStocks: (products) =>
    set((state) => {
      const updatedMap = { ...state.stockMap };
      products.forEach(({ _id, stock }) => {
        updatedMap[_id] = stock;
      });
      return { stockMap: updatedMap };
    }),

  getStock: (productId) => get().stockMap[productId],
})); */

/* import { create } from "zustand";

export const useProductStore = create((set) => ({
  products: [],
  setProducts: (products) => set({ products }),
  updateProductStock: (productId, newStock) =>
    set((state) => ({
      products: state.products.map((product) =>
        product._id === productId ? { ...product, stock: newStock } : product
      ),
    })),
})); */
// context/ProductsStore.js
/* import { create } from "zustand";

export const useProductStore = create((set) => ({
  productGroups: {}, // keys like topRated, mostSelling, etc.

  setProductGroup: (key, products) =>
    set((state) => ({
      productGroups: { ...state.productGroups, [key]: products },
    })),

  updateProductStock: (key, productId, newStock) =>
    set((state) => ({
      productGroups: {
        ...state.productGroups,
        [key]: state.productGroups[key]?.map((product) =>
          product._id === productId ? { ...product, stock: newStock } : product
        ),
      },
    })),
})); */

/* 
// context/ProductsStore.js
import { create } from "zustand";

export const useProductStore = create((set) => ({
  topRated: [],
  setTopRated: (data) => set({ topRated: data }),

  mostSelling: [],
  setMostSelling: (data) => set({ mostSelling: data }),

  discounts: [],
  setDiscounts: (data) => set({ discounts: data }),

  privateProducts: [],
  setPrivateProducts: (data) => set({ privateProducts: data }),

  favourites: [],
  setFavourites: (data) => set({ favourites: data }),

  allProducts: [],
  setAllProducts: (data) => set({ allProducts: data }),
}));
 */

/* import { create } from "zustand";

export const useProductStore = create((set, get) => ({
  products: [],
  stockMap: {},

  setProducts: (products) => {
    const stockMap = {};
    products.forEach((product) => {
      stockMap[product._id] = product.stock;
    });

    set(() => ({
      products,
      stockMap,
    }));
  },

  updateProductStock: (productId, newStock) =>
    set((state) => ({
      stockMap: {
        ...state.stockMap,
        [productId]: newStock,
      },
    })),

  updateMultipleStocks: (products) =>
    set((state) => {
      const updatedMap = { ...state.stockMap };
      products.forEach(({ _id, stock }) => {
        updatedMap[_id] = stock;
      });
      return { stockMap: updatedMap };
    }),

  getStock: (productId) => get().stockMap[productId],
})); */

/* import { create } from "zustand";

export const useProductStore = create((set) => ({
  products: [],
  setProducts: (products) => set({ products }),
  updateProductStock: (productId, newStock) =>
    set((state) => ({
      products: state.products.map((product) =>
        product._id === productId ? { ...product, stock: newStock } : product
      ),
    })),
})); */
// context/ProductsStore.js
/* import { create } from "zustand";

export const useProductStore = create((set) => ({
  productGroups: {}, // keys like topRated, mostSelling, etc.

  setProductGroup: (key, products) =>
    set((state) => ({
      productGroups: { ...state.productGroups, [key]: products },
    })),

  updateProductStock: (key, productId, newStock) =>
    set((state) => ({
      productGroups: {
        ...state.productGroups,
        [key]: state.productGroups[key]?.map((product) =>
          product._id === productId ? { ...product, stock: newStock } : product
        ),
      },
    })),
})); */

/* 
// context/ProductsStore.js
import { create } from "zustand";

export const useProductStore = create((set) => ({
  topRated: [],
  setTopRated: (data) => set({ topRated: data }),

  mostSelling: [],
  setMostSelling: (data) => set({ mostSelling: data }),

  discounts: [],
  setDiscounts: (data) => set({ discounts: data }),

  privateProducts: [],
  setPrivateProducts: (data) => set({ privateProducts: data }),

  favourites: [],
  setFavourites: (data) => set({ favourites: data }),

  allProducts: [],
  setAllProducts: (data) => set({ allProducts: data }),
}));
 */
