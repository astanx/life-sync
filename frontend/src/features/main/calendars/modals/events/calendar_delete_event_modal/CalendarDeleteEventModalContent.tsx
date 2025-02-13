import { Button } from "@/shared/ui/button";
import { FC } from "react";
import { useForm } from "react-hook-form";
import classes from "./CalendarDeleteEventModalContent.module.css";
import { useEventStore } from "@/features/main/calendars/calendar/model";
import { useParams } from "react-router-dom";

interface Props {
  onClose: () => void;
  id: string;
}

const CalendarDeleteEventModalContent: FC<Props> = ({ onClose, id }) => {
  const { handleSubmit } = useForm<FormData>();
  const { calendarId } = useParams();
  const deleteEvent = useEventStore((state) => state.deleteEvent);
  const submit = () => {
    if (calendarId) {
      deleteEvent(id, calendarId);
      onClose();
    }
  };
  return (
    <>
      <h2>Are you sure that you want to delete this event?</h2>
      <form onSubmit={handleSubmit(submit)} className={classes.form}>
        <Button>Submit</Button>
      </form>
    </>
  );
};

export { CalendarDeleteEventModalContent };
