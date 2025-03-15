import { TabsModal } from "@/shared/ui/tabs_modal";
import { FC } from "react";
import { ProjectTaskEditModalContent } from "@/features/main/projects/modals/tasks/project_task_edit_modal_content";
import { ProjectTaskDeleteModalContent } from "@/features/main/projects/modals/tasks/project_task_delete_modal_content";
import { Task } from "@/features/main/projects/kanban_board/api";

interface Props {
  isOpen: boolean;
  task: Task;
  onClose: () => void;
}

const ProjectTaskTabsModal: FC<Props> = ({ isOpen, onClose, task }) => {
  return (
    <TabsModal
      isOpen={isOpen}
      onClose={onClose}
      editContent={
        <ProjectTaskEditModalContent onClose={onClose} task={task}/>
      }
      deleteContent={
        <ProjectTaskDeleteModalContent
          onClose={onClose}
          task={task}
        />
      }
    />
  );
};

export { ProjectTaskTabsModal };
