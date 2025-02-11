import { useState } from "react";
import { PagesAccordion } from "@/widgets/main/accordion/pages_accordion";
import { ProjectsAccordion } from "@/widgets/main/accordion/projects_accordion";
import { CalendarWidget } from "@/widgets/main/calendar";
import { Header } from "@/widgets/main/header";
import classes from "./Main.module.css";

const Main = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div>
      <Header menuOpen={menuOpen} toggleMenu={() => setMenuOpen(!menuOpen)} />

      <div className={`${classes.menu} ${menuOpen ? classes.open : ""}`}>
        <div className={classes.accordion_container}>
          <PagesAccordion />
          <ProjectsAccordion />
        </div>
      </div>

      <div className={classes.container}>
        <CalendarWidget />
      </div>
    </div>
  );
};

export { Main };
