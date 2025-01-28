import { FC, ReactNode } from "react";
import classes from "./Rectangle.module.css";

interface Props {
  children: ReactNode;
}

const Rectangle: FC<Props> = ({ children }) => {
  return <div className={classes.rectangle}>{children}</div>;
};
export { Rectangle };
