import { FC, ReactNode, useState } from "react";
import { Modal } from "@/shared/ui/modal";
import classes from "./TabsModal.module.css";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editContent: ReactNode;
  deleteContent: ReactNode;
}

const TabsModal: FC<Props> = ({
  isOpen,
  onClose,
  editContent,
  deleteContent,
}) => {
  const [activeTab, setActiveTab] = useState<"edit" | "delete">("edit");

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className={classes.tabs}>
        <button
          className={activeTab === "edit" ? classes.activeTab : ""}
          onClick={() => setActiveTab("edit")}
        >
          Edit
        </button>
        <button
          className={activeTab === "delete" ? classes.activeTab : ""}
          onClick={() => setActiveTab("delete")}
        >
          Delete
        </button>
      </div>
      <div className={classes.tabContent}>
        {activeTab === "edit" ? editContent : deleteContent}
      </div>
    </Modal>
  );
};

export { TabsModal };
