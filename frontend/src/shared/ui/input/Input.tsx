import { FC, forwardRef } from "react";
import classes from "./Input.module.css";

interface Props {
  placeholder?: string;
  type?: string;
  label?: string;
}

const Input: FC<Props> = forwardRef<HTMLInputElement, Props>((props, ref) => {
  return props.label ? (
    <div className={classes.input_container}>
      <label htmlFor={`#${props.label}`} className={classes.label}>
        {props.label}
      </label>
      <input id={props.label} className={classes.input} ref={ref} {...props} />
    </div>
  ) : (
    <input className={classes.input} ref={ref} {...props} />
  );
});

export { Input };
