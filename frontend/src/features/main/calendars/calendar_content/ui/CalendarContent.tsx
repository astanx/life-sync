import { useCalendarStore } from "@/features/main/calendars/calendar_content/model";
import classes from "./CalendarContent.module.css";
import { AddCalendarButton } from "@/features/main/calendars/add_calendar_button";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const CalendarContent = () => {
  const getCalendars = useCalendarStore((state) => state.getCalendars);
  const calendars = useCalendarStore((state) => state.calendars);
  const navigate = useNavigate();

  useEffect(() => {
    getCalendars();
  }, [getCalendars]);

  const handleClick = (id: number) => {
    navigate(`/dashboard/calendar/${id}`);
  };

  return (
    <div>
      {calendars.slice(-5).map((calendar) => (
        <p
          key={calendar.id}
          className={classes.calendar}
          onClick={() => handleClick(calendar.id)}
        >
          {calendar.title}
        </p>
      ))}
      <AddCalendarButton />
    </div>
  );
};

export { CalendarContent };
