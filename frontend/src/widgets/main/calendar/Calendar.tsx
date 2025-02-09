import { Calendar } from "@/features/main/calendar/ui";
import classes from "./Calendar.module.css";
import { AddCalendarButton } from "@/features/main/add_calendar_button";


const CalendarWidget = () => {
  return (
    <div className={classes.calendar_container}>
      <div className={classes.calendar_title}>
        <h1>Calendar name</h1>
        <AddCalendarButton />
      </div>
      
      <div className={classes.calendar}>
        <Calendar />
      </div>
    </div>
  );
};

export { CalendarWidget };
