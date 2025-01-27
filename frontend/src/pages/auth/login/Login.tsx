import { Logo } from "@/shared/ui/logo";
import { Input } from "@/shared/ui/input";
import login_image from "@/shared/assets/images/login_image.png";
import classes from "./Login.module.css";
import { AuthButton } from "../ui/button";

const Login = () => {
  return (
    <div className={classes.login_container}>
      <div>
        <div className={classes.logo_container}>
          <Logo />
        </div>

        <div className={classes.login}>
          <h3>Login to your account</h3>
          <p>
            Manage your time with LifeSync - plan your dreams, achieve your
            goals!
          </p>
          <form className={classes.form}>
            <Input label="Email" type="email" placeholder="Email" />
            <Input label="Password" type="password" placeholder="Password" />
            <AuthButton>Login</AuthButton>
          </form>
          <span>
            Don't have an account yet?{" "}
            <span className={classes.register}>Register now</span>
          </span>
        </div>
      </div>

      <div className={classes.rectangle}>
        <img src={login_image} alt="login" />
      </div>
    </div>
  );
};

export { Login };
