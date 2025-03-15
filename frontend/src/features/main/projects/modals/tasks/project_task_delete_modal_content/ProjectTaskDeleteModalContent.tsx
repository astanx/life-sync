import { FC } from "react";
import { Button } from "@/shared/ui/button";
import { toast } from "react-toastify";
import { useTasksStore } from "@/features/main/projects/kanban_board/model";
import { Task } from "@/features/main/projects/kanban_board/api";
import classes from "./ProjectTaskDeleteModalContent.module.css";
import { useForm } from "react-hook-form";

interface Props {
  task: Task;
  onClose: () => void;
}

const ProjectTaskDeleteModalContent: FC<Props> = ({ task, onClose }) => {
  const { handleSubmit } = useForm();
  const { deleteTask } = useTasksStore();
  
  const submit = async () => {
    try {
      await deleteTask(task.id, task.stageId, task.projectId.toString());
      toast.success("Task deleted successfully!");
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete task");
    }
  };

  return (
    <form className={classes.form} onSubmit={handleSubmit(submit)}>
      <h3>Are you sure you want to delete this task?</h3>
      <div>
        <Button>Delete</Button>
      </div>
    </form>
  );
};
export { ProjectTaskDeleteModalContent };
