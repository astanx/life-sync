import { FC } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { toast } from "react-toastify";
import { useTasksStore } from "@/features/main/projects/kanban_board/model";
import { Task } from "@/features/main/projects/kanban_board/api";
import classes from "./ProjectTaskEditModal.module.css";

interface Props {
  task: Task;
  onClose: () => void;
}

const ProjectTaskEditModalContent: FC<Props> = ({ task, onClose }) => {
  const { register, handleSubmit } = useForm({
    defaultValues: { title: task.title },
  });

  const { updateTaskTitle } = useTasksStore();

  const onSubmit = async (data: { title: string }) => {
    try {
      await updateTaskTitle(task.id, data.title, task.projectId.toString());
      toast.success("Task updated successfully!");
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update task");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={classes.form}>
      <Input placeholder="Title" {...register("title", { required: true })} />
      <Button>Save</Button>
    </form>
  );
};

export { ProjectTaskEditModalContent };
