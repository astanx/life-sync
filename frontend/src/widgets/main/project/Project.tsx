import classes from "./Project.module.css";
import { StagesTable } from "@/features/main/projects/stages_table/ui";
import { AddStageButton } from "@/features/main/projects/add_stage_button";
import { ModeSwitcher } from "@/features/main/projects/mode_switcher/ModeSwitcher";
import { useProjectsStore } from "@/features/main/projects/projects_content/model";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { ProjectTabsModal } from "@/features/main/projects/modals/projects/project_tabs_modal";

const ProjectWidget = () => {
  const getProjectTitle = useProjectsStore((state) => state.getProjectTitle);
  const [isOpenModal, setIsOpenModal] = useState(false)

  const { projectId } = useParams();

  const [title, setTitle] = useState("");

  useEffect(() => {
    if (projectId) {
      setTitle(getProjectTitle(projectId));
    }
  }, [projectId, isOpenModal]);

  const handleCloseModal = () => {
    setIsOpenModal(false)
  }
  const handleClick = () => {
    setIsOpenModal(true)
  }

  return (
    <>
        <div className={classes.table_container}>
      <div className={classes.table_header}>
        <h1 onClick={handleClick}>{title}</h1>
        <ModeSwitcher />
        <AddStageButton />
      </div>
      <div className={classes.table}>
        <StagesTable />
      </div>
    </div>
    <ProjectTabsModal isOpen={isOpenModal} onClose={handleCloseModal}/>
    </>

  );
};

export { ProjectWidget };
