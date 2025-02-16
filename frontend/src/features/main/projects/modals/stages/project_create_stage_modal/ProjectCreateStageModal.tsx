import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Modal } from "@/shared/ui/modal";
import { FC } from "react";
import { useForm } from "react-hook-form";
import classes from "./ProjectCreateStageModal.module.css";
import { useStagesStore } from "../../../stages_table/model";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  title: string;
  start: string;
  end: string;
}

const ProjectCreateStageModal: FC<Props> = ({ isOpen, onClose }) => {
  const { register, handleSubmit, reset } = useForm<FormData>();
  const createStage = useStagesStore((state) => state.createStage);
  const { projectId } = useParams();

  const submit = (data: FormData) => {
    try {
      if (projectId) {
        const stage = {
          title: data.title,
          start: data.start,
          end: data.end,
          id: 1,
        };
        createStage(stage, projectId);
        toast.success("Stage created successfully!");
        onClose();
        reset();
      }
    } catch (error) {
      toast.error("Failed to create stage");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2>Create new stage for project</h2>
      <form onSubmit={handleSubmit(submit)} className={classes.form}>
        <Input
          label="Title"
          type="text"
          placeholder="Enter stage title"
          {...register("title", { required: true })}
        />
        <Input
          label="Start Date"
          type="date"
          {...register("start", { required: true })}
        />
        <Input
          label="End Date"
          type="date"
          {...register("end", { required: true })}
        />
        <Button>Submit</Button>
      </form>
    </Modal>
  );
};

export { ProjectCreateStageModal };
