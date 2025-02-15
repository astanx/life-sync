import { Button } from "@/shared/ui/button";
import { FC } from "react";
import { useForm } from "react-hook-form";
import classes from "./ProjectDeleteModalContent.module.css";
import { useNavigate, useParams } from "react-router-dom";
import { useProjectsStore } from "@/features/main/projects/projects_content/model";

interface Props {
  onClose: () => void;
}

const ProjectDeleteModalContent: FC<Props> = ({ onClose }) => {
  const { handleSubmit } = useForm<FormData>();
  const { projectId } = useParams();
  const deleteProject = useProjectsStore((state) => state.deleteProject);
  const navigate = useNavigate();

  const submit = () => {
    if (projectId) {
      deleteProject(projectId);
      onClose();
      navigate("/dashboard");
    }
  };
  return (
    <>
      <h2>Are you sure that you want to delete this project?</h2>
      <form onSubmit={handleSubmit(submit)} className={classes.form}>
        <Button>Submit</Button>
      </form>
    </>
  );
};

export { ProjectDeleteModalContent };
