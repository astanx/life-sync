import { intence, User, Response, CookieLogin } from "@/features/auth/api";

const authAPI = {
  login: async (user: User) => {
    const response = await intence.post<Response>("/login", user);
    return response;
  },
  loginFromCookie: async () => {
    const response = await intence.get<CookieLogin>("/login");
    return response;
  },
  register: async (user: User) => {
    const response = await intence.post<Response>("", user);
    return response;
  },
  sendVerificationCode: async () => {
    const response = await intence.get("/verification");
    return response;
  },
  verifyCode: async (code: string) => {
    const response = await intence.post("/verification", { code });
    return response;
  },
};

export { authAPI };
