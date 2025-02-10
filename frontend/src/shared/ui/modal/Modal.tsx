import { FC, ReactNode } from "react";
import classes from "./Modal.module.css";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

const Modal: FC<Props> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={classes.modalOverlay} onClick={handleOverlayClick}>
      <div className={classes.modal}>
        <button className={classes.modalCloseBtn} onClick={onClose}>
          &times;
        </button>
        <div className={classes.modalContent}>{children}</div>
      </div>
    </div>
  );
};

export { Modal };
