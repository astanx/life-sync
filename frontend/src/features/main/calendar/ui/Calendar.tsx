import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { EventInput } from "@fullcalendar/core";
import classes from "./Calendar.module.css";
import { useEventStore } from "@/features/main/calendar/model";
import { generateHexColor } from "@/shared/utils";
import { CalendarEventModal } from "../../calendar_event_modal copy";

interface Dates {
  start: string;
  end: string;
}

const Calendar = () => {
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [selectedDates, setSelectedDates] = useState<Dates | null>(null);

  const events = useEventStore((state) => state.events);
  const getEvents = useEventStore((state) => state.getEvents);
  const createEvent = useEventStore((state) => state.createEvent);
  const updateEvent = useEventStore((state) => state.updateEvent);
  const deleteEvent = useEventStore((state) => state.deleteEvent);

  useEffect(() => {
    getEvents();
  }, []);

  const handleDateSelect = (selectInfo: any) => {
    setSelectedDates({
      start: selectInfo.startStr,
      end: selectInfo.endStr,
    });
    setIsOpenModal(true);

    const calendarApi = selectInfo.view.calendar;
    calendarApi.unselect();
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

  const onCloseModal = () => {
    setIsOpenModal(false);
    setSelectedDates(null);
  };

  const onSubmitModal = (title: string) => {
    if (selectedDates && title) {
      const newEvent: EventInput = {
        id: String(events.length + 1),
        title,
        start: new Date(selectedDates.start),
        end: new Date(selectedDates.end),
        color: generateHexColor(),
      };
      createEvent(newEvent);
    }
    onCloseModal();
  };

  return (
    <>
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
      <CalendarEventModal
        isOpen={isOpenModal}
        onClose={onCloseModal}
        onSubmit={onSubmitModal}
      />
    </>
  );
};

export { Calendar };
