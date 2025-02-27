import { chatIntence } from "@/features/main/chats/chats_content/api";

const chatsAPI = {
  getChats: async () => {
    const response = await chatIntence.get("");
    return response;
  }
};

export { chatsAPI };
