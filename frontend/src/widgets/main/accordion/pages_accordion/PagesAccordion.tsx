import { Accordion } from "@/shared/ui/accordion";
import {
  faCalendar,
  faClipboardList,
  faHome,
  faMessage,
} from "@fortawesome/free-solid-svg-icons";
import classes from "./PagesAccordion.module.css";
import { AddButton } from "@/shared/ui/add_button";
import { CalendarContent } from "@/features/main/calendars/calendar_content/ui";
import { ProjectsContent } from "@/features/main/projects/projects_content/ui";
import { FC, useState } from "react";
import { ChatsContent } from "@/features/main/chats/chats_content/ui";

interface Props {
  closeMenu: () => void;
}

const PagesAccordion: FC<Props> = ({ closeMenu }) => {
  const accordionItems = [
    {
      title: "My projects",
      content: <ProjectsContent closeMenu={closeMenu} />,
      icon: faHome,
      id: 1,
    },
    {
      title: "Chats",
      content: <ChatsContent closeMenu={closeMenu} />,
      icon: faMessage,
      id: 2,
    },
    {
      title: "Tasks",
      content: <AddButton title="Add new task" />,
      icon: faClipboardList,
      id: 3,
    },
    {
      title: "Calendar",
      content: <CalendarContent closeMenu={closeMenu} />,
      icon: faCalendar,
      id: 4,
    },
  ];
  const [activeId, setActiveId] = useState(0);
  const handleClick = (id: number) => {
    if (id === activeId) {
      setActiveId(0);
    } else setActiveId(id);
  };
  return (
    <div className={classes.accordion_container}>
      <Accordion
        items={accordionItems}
        light
        activeId={activeId}
        onClick={handleClick}
      />
    </div>
  );
};

export { PagesAccordion };
