import { Button } from "@/shared/ui/button";
import { Logo } from "@/shared/ui/logo";
import classes from "./Header.module.css";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  const handleLoginClick = () => {
    navigate("/login");
  };
  const handleRegisterClick = () => {
    navigate("/register");
  };
  return (
    <header className={classes.header}>
      <Logo />
      <div className={classes.button_container}>
        <Button onClick={handleLoginClick}>Login</Button>
        <Button onClick={handleRegisterClick}>Register</Button>
      </div>
    </header>
  );
};

export { Header };
