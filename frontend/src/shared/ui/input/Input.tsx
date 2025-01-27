import { FC } from "react";
import classes from "./Input.module.css";

interface Props {
  placeholder?: string;
  type?: string;
  label?: string;
}

const Input: FC<Props> = (props) => {
  return props.label ? (
    <div className={classes.input_container}>
      <label htmlFor={`#${props.label}`} className={classes.label}>
        {props.label}
      </label>
      <input id={props.label} className={classes.input} {...props} />
    </div>
  ) : (
    <input className={classes.input} {...props} />
  );
};

export { Input };
