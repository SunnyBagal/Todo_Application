import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useUIStore = create(
  persist(
    (set) => ({
      statusFilter: 'all',
      priorityFilter: 'all',

      setStatusFilter: (status) => set({ statusFilter: status }),
      setPriorityFilter: (priority) => set({ priorityFilter: priority }),

      darkMode: true,
      toggleDarkMode: () => set((state) => ({darkMode: !state.darkMode})),
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({
        darkMode: state.darkMode,
      }),
    }
  )
);