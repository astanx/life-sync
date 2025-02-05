import company_logo from "@/shared/assets/images/company_logo.png";
import classes from "./Logo.module.css";
import { FC } from "react";

interface Props {
  small?: boolean;
}

const Logo: FC<Props> = ({ small }) => {
  return (
    <img
      src={company_logo}
      className={`${classes.logo} ${small ? classes.small : ""}`}
    />
  );
};

export { Logo };
