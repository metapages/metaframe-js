import { create } from "zustand";

interface MainStore {
  setShownPanel: (shownPanel: string | null) => void;
  shownPanel: string;
}

export const useStore = create<MainStore>((set, get) => ({
  setShownPanel: (shownPanel: string | null) => {
    set(() => ({ shownPanel }));
  },
  shownPanel: null,
}));