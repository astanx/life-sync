import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Modal } from "@/shared/ui/modal";
import { FC } from "react";
import { useForm } from "react-hook-form";
import classes from "./CalendarEventModal.module.css";
import { Dates } from "@/features/main/calendars/calendar/ui/Calendar";

interface Props {
  isOpen: boolean;
  dates: Dates | null;
  onClose: () => void;
  onSubmit: (title: string, dates: Dates) => void;
}

interface FormData {
  title: string;
  start: string;
  end: string;
}

const CalendarEventModal: FC<Props> = ({
  isOpen,
  dates,
  onClose,
  onSubmit,
}) => {
  const { register, handleSubmit, reset } = useForm<FormData>({
    defaultValues: {
      title: "",
      start: dates ? new Date(dates.start).toISOString().slice(0, 16) : "",
      end: dates ? new Date(dates.end).toISOString().slice(0, 16) : "",
    },
  });

  const submit = (data: FormData) => {
    if (data.title && data.start && data.end) {
      const dates = {
        start: new Date(data.start).toISOString(),
        end: new Date(data.end).toISOString(),
      };
      onSubmit(data.title, dates);
      onClose();
      reset();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2>Create new event for calendar</h2>
      <form onSubmit={handleSubmit(submit)} className={classes.form}>
        <Input
          label="Title"
          type="text"
          placeholder="Enter event title"
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
        <Button>Submit</Button>
      </form>
    </Modal>
  );
};

export { CalendarEventModal };
