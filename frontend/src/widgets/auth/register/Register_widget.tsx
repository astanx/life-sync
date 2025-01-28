import { Logo } from "@/shared/ui/logo";
import classes from "./Register_widget.module.css";
import { RegisterForm } from "@/features/auth/register_form";
import { useNavigate } from "react-router-dom";

const RegisterWidget = () => {
  const navigate = useNavigate();
  const handleLoginClick = () => {
    navigate("/login");
  };
  return (
    <div>
      <div className={classes.logo_container}>
        <Logo />
      </div>
      <div className={classes.register}>
        <h3>Register new account</h3>
        <p>
          Manage your time with LifeSync - plan your dreams, achieve your goals!
        </p>
        <RegisterForm />
        <span>
          Already have an account?{" "}
          <span className={classes.login} onClick={handleLoginClick}>
            Login now!
          </span>
        </span>
      </div>
    </div>
  );
};
export { RegisterWidget };
