import { useEffect, useRef } from "react";
import classes from "./Chat.module.css";
import { SendMessage } from "@/features/main/chats/send_message";
import { useMessagesStore } from "@/features/main/chats/chat/model";
import { useParams } from "react-router-dom";
import { formatDateTime } from "@/shared/utils";

const Chat = () => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messages = useMessagesStore((state) => state.messages);
  const getMessages = useMessagesStore((state) => state.getMessages);
  const { chatId } = useParams();

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    if (chatId) {
      const fetchData = async () => {        
        await getMessages(chatId);
      };
      fetchData();
    }
  }, [chatId, getMessages]);

  return (
    <div className={classes.chat}>
      {messages && (
        <div className={classes.messages}>
          {messages.map((message, index) => (
            <div key={index} className={classes.message}>
              <div className={classes.message_sender}>{message.sender}</div>
              <div className={classes.message_text}>{message.content}</div>
              <div className={classes.message_time}>{formatDateTime(message.created_at)}</div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      )}
      <SendMessage />
    </div>
  );
};

export { Chat };
