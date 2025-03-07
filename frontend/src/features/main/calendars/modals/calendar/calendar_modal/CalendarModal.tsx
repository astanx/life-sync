import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Modal } from "@/shared/ui/modal";
import { FC } from "react";
import { useForm } from "react-hook-form";
import { useCalendarStore } from "@/features/main/calendars/calendar_content/model";
import classes from "./CalendarModal.module.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

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
  const navigate = useNavigate();
  const submit = async (data: FormData) => {
    try {
      if (data.title) {
        const calendarId = await createCalendar(data.title);
        toast.success("Calendar created successfully!");
        onClose();
        reset();
        navigate(`calendar/${calendarId}`);
      }
    } catch (error) {
      toast.error("Failed to create calendar");
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
