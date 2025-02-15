import React from "react";
import classes from "./AddButton.module.css";

interface Props {
  title?: string;
  light?: boolean;
  responsive?: boolean;
  onClick?: (data: any) => void;
}

const AddButton: React.FC<Props> = ({ title, light, responsive, onClick }) => {
  return (
    <div className={`${classes.container} ${light ? classes.light : ""} ${responsive ? classes.responsive : ""}`} onClick={onClick}>
      <div className={classes.circle}>
        <span>+</span>
      </div>
      {title && <div className={classes.title}>{title}</div>}
    </div>
  );
};

export { AddButton };
