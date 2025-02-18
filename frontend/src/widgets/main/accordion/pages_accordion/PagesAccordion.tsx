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
import { FC } from "react";

interface Props {
  closeMenu: () => void
}

const PagesAccordion: FC<Props> = ({closeMenu}) => {
  const accordionItems = [
    { title: "My projects", content: <ProjectsContent closeMenu={closeMenu}/>, icon: faHome, id: 1 },
    { title: "Chats", content: "Chats content", icon: faMessage, id: 2 },
    {
      title: "Tasks",
      content: <AddButton title="Add new task" />,
      icon: faClipboardList,
      id: 3
    },
    { title: "Calendar", content: <CalendarContent closeMenu={closeMenu}/>, icon: faCalendar, id: 4 },
  ];
  return (
    <div className={classes.accordion_container}>
      <Accordion items={accordionItems} light />
    </div>
  );
};

export { PagesAccordion };
