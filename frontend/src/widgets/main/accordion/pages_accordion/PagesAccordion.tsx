import { Accordion } from "@/shared/ui/accordion";
import {
  faCalendar,
  faClipboardList,
  faHome,
  faMessage,
} from "@fortawesome/free-solid-svg-icons";
import classes from './PagesAccordion.module.css'

const PagesAccordion = () => {
  const accordionItems = [
    { title: "My projects", content: "My projects content", icon: faHome },
    { title: "Chats", content: "Chats content", icon: faMessage },
    { title: "Tasks", content: "Tasks content", icon: faClipboardList },
    { title: "Calendar", content: "Calendar content", icon: faCalendar },
  ];
  return (
    <div className={classes.accordion_container}>
      <Accordion items={accordionItems} light />
    </div>
  );
};

export { PagesAccordion };
