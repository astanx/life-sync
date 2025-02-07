import React, { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { EventInput } from "@fullcalendar/core";
import classes from "./Calendar.module.css";

const Calendar: React.FC = () => {
  const [events, setEvents] = useState<EventInput[]>([
    {
      id: "1",
      title: "Develop Chat Application",
      start: "2025-02-01",
      end: "2025-02-23",
      color: "#fbc02d",
    },
    {
      id: "2",
      title: "Effective Advertising",
      start: "2025-02-23",
      end: "2025-03-12",
      color: "#66bb6a",
    },
    {
      id: "3",
      title: "Development and Testing",
      start: "2025-02-23",
      end: "2025-03-12",
      color: "#9575cd",
    },
    {
      id: "4",
      title: "Customer Approval",
      start: "2025-02-23",
      end: "2025-03-12",
      color: "#26c6da",
    },
    {
      id: "5",
      title: "Launch of the Project",
      start: "2025-02-23",
      end: "2025-03-12",
      color: "#ff7043",
    },
  ]);

  const handleDateSelect = (selectInfo: any) => {
    const title = prompt("Please enter a new title for your event");
    const calendarApi = selectInfo.view.calendar;

    calendarApi.unselect();
    if (title) {
      const newEvent: EventInput = {
        id: String(events.length + 1),
        title,
        start: selectInfo.startStr,
        end: selectInfo.endStr,
        color: "#" + Math.floor(Math.random() * 16777215).toString(16), 
      };

      setEvents([...events, newEvent]);
    }
  };

  const handleEventDrop = (dropInfo: any) => {
    const updatedEvents = events.map((event) => {
      if (event.id === dropInfo.event.id) {
        return {
          ...event,
          start: dropInfo.event.startStr,
          end: dropInfo.event.endStr,
        };
      }
      return event;
    });

    setEvents(updatedEvents);
  };

  return (
    <div className={classes.calendar_container}>
      <h1>Calendar name</h1>
      <div className={classes.calendar}>
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
        />
      </div>
    </div>
  );
};

export { Calendar };