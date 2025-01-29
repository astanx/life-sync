import { intence, User, Response } from "@/features/auth/api";
const authAPI = {
  login: async (user: User) => {
    const response = await intence.post<Response>("login", user);
    return response;
  },
  register: async (user: User) => {
    const response = await intence.post<Response>("", user);
    return response;
  },
};

export { authAPI };
