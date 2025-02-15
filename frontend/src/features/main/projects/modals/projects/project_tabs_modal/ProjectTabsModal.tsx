import { TabsModal } from "@/shared/ui/tabs_modal";
import { FC } from "react";
import { ProjectEditModalContent } from "@/features/main/projects/modals/projects/project_edit_modal";
import { ProjectDeleteModalContent } from "@/features/main/projects/modals/projects/project_delete_modal";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const ProjectTabsModal: FC<Props> = ({ isOpen, onClose }) => {
  return (
    <TabsModal
      onClose={onClose}
      isOpen={isOpen}
      editContent={<ProjectEditModalContent onClose={onClose} />}
      deleteContent={<ProjectDeleteModalContent onClose={onClose} />}
    />
  );
};

export { ProjectTabsModal };
