import { TabsModal } from "@/shared/ui/tabs_modal";
import { ProjectEditStageModalContent } from "@/features/main/projects/modals/stages/project_edit_stage_modal";
import { ProjectDeleteStageModalContent } from "@/features/main/projects/modals/stages/project_delete_stage_modal";
import { FC } from "react";
import { Stage } from "@/features/main/projects/stages_table/api";

interface Props {
  isOpen: boolean;
  stage: Stage;
  onClose: () => void;
}

const ProjectStagesTabsModal: FC<Props> = ({ isOpen, onClose, stage }) => {
  return (
    <TabsModal
      isOpen={isOpen}
      onClose={onClose}
      editContent={
        <ProjectEditStageModalContent onClose={onClose} stage={stage} />
      }
      deleteContent={
        <ProjectDeleteStageModalContent
          onClose={onClose}
          id={String(stage.id)}
        />
      }
    />
  );
};

export { ProjectStagesTabsModal };
