import { Button } from "@/shared/ui/button";
import { FC } from "react";
import { useForm } from "react-hook-form";
import classes from "./ProjectDeleteStageModalContent.module.css";
import { useStagesStore } from "@/features/main/projects/stages_table/model";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

interface Props {
  onClose: () => void;
  id: string;
}

const ProjectDeleteStageModalContent: FC<Props> = ({ onClose, id }) => {
  const { handleSubmit } = useForm();
  const { projectId } = useParams<{ projectId: string }>();
  const { deleteStage } = useStagesStore();

  const submit = async () => {
    try {
      if (!projectId) return;
      await deleteStage(id, projectId);
      toast.success("Stage deleted successfully!");
      onClose();
    } catch (error) {
      console.error(error)
      toast.error("Failed to delete stage");
    }
  };

  return (
    <>
      <h2>Are you sure that you want to delete this stage?</h2>
      <form onSubmit={handleSubmit(submit)} className={classes.form}>
        <Button>Confirm Delete</Button>
      </form>
    </>
  );
};

export { ProjectDeleteStageModalContent };