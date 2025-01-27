import { useNavigate } from "react-router-dom";
import classes from "./StartButton.module.css";

const StartButton = () => {
  const navigate = useNavigate();
  const handleClick = () => {
    navigate("/login");
  };
  return (
    <button className={classes.button} onClick={handleClick}>
      Start now
    </button>
  );
};

export { StartButton };
