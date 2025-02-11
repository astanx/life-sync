import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Modal } from "@/shared/ui/modal";
import { FC } from "react";
import { useForm } from "react-hook-form";
import classes from "./CalendarEventModal.module.css";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string) => void;
}
interface FormData {
  title: string;
}

const CalendarEventModal: FC<Props> = ({ isOpen, onClose, onSubmit }) => {
  const { register, handleSubmit, reset } = useForm<FormData>();
  const submit = (data: FormData) => {
    if (data.title) {
      onSubmit(data.title);
      onClose();
      reset();
    }
  };
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2>Enter title for calendar event</h2>
      <form onSubmit={handleSubmit(submit)} className={classes.form}>
        <Input placeholder="Title" {...register("title", { required: true })} />
        <Button>Submit</Button>
      </form>
    </Modal>
  );
};

export { CalendarEventModal };
