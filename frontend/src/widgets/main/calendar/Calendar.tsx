import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useState } from "react";
import classes from './Calendar.module.css'

const Calendar = () => {
  const [events, setEvents] = useState([
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
            eventClassNames={() => classes.custom_event} // кастомные классы для событий
          dayCellClassNames={() => classes.custom_day_cell}
        />
      </div>
      
    </div>
  );
};

export { Calendar };