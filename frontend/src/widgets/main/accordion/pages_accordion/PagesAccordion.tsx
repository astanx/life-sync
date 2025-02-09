import { Accordion } from "@/shared/ui/accordion";
import {
  faCalendar,
  faClipboardList,
  faHome,
  faMessage,
} from "@fortawesome/free-solid-svg-icons";
import classes from './PagesAccordion.module.css'
import { AddButton } from "@/shared/ui/add_button";
import { AddCalendarButton } from "@/features/main/add_calendar_button";


const PagesAccordion = () => {
  const accordionItems = [
    { title: "My projects", content: <AddButton title="Add new project"/>, icon: faHome },
    { title: "Chats", content: "Chats content", icon: faMessage },
    { title: "Tasks", content: <AddButton title="Add new task"/>, icon: faClipboardList },
    { title: "Calendar", content: <AddCalendarButton />, icon: faCalendar },
  ];
  return (
    <div className={classes.accordion_container}>
      <Accordion items={accordionItems} light />
    </div>
  );
};

export { PagesAccordion };
