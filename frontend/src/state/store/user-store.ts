import { create } from "zustand";
import { persist } from "zustand/middleware";
import { fetchUsers } from "../../services/api/user-api";
import type { User } from "../../types/api.types";

type LoadStatus = "idle" | "loading" | "success" | "error";

interface UserState {
  users: User[];
  currentUserId: string | null;
  status: LoadStatus;
  error: string | null;
  initializeUsers: () => Promise<void>;
  selectUser: (userId: string) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      users: [],
      currentUserId: null,
      status: "idle",
      error: null,

      initializeUsers: async () => {
        if (get().status === "loading") return;
        set({ status: "loading", error: null });

        try {
          const users = await fetchUsers();
          const selectedUserExists = users.some(
            (user) => user.id === get().currentUserId,
          );
          set({
            users,
            currentUserId: selectedUserExists
              ? get().currentUserId
              : (users[0]?.id ?? null),
            status: "success",
          });
        } catch (error: unknown) {
          set({
            status: "error",
            error:
              error instanceof Error
                ? error.message
                : "Could not load demo users",
          });
        }
      },

      selectUser: (currentUserId) => set({ currentUserId }),
    }),
    {
      name: "ajaia-user-store",
      partialize: (state) => ({ currentUserId: state.currentUserId }),
    },
  ),
);
