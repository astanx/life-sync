import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { authAPI, Response, User } from "@/features/auth/api";

interface Store {
  email: string;
  id: number;
  login: (user: User) => Promise<Response>;
}
const useAuthStore = create<Store>()(
  persist(
    (set) => ({
      email: "",
      id: 0,
      login: async (user: User): Promise<Response> => {
        try {
          const response = await authAPI.login(user);

          if (response.data.error) {
            return { error: response.data.error, id: 0 };
          }
          set(() => ({ id: response.data.id, email: user.email }));

          return { id: response.data.id };
        } catch (e) {
          const errorMessage =
            e instanceof Error ? e.message : "An unknown error occurred";
          return { error: errorMessage, id: 0 };
        }
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);

export { useAuthStore };
