import { Rectangle } from "./Rectangle";
import login_image from "@/shared/assets/images/login_image.png";
import classes from './Rectangle.module.css'

const LoginRectangle = () => {
  return (
    <Rectangle>
      <img src={login_image} alt="login" className={classes.login_image}/>
    </Rectangle>
  );
};
export { LoginRectangle };
