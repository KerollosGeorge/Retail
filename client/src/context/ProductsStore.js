// context/ProductsStore.js
import { create } from "zustand";

export const useProductStore = create((set, get) => ({
  stockMap: {},
  pendingAdditions: {},
  products: [],

  // Merge products without overwriting existing tracked stocks
  setProducts: (products) =>
    set((state) => {
      const next = { ...state.stockMap };
      for (const p of products) {
        if (next[p._id] === undefined) {
          next[p._id] = p.stock;
        }
      }
      return { products, stockMap: next };
    }),

  setStock: (productId, stock) =>
    set((state) => ({
      stockMap: { ...state.stockMap, [productId]: stock },
    })),

  updateProductStock: (productId, newStock) =>
    set((state) => ({
      stockMap: { ...state.stockMap, [productId]: newStock },
    })),

  // ✅ New: update multiple products' stock at once
  bulkUpdateStocks: (stockUpdates) =>
    set((state) => {
      const updatedStockMap = { ...state.stockMap };
      stockUpdates.forEach(({ productId, stock }) => {
        updatedStockMap[productId] = stock;
      });
      return { stockMap: updatedStockMap };
    }),

  setPendingAddition: (productId, isPending) =>
    set((state) => ({
      pendingAdditions: { ...state.pendingAdditions, [productId]: isPending },
    })),

  safeAddToCart: async (productId, addToCart) => {
    const { pendingAdditions } = get();
    if (pendingAdditions[productId]) return null;
    get().setPendingAddition(productId, true);
    try {
      const result = await addToCart(productId);
      return result;
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
