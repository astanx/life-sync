import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Modal } from "@/shared/ui/modal";
import { FC } from "react";
import { useForm } from "react-hook-form";
import classes from "./ProjectTaskCreateModal.module.css";
import { toast } from "react-toastify";
import { tasksAPI } from "@/features/main/projects/kanban_board/api";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  stageId: number;
  projectId: string;
}

interface FormData {
  title: string;
}

const ProjectTaskCreateModal: FC<Props> = ({ isOpen, onClose, stageId, projectId }) => {
  const { register, handleSubmit, reset } = useForm<FormData>();
  const submit = async (data: FormData) => {
    try {
         await tasksAPI.createTask(
        { title: data.title, stage_id: stageId },
        projectId,
        stageId.toString()
      );

      toast.success("Task created successfully!");
      onClose();
      reset();
    } catch (error) {
      console.error(error);
      toast.error("Failed to create task");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2>Create New Task</h2>
      <form onSubmit={handleSubmit(submit)} className={classes.form}>
        <Input 
          placeholder="Task title" 
          {...register("title", { required: true })} 
        />
        <Button>Create Task</Button>
      </form>
    </Modal>
  );
};

export { ProjectTaskCreateModal };