import company_logo from "@/shared/assets/images/company_logo.png";
import classes from "./Logo.module.css";

const Logo = () => {
  return <img src={company_logo} className={classes.logo} />;
};

export { Logo };
