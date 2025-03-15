import classes from "./Project.module.css";
import { StagesTable } from "@/features/main/projects/stages_table/ui";
import { AddStageButton } from "@/features/main/projects/add_stage_button";
import { ModeSwitcher } from "@/features/main/projects/mode_switcher/ModeSwitcher";
import { useProjectsStore } from "@/features/main/projects/projects_content/model";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { ProjectTabsModal } from "@/features/main/projects/modals/projects/project_tabs_modal";
import { AddButton } from "@/shared/ui/add_button";
import { AddCollaboratorModal } from "@/features/main/projects/modals/projects/add_collaborator_modal";
import { KanbanBoard } from "@/features/main/projects/kanban_board/ui";

type Switches = "calendar" | "kanban";
const ProjectWidget = () => {
  const getProjectTitle = useProjectsStore((state) => state.getProjectTitle);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isOpenCollaboratorModal, setIsOpenCollaboratorModal] = useState(false);
  const [activeTab, setActiveTab] = useState<Switches>("kanban");

  const { projectId } = useParams();

  const [title, setTitle] = useState("");

  useEffect(() => {
    if (projectId) {
      setTitle(getProjectTitle(projectId));
    }
  }, [projectId, isOpenModal, getProjectTitle]);

  const handleCloseModal = () => {
    setIsOpenModal(false);
  };
  const handleClick = () => {
    setIsOpenModal(true);
  };

  const handleOpenCollaboratorModal = () => {
    setIsOpenCollaboratorModal(true);
  };

  const handleCloseCollaboratorModal = () => {
    setIsOpenCollaboratorModal(false);
  };

  const handleTabSwitch = (tab: Switches) => {
    setActiveTab(tab);
  };

  return (
    <>
      <div className={classes.table_container}>
        <div className={classes.table_header}>
          <div className={classes.titleWrapper}>
            <h1 onClick={handleClick}>{title}</h1>
            <div className={classes.addButtonWrapper}>
              <AddButton
                title="Add collaborator"
                onClick={handleOpenCollaboratorModal}
              />
            </div>
          </div>
          <ModeSwitcher onSwitch={handleTabSwitch} active={activeTab} />
          <AddStageButton />
        </div>
        <div className={classes.table}>
          {activeTab === "calendar" ? <StagesTable /> : <KanbanBoard />}
        </div>
      </div>
      <ProjectTabsModal isOpen={isOpenModal} onClose={handleCloseModal} />
      <AddCollaboratorModal
        isOpen={isOpenCollaboratorModal}
        onClose={handleCloseCollaboratorModal}
      />
    </>
  );
};

export { ProjectWidget };
