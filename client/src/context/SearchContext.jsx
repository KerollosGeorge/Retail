import { create } from "zustand";

export const useSearch = create((set) => ({
  searchValue: "",
  setSearchValue: (s) => set({ searchValue: s }),
}));
