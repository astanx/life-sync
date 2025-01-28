import classes from "./Login.module.css";
import { LoginWidget } from "@/widgets/auth/login";
import { LoginRectangle } from "@/widgets/auth/rectangles/LoginRectangle";

const Login = () => {
  return (
    <div className={classes.login_container}>
      <LoginWidget />

      <LoginRectangle />
    </div>
  );
};

export { Login };
