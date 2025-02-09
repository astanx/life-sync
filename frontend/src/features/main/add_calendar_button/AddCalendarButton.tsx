import { AddButton } from "@/shared/ui/add_button";
import { useCalendarStore } from "@/features/main/calendar_content/model";


const AddCalendarButton = () => {
  const createCalendar = useCalendarStore((state) => state.createCalendar);

  const handleClick = () => {
    const title = prompt("Please enter a new title for your calendar");
  
    if (title) {
      createCalendar(title);
    }
  };
  return <AddButton title="Add new calendar" onClick={handleClick} />;
};

export { AddCalendarButton };
