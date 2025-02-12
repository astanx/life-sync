import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  authAPI,
  Response,
  User,
  VerifyCodeResponse,
} from "@/features/auth/api";

interface Store {
  email: string;
  id: number;
  isLogined: boolean;
  login: (user: User) => Promise<Response>;
  loginFromCookie: () => Promise<void>;
  register: (user: User) => Promise<Response>;
  sendVerificationCode: () => Promise<VerifyCodeResponse>;
  verifyCode: (code: string[]) => Promise<VerifyCodeResponse>;
}

const useAuthStore = create<Store>()(
  persist(
    (set) => ({
      email: "",
      id: 0,
      isLogined: false,
      login: async (user: User) => {
        try {
          const response = await authAPI.login(user);

          if (response.data.error) {
            return { error: response.data.error, id: 0 };
          }
          set(() => ({
            id: response.data.id,
            email: user.email,
          }));

          return { id: response.data.id };
        } catch (e) {
          const errorMessage =
            e instanceof Error ? e.message : "An unknown error occurred";
          return { error: errorMessage, id: 0 };
        }
      },
      loginFromCookie: async () => {
        const response = await authAPI.loginFromCookie();
        if (response.data.error) {
          return;
        }
        set(() => ({
          id: response.data.id,
          email: response.data.email,
          isLogined: true,
        }));
      },
      register: async (user: User) => {
        try {
          const response = await authAPI.register(user);

          if (response.data.error) {
            return { error: response.data.error, id: 0 };
          }
          set(() => ({
            id: response.data.id,
            email: user.email,
          }));

          return { id: response.data.id };
        } catch (e) {
          const errorMessage =
            e instanceof Error ? e.message : "An unknown error occurred";
          return { error: errorMessage, id: 0 };
        }
      },
      sendVerificationCode: async () => {
        try {
          const response = await authAPI.sendVerificationCode();

          if (response.data.error) {
            return { error: response.data.error };
          }
          return { message: "Verify send success" };
        } catch (e) {
          const errorMessage =
            e instanceof Error ? e.message : "An unknown error occurred";
          return { error: errorMessage };
        }
      },
      verifyCode: async (code: string[]) => {
        try {
          const response = await authAPI.verifyCode(code.join(""));
          if (response.data.error) {
            return { error: response.data.error };
          }
          set(() => ({ isLogined: true }));
          return { message: "Verify success" };
        } catch (e) {
          const errorMessage =
            e instanceof Error ? e.message : "An unknown error occurred";
          return { error: errorMessage };
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
