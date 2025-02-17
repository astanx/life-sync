import { FC, useState } from "react";
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
import { useAuthStore } from "@/features/auth/model";
import { toast } from "react-toastify";

interface HeaderProps {
  menuOpen: boolean;
  toggleMenu: () => void;
}

const Header: FC<HeaderProps> = ({ menuOpen, toggleMenu }) => {
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const userId = useAuthStore((state) => state.id);
  const logout = useAuthStore((state) => state.logout)

  const handleLogoClick = () => {
    navigate("/");
  };

  const handleProfileClick = () => {
    setIsProfileOpen((prev) => !prev);
  };

  const handleCopyUserId = () => {
    if (userId) {
      navigator.clipboard.writeText(userId.toString());
      toast.info("ID copied to clipboard!");
    }
  };

  const handleLogoutClick = async() => {
    await logout()
    navigate('/')
  }

  return (
    <header className={classes.header}>
      <div className={classes.logo_container}>
        <button className={classes.menuButton} onClick={toggleMenu}>
          <FontAwesomeIcon icon={menuOpen ? faTimes : faBars} />
        </button>

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
        <span onClick={handleProfileClick}>
          <FontAwesomeIcon icon={faUser} className={classes.icon} />
          {isProfileOpen && (
            <div className={classes.profileMenu}>
              <div className={classes.userId} onClick={handleCopyUserId}>
                Your ID: {userId}
              </div>
              <button onClick={handleLogoutClick}>Log out</button>
            </div>
          )}
        </span>
      </div>
    </header>
  );
};

export { Header };
