import { Logo } from "@/shared/ui/logo";
import {
  faBell,
  faHome,
  faMessage,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classes from "./Header.module.css";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  const handleClick = () => {
    navigate("/");
  };
  return (
    <header className={classes.header}>
      <div className={classes.logo_container}>
        <span onClick={handleClick}>
          <FontAwesomeIcon icon={faHome} />
        </span>
        <Logo small />
      </div>
      <div className={classes.icons_container}>
        <span>
          <FontAwesomeIcon icon={faBell} className={classes.icon} />
        </span>
        <span>
          <FontAwesomeIcon icon={faMessage} className={classes.icon} />
        </span>
        <span>
          <FontAwesomeIcon icon={faUser} className={classes.icon} />
        </span>
      </div>
    </header>
  );
};

export { Header };
