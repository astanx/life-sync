import { useState } from "react";
import { PagesAccordion } from "@/widgets/main/accordion/pages_accordion";
import { ProjectsAccordion } from "@/widgets/main/accordion/projects_accordion";
import { Header } from "@/widgets/main/header";
import classes from "./Main.module.css";
import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuthRedirect } from "@/shared/hooks";

const Main = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const isAuth = useAuthRedirect();

  if (!isAuth) return null;

  const closeMenu = () => setMenuOpen(false)

  return (
    <div>
      <Header menuOpen={menuOpen} toggleMenu={() => setMenuOpen(prev => !prev)} />

      <div className={classes.container}>
        <div className={`${classes.menu} ${menuOpen ? classes.open : ""}`}>
          <div className={classes.accordion_container}>
            <PagesAccordion closeMenu={closeMenu}/>
            <ProjectsAccordion closeMenu={closeMenu}/>
          </div>
        </div>

        <Outlet />
      </div>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </div>
  );
};

export { Main };
