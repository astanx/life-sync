import { FC, ReactNode } from "react";
import classes from "./AuthButton.module.css";

interface Props {
  children: ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

const AuthButton: FC<Props> = ({ children, ...props }) => {
  return (
    <button className={classes.button} {...props}>
      {children}
    </button>
  );
};

export { AuthButton };
