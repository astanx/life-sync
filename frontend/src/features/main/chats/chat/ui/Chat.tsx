import { useEffect, useRef } from "react";
import classes from "./Chat.module.css";
import { SendMessage } from "@/features/main/chats/send_message";
import { useMessagesStore } from "@/features/main/chats/chat/model";
import { useParams } from "react-router-dom";
import { formatDateTime } from "@/shared/utils";

const Chat = () => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const ws = useRef<WebSocket | null>(null);
  const messages = useMessagesStore((state) => state.messages);
  const getMessages = useMessagesStore((state) => state.getMessages);
  const { chatId } = useParams();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!chatId) return;

    getMessages(chatId);

    ws.current = new WebSocket(
      `wss://lifesync-backend.onrender.com/api/chat/${chatId}/ws`
    );

    ws.current.onopen = () => {
      console.log("WebSocket connected");
    };

    ws.current.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        useMessagesStore.getState().addMessage(message);
      } catch (error) {
        console.error("Error parsing message:", error);
      }
    };

    ws.current.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.current.onclose = () => {
      console.log("WebSocket disconnected");
    };

    return () => {
      ws.current?.close();
    };
  }, [chatId, getMessages]);

  return (
    <div className={classes.chat}>
      <div className={classes.messages}>
        {messages.map((message) => (
          <div key={message.id} className={classes.message}>
            <div className={classes.message_sender}>{message.sender}</div>
            <div className={classes.message_text}>{message.content}</div>
            <div className={classes.message_time}>
              {formatDateTime(message.created_at)}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <SendMessage />
    </div>
  );
};

export { Chat };
