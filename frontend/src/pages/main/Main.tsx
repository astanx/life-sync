import { PagesAccordion } from "@/widgets/main/accordion/pages_accordion";
import { ProjectsAccordion } from "@/widgets/main/accordion/projects_accordion";
import { CalendarWidget } from "@/widgets/main/calendar";
import { Header } from "@/widgets/main/header";
import classes from "./Main.module.css";

const Main = () => {
  return (
    <div>
      <Header />
      <div className={classes.container}>
        <div className={classes.accordion_container}>
          <PagesAccordion />
          <ProjectsAccordion />
        </div>
        <CalendarWidget />
      </div>
    </div>
  );
};

export { Main };
