import { Button } from "@/shared/ui/button";
import { FC } from "react";
import { useForm } from "react-hook-form";
import classes from "./ProjectEditModalContent.module.css";
import { useParams } from "react-router-dom";
import { Input } from "@/shared/ui/input";
import { useProjectsStore } from "@/features/main/projects/projects_content/model";

interface Props {
  onClose: () => void;
}

interface FormData {
  title: string
}

const ProjectEditModalContent: FC<Props> = ({ onClose }) => {
  const getProjectTitle = useProjectsStore((state) => state.getProjectTitle);
  const updateProject = useProjectsStore((state) => state.updateProject);
  const { projectId } = useParams();
  const { register, handleSubmit, reset } = useForm<FormData>({
    defaultValues: {
      title: getProjectTitle(projectId || "1"),
    },
  });
  const submit = async (data: FormData) => {
    if (projectId){
      updateProject(data.title, projectId)
      onClose();
      reset();
    }

  };
  return (
    <>
      <h2>Enter title for calendar</h2>
      <form onSubmit={handleSubmit(submit)} className={classes.form}>
        <Input placeholder="Title" {...register("title", { required: true })} />
        <Button>Edit</Button>
      </form>
    </>
  );
};

export { ProjectEditModalContent };
