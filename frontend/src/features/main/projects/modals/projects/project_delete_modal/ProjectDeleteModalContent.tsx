import { Button } from "@/shared/ui/button";
import { FC } from "react";
import { useForm } from "react-hook-form";
import classes from "./ProjectDeleteModalContent.module.css";
import { useNavigate, useParams } from "react-router-dom";
import { useProjectsStore } from "@/features/main/projects/projects_content/model";
import { toast } from "react-toastify";

interface Props {
  onClose: () => void;
}

const ProjectDeleteModalContent: FC<Props> = ({ onClose }) => {
  const { handleSubmit } = useForm<FormData>();
  const { projectId } = useParams();
  const deleteProject = useProjectsStore((state) => state.deleteProject);
  const navigate = useNavigate();

  const submit = async () => {
    try {
      if (projectId) {
        navigate("/dashboard");
        await deleteProject(projectId);
        toast.success("Project deleted successfully!");
        onClose();
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete project");
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
