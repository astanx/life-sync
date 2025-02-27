import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { chatsAPI } from "@/features/main/chats/chats_content/api";

interface Chat {
  title: string;
  id: number;
}

interface Store {
  chats: Chat[];
  getChats: () => Promise<void>;
  getChatTitle: (chatId: string) => string;
}

const useChatsStore = create<Store>()(
  persist(
    (set, get) => ({
      chats: [],
      getChats: async () => {
        const response = await chatsAPI.getChats();
        if (response.data.error) {
          console.error(response.data.error);
          return;
        }

        set(() => ({ chats: response.data.chat }));
      },
      getChatTitle: (chatId: string) => {
        return get().chats.find((chat) => chat.id === +chatId)!.title;
      },
    }),

    {
      name: "chats-storage",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);

export { useChatsStore };
