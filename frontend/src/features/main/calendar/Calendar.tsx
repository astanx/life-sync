import { useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { EventInput } from "@fullcalendar/core";
import classes from "./Calendar.module.css";
import { useCalendarStore } from "@/features/main/model";
import { generateHexColor } from "@/shared/utils";

const Calendar = () => {
  const events = useCalendarStore((state) => state.events);
  const getEvents = useCalendarStore((state) => state.getEvents);
  const createEvent = useCalendarStore((state) => state.createEvent);
  const updateEvent = useCalendarStore((state) => state.updateEvent);
  const deleteEvent = useCalendarStore((state) => state.deleteEvent)

  useEffect(() => {
    getEvents();
  }, []);

  const handleDateSelect = (selectInfo: any) => {
    const title = prompt("Please enter a new title for your event");
    const calendarApi = selectInfo.view.calendar;

    calendarApi.unselect();
    if (title && events) {
      const newEvent: EventInput = {
        id: String(events.length + 1),
        title,
        start: new Date(selectInfo.startStr),
        end: new Date(selectInfo.endStr),
        color: generateHexColor(),
      };
      createEvent(newEvent);
    }
  };

  const handleEventDrop = (dropInfo: any) => {
    const updatedEvent = {
      ...dropInfo.event,
      start: dropInfo.event.startStr,
      end: dropInfo.event.endStr,
    };

    updateEvent(updatedEvent);
  };
  const handleEventClick = (clickInfo: any) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      deleteEvent(clickInfo.event.id);
    }
  };

  return (
    <FullCalendar
      plugins={[dayGridPlugin, interactionPlugin]}
      initialView="dayGridMonth"
      events={events}
      editable={true}
      selectable={true}
      height="auto"
      eventClassNames={() => classes.custom_event}
      dayCellClassNames={() => classes.custom_day_cell}
      select={handleDateSelect}
      eventDrop={handleEventDrop}
      eventClick={handleEventClick}
    />
  );
};

export { Calendar };
