import { Button } from "@/shared/ui/button";
import { Logo } from "@/shared/ui/logo";
import classes from "./Header.module.css";

const Header = () => {
  return (
    <header className={classes.header}>
      <Logo />
      <div className={classes.button_container}>
        <Button>Login</Button>
        <Button>Register</Button>
      </div>
    </header>
  );
};

export { Header };
