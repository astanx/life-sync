import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Modal } from "@/shared/ui/modal";
import { FC } from "react";
import { useForm } from "react-hook-form";
import { useCalendarStore } from "@/features/main/calendar_content/model";  
import classes from "./CalendarModal.module.css";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}
interface FormData {
  title: string;
}

const CalendarModal: FC<Props> = ({ isOpen, onClose }) => {
  const createCalendar = useCalendarStore((state) => state.createCalendar);
  const { register, handleSubmit, reset } = useForm<FormData>();
  const submit = (data: FormData) => {
    if (data.title) {
      createCalendar(data.title);
      onClose();
      reset();
    }
  };
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2>Enter title for calendar</h2>
      <form onSubmit={handleSubmit(submit)} className={classes.form}>
        <Input placeholder="Title" {...register("title", { required: true })} />
        <Button>Submit</Button>
      </form>
    </Modal>
  );
};

export { CalendarModal };
