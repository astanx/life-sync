import { LoginForm } from "@/features/auth/login_form";
import classes from "./Login_widget.module.css";
import { Logo } from "@/shared/ui/logo";
import { useNavigate } from "react-router-dom";

const LoginWidget = () => {
  const navigate = useNavigate();
  const handleRegisterClick = () => {
    navigate("/register");
  };
  return (
    <div>
      <div className={classes.logo_container}>
        <Logo />
      </div>
      <div className={classes.login}>
        <h3>Login to your account</h3>
        <p>
          Manage your time with LifeSync - plan your dreams, achieve your goals!
        </p>
        <LoginForm />
        <span>
          Don't have an account yet?{" "}
          <span className={classes.register} onClick={handleRegisterClick}>
            Register now
          </span>
        </span>
      </div>
    </div>
  );
};
export { LoginWidget };
