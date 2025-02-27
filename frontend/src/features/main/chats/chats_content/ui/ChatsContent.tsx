import { useChatsStore } from "@/features/main/chats/chats_content/model";
import { FC, useEffect } from "react";
import classes from "./ChatsContent.module.css";
import { useNavigate } from "react-router-dom";

interface Props {
  closeMenu: () => void;
}

const ChatsContent: FC<Props> = ({ closeMenu }) => {
  const chats = useChatsStore((state) => state.chats);
  const getChats = useChatsStore((state) => state.getChats);
  const navigate = useNavigate();

  useEffect(() => {
    getChats();
  }, [getChats]);

  const handleClick = (id: number) => {
    closeMenu();
    navigate(`/dashboard/chat/${id}`);
  };

  return chats ? (
    <div>
      {chats
        .slice(-5)
        .reverse()
        .map((chat) => (
          <p
            key={chat.id}
            className={classes.chat}
            onClick={() => handleClick(chat.id)}
          >
            {chat.title}
          </p>
        ))}
    </div>
  ) : (
    <div  className={classes.chat}>No chats yet</div>
  );
};

export { ChatsContent };
