import { create } from 'zustand';

interface ScrollState {
  meScrollY: number;
  setMeScrollY: (y: number) => void;
}

export const useScrollStore = create<ScrollState>((set) => ({
  meScrollY: 0,
  setMeScrollY: (meScrollY) => set({ meScrollY }),
}));
