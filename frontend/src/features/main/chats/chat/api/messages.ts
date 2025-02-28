import { messagesIntence } from "@/features/main/chats/chat/api";

const messagesAPI = {
  getMessages: async (chatId: string) => {
    const response = await messagesIntence.get(`/${chatId}/messages`);
    return response;
  },
  createMessage: async (chatId: string, content: string) => {
    const response = await messagesIntence.post(`/${chatId}/messages`, {
      content,
    });
    return response;
  },
  updateMessage: async (messageId: string, content: string) => {
    const response = await messagesIntence.put(`/messages/${messageId}`, {
      content,
    });
    return response;
  },
  deleteMessage: async (messageId: string) => {
    const response = await messagesIntence.delete(`/messages/${messageId}`);
    return response;
  },
};

export { messagesAPI };
