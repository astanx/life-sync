import { RegisterWidget } from "@/widgets/auth/register";
import classes from "./Register.module.css";
import { RegisterRectangle } from "@/widgets/auth/rectangles";

const Register = () => {
  return (
    <div className={classes.register_container}>
      <RegisterWidget />
      <RegisterRectangle />
    </div>
  );
};

export { Register };
