import { useState } from "react";
import { PagesAccordion } from "@/widgets/main/accordion/pages_accordion";
import { ProjectsAccordion } from "@/widgets/main/accordion/projects_accordion";
import { Header } from "@/widgets/main/header";
import classes from "./Main.module.css";
import { Outlet } from "react-router-dom";

const Main = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div>
      <Header menuOpen={menuOpen} toggleMenu={() => setMenuOpen(!menuOpen)} />

      <div className={classes.container}>
        <div className={`${classes.menu} ${menuOpen ? classes.open : ""}`}>
          <div className={classes.accordion_container}>
            <PagesAccordion />
            <ProjectsAccordion />
          </div>
        </div>

        <Outlet />
      </div>
    </div>
  );
};

export { Main };
