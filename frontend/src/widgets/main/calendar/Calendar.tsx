import { Calendar } from "@/features/main/calendar/ui";
import classes from "./Calendar.module.css";
import { AddCalendarButton } from "@/features/main/add_calendar_button";
import { useParams } from "react-router-dom";
import { useCalendarStore } from "@/features/main/calendar_content/model";

const CalendarWidget = () => {
  const { calendarId } = useParams();
  const getCalendarTitle = useCalendarStore((state) => state.getCalendarTitle);
  
  return (
    calendarId && (
      <div className={classes.calendar_container}>
        <div className={classes.calendar_title}>
          <h1>{getCalendarTitle(calendarId)}</h1>
          <AddCalendarButton />
        </div>

        <div className={classes.calendar}>
          <Calendar />
        </div>
      </div>
    )
  );
};

export { CalendarWidget };
