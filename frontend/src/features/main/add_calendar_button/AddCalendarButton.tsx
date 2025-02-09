import { AddButton } from "@/shared/ui/add_button";
import { useCalendarStore } from "../model";

const AddCalendarButton = () => {
    const createCalendar = useCalendarStore((state) => state.createCalendar)
  return <AddButton title="Add new calendar" onClick={createCalendar}/>;
};

export {AddCalendarButton};
