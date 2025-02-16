import { Calendar } from "@/features/main/calendars/calendar/ui";
import classes from "./Calendar.module.css";
import { AddCalendarButton } from "@/features/main/calendars/add_calendar_button";
import { useParams } from "react-router-dom";
import { useCalendarStore } from "@/features/main/calendars/calendar_content/model";
import { useEffect, useState } from "react";
import { CalendarTabsModal } from "@/features/main/calendars/modals/calendar/calendar_tabs_modal";

const CalendarWidget = () => {
  const { calendarId } = useParams();
  const getCalendarTitle = useCalendarStore((state) => state.getCalendarTitle);

  const [isOpenModal, setIsOpenModal] = useState(false);
  const [calendarTitle, setCalendarTitle] = useState("");

  useEffect(() => {
    if (calendarId){
      setCalendarTitle(getCalendarTitle(calendarId));
    }
  }, [calendarId, getCalendarTitle, isOpenModal]);

  const onModalClose = () => {
    setIsOpenModal(false);
  }

  const handleClick = () => {
    setIsOpenModal(true);
  }

  return (
    calendarId && (
      <>
        <div className={classes.calendar_container}>
          <div className={classes.calendar_title}>
            <h1 onClick={handleClick}>{calendarTitle}</h1>
            <AddCalendarButton />
          </div>

          <div className={classes.calendar}>
            <Calendar />
          </div>
        </div>
        <CalendarTabsModal isOpen={isOpenModal} onClose={onModalClose}/>
      </>
    )
  );
};

export { CalendarWidget };
