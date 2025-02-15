import { AddProjectButton } from "@/features/main/projects/add_project_button";
import { useEffect } from "react";
import { useProjectsStore } from "@/features/main/projects/projects_content/model";
import classes from './ProjectsContent.module.css'
import { useNavigate } from "react-router-dom";

const ProjectsContent = () => {
    const getProjects = useProjectsStore((state) => state.getProjects);
  const projects = useProjectsStore((state) => state.projects);
  const navigate = useNavigate();

  useEffect(() => {
    getProjects();
  }, [getProjects]);

  const handleClick = (id: number) => {
    navigate(`/dashboard/project/${id}`);
  };

  return (
    <div>
      {projects.slice(-5).map((project) => (
        <p
          key={project.id}
          className={classes.project}
          onClick={() => handleClick(project.id)}
        >
          {project.title}
        </p>
      ))}
      <AddProjectButton />
    </div>
  );
}

export { ProjectsContent };