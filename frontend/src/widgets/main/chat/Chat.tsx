import { Chat } from "@/features/main/chats/chat/ui";
import classes from "./Chat.module.css";
import { useParams } from "react-router-dom";
import { useChatsStore } from "@/features/main/chats/chats_content/model";
import { useEffect, useState } from "react";

const ChatWidget = () => {
  const { chatId } = useParams();
  const getChatTitle = useChatsStore((state) => state.getChatTitle);

  const [chatTitle, setChatTitle] = useState("");

  useEffect(() => {
    if (chatId) {
      setChatTitle(getChatTitle(chatId));
    }
  }, [chatId, getChatTitle]);

  return (
    chatId && (
      
        <div className={classes.chat_container}>
          <div className={classes.chat_title}>
            <h1>{chatTitle}</h1>
          </div>

          <div className={classes.chat}>
            <Chat />
          </div>
        </div>
      
    )
  );
};

export { ChatWidget };