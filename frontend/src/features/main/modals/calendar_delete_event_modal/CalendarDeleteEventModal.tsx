import { Button } from "@/shared/ui/button";
import { Modal } from "@/shared/ui/modal";
import { FC } from "react";
import { useForm } from "react-hook-form";
import classes from "./CalendarDeleteEventModal.module.css";
import { useEventStore } from "@/features/main/calendar/model";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  id: string;
}

const CalendarDeleteEventModal: FC<Props> = ({ isOpen, onClose, id }) => {
  const { handleSubmit } = useForm<FormData>();
  const deleteEvent = useEventStore((state) => state.deleteEvent);
  const submit = () => {
    deleteEvent(id);
    onClose();
  };
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2>Are you sure that you want to delete this event?</h2>
      <form onSubmit={handleSubmit(submit)} className={classes.form}>
        <Button>Submit</Button>
      </form>
    </Modal>
  );
};

export { CalendarDeleteEventModal };
