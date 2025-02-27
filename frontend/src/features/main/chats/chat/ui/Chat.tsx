import { useEffect, useRef } from "react";
import classes from "./Chat.module.css";
import { SendMessage } from "@/features/main/chats/send_message";

const Chat = () => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messages = [
    {
      sender: "You",
      text: "Hello",
      time: new Date().toLocaleTimeString(),
    },
  ];

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);


  return (
    <div className={classes.chat}>
      <div className={classes.messages}>
        {messages.map((message, index) => (
          <div key={index} className={classes.message}>
            <div className={classes.message_sender}>{message.sender}</div>
            <div className={classes.message_text}>{message.text}</div>
            <div className={classes.message_time}>{message.time}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <SendMessage />
    </div>
  );
};

export { Chat };
