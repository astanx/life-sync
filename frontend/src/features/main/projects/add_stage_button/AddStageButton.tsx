import { AddButton } from "@/shared/ui/add_button";
import { useState } from "react";
import { ProjectCreateStageModal } from "@/features/main/projects/modals/stages/project_create_stage_modal";

const AddStageButton = () => {
  const [isOpenModal, setIsOpenModal] = useState(false);

  const handleClick = () => {
    setIsOpenModal(true);
  };

  const onClose = () => {
    setIsOpenModal(false);
  };
  return (
    <div>
      <AddButton title="Add new stage" onClick={handleClick} responsive/>
      <ProjectCreateStageModal isOpen={isOpenModal} onClose={onClose} />
    </div>
  );
};

export { AddStageButton };
