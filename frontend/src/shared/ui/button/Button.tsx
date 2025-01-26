import { FC, ReactNode } from "react";
import classes from "./Button.module.css";

interface Props {
  children: ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

const Button: FC<Props> = ({ children, ...props }) => {
  return (
    <button className={classes.button} {...props}>
      {children}
    </button>
  );
};

export { Button };
