import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LayoutState {
  sidebarWidth: number;
  collapsed: boolean;
  setSidebarWidth: (width: number) => void;
  toggleCollapse: () => void;
}

export const useLayoutStore = create<LayoutState>()(
  persist(
    (set, get) => ({
      sidebarWidth: 20,
      collapsed: false,
      setSidebarWidth: (width: number) => set({ sidebarWidth: width }),
      toggleCollapse: () => set((state) => ({ collapsed: !state.collapsed })),
    }),
    {
      name: 'layout-storage',
    }
  )
);