import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Modal } from "@/shared/ui/modal";
import { FC } from "react";
import { useForm } from "react-hook-form";
import { useProjectsStore } from "@/features/main/projects/projects_content/model";
import classes from "./AddCollaboratorModal.module.css";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}
interface FormData {
  collaboratorId: number;
}

const AddCollaboratorModal: FC<Props> = ({ isOpen, onClose }) => {
  const addCollaborator = useProjectsStore((state) => state.addCollaborator);
  const { register, handleSubmit, reset } = useForm<FormData>();
  const { projectId } = useParams();

  const submit = async (data: FormData) => {
    try {
      if (projectId) {
        addCollaborator(projectId, +data.collaboratorId);
        toast.success("Collaborator invited successfully!");
        onClose();
        reset();
      }
    } catch (error) {
      toast.error("Failed to invite collaborator");
    }
  };
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2>Invite collaborator to project</h2>
      <form onSubmit={handleSubmit(submit)} className={classes.form}>
        <Input
          type="number"
          placeholder="Collaborator ID"
          {...register("collaboratorId", { required: true })}
        />
        <Button>Add collaborator</Button>
      </form>
    </Modal>
  );
};

export { AddCollaboratorModal };
