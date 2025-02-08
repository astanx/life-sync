import { Calendar } from "@/features/main/calendar";
import classes from "./Calendar.module.css";

const CalendarWidget = () => {
  return (
    <div className={classes.calendar_container}>
      <h1>Calendar name</h1>
      <div className={classes.calendar}>
        <Calendar />
      </div>
    </div>
  );
};

export { CalendarWidget };
