import calendar_preview from "@/shared/assets/images/calendar_preview.png";
import { About } from "@/widgets/home/about";
import { Header } from "@/widgets/home/header";
import classes from "./Home.module.css";
import { useAuthStore } from "@/features/auth/model";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const loginFromCookie = useAuthStore((state) => state.loginFromCookie);
  const isLogined = useAuthStore((state) => state.isLogined);
  const navigate = useNavigate();

  useEffect(() => {
    const hasRedirected = sessionStorage.getItem("hasRedirected");

    loginFromCookie().then(() => {
      if (isLogined && !hasRedirected) {
        sessionStorage.setItem("hasRedirected", "true");
        navigate("/dashboard");
      }
    });
  }, [loginFromCookie, navigate, isLogined]);
  return (
    <div>
      <Header />
      <div className={classes.about_container}>
        <About />
        <img src={calendar_preview} />
      </div>
    </div>
  );
};

export { Home };
