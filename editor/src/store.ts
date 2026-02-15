import { create } from "zustand";

interface MainStore {
  setShownPanel: (shownPanel: string | null) => void;
  shownPanel: string;
  fileUploadTrigger: (() => void) | null;
  setFileUploadTrigger: (trigger: (() => void) | null) => void;
  triggerFileUpload: () => void;
}

export const useStore = create<MainStore>((set, get) => ({
  setShownPanel: (shownPanel: string | null) => {
    set(() => ({ shownPanel }));
  },
  shownPanel: null,
  fileUploadTrigger: null,
  setFileUploadTrigger: (trigger: (() => void) | null) => {
    set(() => ({ fileUploadTrigger: trigger }));
  },
  triggerFileUpload: () => {
    const trigger = get().fileUploadTrigger;
    if (trigger) trigger();
  },
}));
