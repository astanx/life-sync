import React from "react";
import classes from "./AddButton.module.css";

interface AddNewProjectProps {
  title?: string;
  light?: boolean;
  onClick?: (data: any) => void
}

const AddButton: React.FC<AddNewProjectProps> = ({ title, light, onClick }) => {
  return (
    <div className={`${classes.container} ${light ? classes.light : ""}`} onClick={onClick}>
      <div className={classes.circle}>
        <span>+</span>
      </div>
      {title && <div className={classes.title}>{title}</div>}
    </div>
  );
};

export { AddButton };
