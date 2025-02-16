import { Button } from "@/shared/ui/button";
import { FC } from "react";
import { useForm } from "react-hook-form";
import classes from "./CalendarEditModalContent.module.css";
import { useParams } from "react-router-dom";
import { useCalendarStore } from "@/features/main/calendars/calendar_content/model";
import { Input } from "@/shared/ui/input";
import { toast } from "react-toastify";

interface Props {
  onClose: () => void;
}

interface FormData {
  title: string
}

const CalendarEditModalContent: FC<Props> = ({ onClose }) => {
  const getCalendarTitle = useCalendarStore((state) => state.getCalendarTitle);
  const updateCalendar = useCalendarStore((state) => state.updateCalendar);
  const { calendarId } = useParams();
  const { register, handleSubmit, reset } = useForm<FormData>({
    defaultValues: {
      title: getCalendarTitle(calendarId || "1"),
    },
  });

  const submit = async (data: FormData) => {
    try {
      if (calendarId) {
        await updateCalendar(data.title, calendarId);
        toast.success("Calendar updated successfully!");
        onClose();
        reset();
      }
    } catch (error) {
      toast.error("Failed to update calendar");
    }
  };
  return (
    <>
      <h2>Enter title for calendar</h2>
      <form onSubmit={handleSubmit(submit)} className={classes.form}>
        <Input placeholder="Title" {...register("title", { required: true })} />
        <Button>Edit</Button>
      </form>
    </>
  );
};

export { CalendarEditModalContent };
