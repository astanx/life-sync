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
  const { handleSubmit } = useForm<FormData>();
  const { projectId } = useParams();
  const deleteStage = useStagesStore((state) => state.deleteStage);
  const submit = () => {
    try {
      if (projectId) {
        deleteStage(id, projectId);
        toast.success("Stage deleted successfully!");
        onClose();
      }
    } catch (error) {
      toast.error("Failed to delete stage");
    }
  };
  return (
    <>
      <h2>Are you sure that you want to delete this stage?</h2>
      <form onSubmit={handleSubmit(submit)} className={classes.form}>
        <Button>Submit</Button>
      </form>
    </>
  );
};

export { ProjectDeleteStageModalContent };
