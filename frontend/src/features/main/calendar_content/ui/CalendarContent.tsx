import { useCalendarStore } from "@/features/main/calendar_content/model";
import classes from "./CalendarContent.module.css";
import { AddCalendarButton } from "@/features/main/add_calendar_button";
import { useEffect } from "react";

const CalendarContent = () => {
  const getCalendars = useCalendarStore((state) => state.getCalendars);
  const calendars = useCalendarStore((state) => state.calendars);
  
  useEffect(() => {
    getCalendars();
  }, []);

  return (
    <div>
      {calendars.slice(-5).map((calendar) => (
        <p key={calendar.id}>{calendar.title}</p>
      ))}
      <AddCalendarButton />
    </div>
  );
};

export { CalendarContent };
