import { Input } from "@/shared/ui/input";
import { AuthButton } from "../auth_button";
import classes from "./LoginForm.module.css";

const LoginForm = () => {
  return (
    <form className={classes.form}>
      <Input label="Email" type="email" placeholder="Email" />
      <Input label="Password" type="password" placeholder="Password" />
      <AuthButton>Login</AuthButton>
    </form>
  );
};
export { LoginForm };
