import { Button } from "@/shared/ui/button";
import { FC } from "react";
import { useForm } from "react-hook-form";
import classes from "./CalendarDeleteModalContent.module.css";
import { useNavigate, useParams } from "react-router-dom";
import { useCalendarStore } from "@/features/main/calendars/calendar_content/model";

interface Props {
  onClose: () => void;
}

const CalendarDeleteModalContent: FC<Props> = ({ onClose }) => {
  const { handleSubmit } = useForm<FormData>();
  const { calendarId } = useParams();
  const deleteCalendar = useCalendarStore((state) => state.deleteCalendar);
  const navigate = useNavigate();

  const submit = () => {
    if (calendarId) {
      deleteCalendar(calendarId);
      onClose();
      navigate("/dashboard/calendar");
    }
  };
  return (
    <>
      <h2>Are you sure that you want to delete this calendar?</h2>
      <form onSubmit={handleSubmit(submit)} className={classes.form}>
        <Button>Submit</Button>
      </form>
    </>
  );
};

export { CalendarDeleteModalContent };
