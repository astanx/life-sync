import { FC } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { useParams } from "react-router-dom";
import classes from "./ProjectEditStageModalContent.module.css";
import { Stage } from "@/features/main/projects/stages_table/api";
import { useStagesStore } from "@/features/main/projects/stages_table/model";
import { toast } from "react-toastify";

interface Props {
  onClose: () => void;
  stage: Stage;
}

interface FormData {
  title: string;
  start: string;
  end: string;
}

const ProjectEditStageModalContent: FC<Props> = ({ onClose, stage }) => {
  const { register, handleSubmit } = useForm<FormData>({
    defaultValues: {
      title: stage.title,
      start: stage.start.slice(0, 16),
      end: stage.end.slice(0, 16),
    },
  });

  const { projectId } = useParams();
  const updateStage = useStagesStore((state) => state.updateStage);

  const submit = (data: FormData) => {
    try {
      if (projectId) {
        const payload = {
          id: stage.id,
          title: data.title,
          start: `${data.start}:00Z`,
          end: `${data.end}:00Z`,
        };
        updateStage(payload, projectId);
        toast.success("Stage updated successfully!");
        onClose();
      }
    } catch (error) {
      toast.error("Failed to update stage");
    }
  };

  return (
    <>
      <h2>Edit Stage</h2>
      <form onSubmit={handleSubmit(submit)} className={classes.form}>
        <Input
          label="Title"
          type="text"
          placeholder="Enter stage title"
          {...register("title", { required: true })}
        />
        <Input
          label="Start Date"
          type="datetime-local"
          {...register("start", { required: true })}
        />
        <Input
          label="End Date"
          type="datetime-local"
          {...register("end", { required: true })}
        />

        <Button>Save</Button>
      </form>
    </>
  );
};

export { ProjectEditStageModalContent };
