import { FC, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { useEventStore } from "@/features/main/calendar/model";
import { useParams } from "react-router-dom";
import classes from "./CalendarEditEventModalContent.module.css";
import { Event } from "@/features/main/calendar/api";

interface Props {
  onClose: () => void;
  event: Event;
}

interface FormData {
  title: string;
  start: string;
  end: string;
}

const CalendarEditEventModalContent: FC<Props> = ({ onClose, event }) => {
  const { register, handleSubmit, reset } = useForm<FormData>({
    mode: "onChange",
    defaultValues: {
      title: event.title,
      start: event.start ? new Date(event.start as string | number | Date).toISOString().slice(0, 16) : "",
      end: event.end ? new Date(event.end as string | number | Date).toISOString().slice(0, 16) : "",
    },
  });

  const { calendarId } = useParams();
  const updateEvent = useEventStore((state) => state.updateEvent);

  useEffect(() => {
    reset({
      title: event.title,
      start: event.start ? new Date(event.start as string | number | Date).toISOString().slice(0, 16) : "",
      end: event.end ? new Date(event.end as string | number | Date).toISOString().slice(0, 16) : "",
    });
  }, [event, reset]);

  const submit = (data: FormData) => {
    if (calendarId) {
      updateEvent(
        {
          id: event.id,
          title: data.title,
          start: new Date(data.start),
          end: new Date(data.end),
        },
        calendarId
      );
      onClose();
    }
  };

  return (
    <>
      <h2>Edit Event</h2>
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

        <Button>Save</Button>
      </form>
    </>
  );
};

export { CalendarEditEventModalContent };