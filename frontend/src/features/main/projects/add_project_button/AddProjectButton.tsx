import { AddButton } from "@/shared/ui/add_button";
import { useState } from "react";
import { ProjectCreateModal } from "../modals/projects/project_create_modal";

const AddProjectButton = () => {
  const [isOpenModal, setIsOpenModal] = useState(false);

  const handleClick = () => {
    setIsOpenModal(true);
  };

  const onClose = () => {
    setIsOpenModal(false);
  };
  return (
    <div>
      <AddButton title="Add new project" onClick={handleClick} />
      <ProjectCreateModal isOpen={isOpenModal} onClose={onClose} />
    </div>
  );
};

export { AddProjectButton };
