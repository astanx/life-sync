import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Modal } from "@/shared/ui/modal";
import { FC } from "react";
import { useForm } from "react-hook-form";
import classes from "./ProjectCreateModal.module.css";
import { useNavigate } from "react-router-dom";
import { useProjectsStore } from "@/features/main/projects/projects_content/model";
import { toast } from "react-toastify";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}
interface FormData {
  title: string;
}

const ProjectCreateModal: FC<Props> = ({ isOpen, onClose }) => {
  const createProject = useProjectsStore((state) => state.createProject);
  const { register, handleSubmit, reset } = useForm<FormData>();
  const navigate = useNavigate();
  const submit = async (data: FormData) => {
    try {
      if (data.title) {
        const projectId = await createProject(data.title);
        toast.success("Project created successfully!");
        onClose();
        reset();
        navigate(`/dashboard/project/${projectId}`);
      }
    } catch (error) {
      console.error(error)
      toast.error("Failed to create project");
    }
  };
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2>Enter title for project</h2>
      <form onSubmit={handleSubmit(submit)} className={classes.form}>
        <Input placeholder="Title" {...register("title", { required: true })} />
        <Button>Submit</Button>
      </form>
    </Modal>
  );
};

export { ProjectCreateModal };
