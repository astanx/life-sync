import { Accordion } from "@/shared/ui/accordion";
import classes from "./ProjectsAccordion.module.css";
import { useProjectsStore } from "@/features/main/projects/projects_content/model";
import { useNavigate } from "react-router-dom";
import { FC, useEffect } from "react";

interface Props {
  closeMenu: () => void;
}

const ProjectsAccordion: FC<Props> = ({ closeMenu }) => {
  const projects = useProjectsStore((state) => state.projects);
  const updateLastOpenedProject = useProjectsStore(
    (state) => state.updateLastOpenedProject
  );
  const getProjects = useProjectsStore((state) => state.getProjects);
  const navigate = useNavigate();

  const handleClick = async (projectId: number) => {
    await updateLastOpenedProject(projectId.toString());
    await getProjects();
    closeMenu();
    navigate(`/dashboard/project/${projectId}`);
  };

  useEffect(() => {
    getProjects();
  }, []);

  return (
    <div className={classes.accordion_container}>
      <h6>Recent Projects</h6>
      <Accordion items={projects.slice(-5).reverse()} onClick={handleClick} />
    </div>
  );
};

export { ProjectsAccordion };
