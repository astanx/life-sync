import { Input } from "@/shared/ui/input";
import { AuthButton } from "../auth_button";
import classes from "./RegisterForm.module.css";

const RegisterForm = () => {
  return (
    <form className={classes.form}>
      <Input label="Email" type="email" placeholder="Email" />
      <Input label="Password" type="password" placeholder="Password" />
      <Input label="Repeat password" type="password" placeholder="Password" />
      <AuthButton>Register</AuthButton>
    </form>
  );
};
export { RegisterForm };
