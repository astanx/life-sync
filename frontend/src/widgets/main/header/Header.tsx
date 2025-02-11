import { FC } from "react";
import { Logo } from "@/shared/ui/logo";
import {
  faBell,
  faMessage,
  faUser,
  faBars,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";
import classes from "./Header.module.css";

interface HeaderProps {
  menuOpen: boolean;
  toggleMenu: () => void;
}

const Header: FC<HeaderProps> = ({ menuOpen, toggleMenu }) => {
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate("/");
  };

  return (
    <header className={classes.header}>
      <div className={classes.logo_container}>
        {/* Кнопка меню теперь внутри flex-контейнера */}
        <button className={classes.menuButton} onClick={toggleMenu}>
          <FontAwesomeIcon icon={menuOpen ? faTimes : faBars} />
        </button>

        {/* Логотип теперь кликабельный и выполняет функцию перехода на главную */}
        <div onClick={handleLogoClick} className={classes.logoWrapper}>
          <Logo small />
        </div>
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