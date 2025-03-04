import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { messagesAPI } from "@/features/main/chats/chat/api";

interface Message {
  id: number;
  content: string;
  chat_id: number;
  user_id: number;
  created_at: string;
  sender: string;
}

interface Store {
  messages: Message[];
  getMessages: (chatId: string) => Promise<void>;
  sendMessage: (chatId: string, content: string) => Promise<void>;
  addMessage: (message: Message) => void;
}

const useMessagesStore = create<Store>()(
  persist(
    (set) => ({
      messages: [],
      getMessages: async (chatId: string) => {
        const response = await messagesAPI.getMessages(chatId);
        if (response.data.error) {
          console.error(response.data.error);
          return;
        }
        set({ messages: response.data.message || [] });
      },
      sendMessage: async (chatId: string, content: string) => {
        const response = await messagesAPI.createMessage(chatId, content);
        if (response.data.error) {
          console.error(response.data.error);
        }
      },
      addMessage: (message: Message) => {
        set((state) => {
          if (state.messages.some(m => m.id === message.id)) {
            return state;
          }
          return { messages: [...state.messages, message] };
        });
      },
    }),
    {
      name: "messages-storage",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);

export { useMessagesStore };