import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import classes from "./Calendar.module.css";
import { useEventStore } from "@/features/main/calendar/model";
import { generateHexColor } from "@/shared/utils";
import { CalendarEventModal } from "@/features/main/modals/events/calendar_event_modal";
import { useParams } from "react-router-dom";
import { CalendarEventsTabsModal } from "../../modals/events/calendar_events_tabs_modal";
import { Event } from "@/features/main/calendar/api";

export interface Dates {
  start: string;
  end: string;
}
interface CalendarParams extends Record<string, string | undefined> {
  calendarId?: string;
}

const Calendar = () => {
  const [isOpenModalCreate, setIsOpenModalCreate] = useState(false);
  const [isOpenModalDelete, setIsOpenModalDelete] = useState(false);
  const [selectedDates, setSelectedDates] = useState<Dates | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const { calendarId } = useParams<CalendarParams>();

  const events = useEventStore((state) => state.events);
  const getEvents = useEventStore((state) => state.getEvents);
  const createEvent = useEventStore((state) => state.createEvent);
  const updateEvent = useEventStore((state) => state.updateEvent);

  useEffect(() => {
    if (calendarId) {
      getEvents(calendarId);
    }
  }, [getEvents, calendarId]);

  const handleDateSelect = (selectInfo: any) => {
    setSelectedDates({
      start: selectInfo.startStr,
      end: selectInfo.endStr,
    });

    setIsOpenModalCreate(true);

    const calendarApi = selectInfo.view.calendar;
    calendarApi.unselect();
  };

  const handleEventDrop = (dropInfo: any) => {
    if (calendarId) {
      const updatedEvent = {
        id: dropInfo.event._def.publicId,
        title: dropInfo.event._def.title,
        start: dropInfo.event.startStr,
        end: dropInfo.event.endStr,
      };

      updateEvent(updatedEvent, calendarId);
    }
  };

  const handleEventClick = (clickInfo: any) => {
    setIsOpenModalDelete(true);
    const cleanEvent = {
      title: clickInfo.event._def.title,
      id: clickInfo.event._def.publicId,
      start: clickInfo.event._instance.range.start,
      end: clickInfo.event._instance.range.end,
    };
    setSelectedEvent(cleanEvent);
  };

  const onCloseModalCreate = () => {
    setIsOpenModalCreate(false);
    setSelectedDates(null);
  };

  const onCloseModalDelete = () => {
    setIsOpenModalDelete(false);
    setSelectedEvent(null);
  };

  const onSubmitModal = (title: string, dates: Dates) => {
    if (selectedDates && title && calendarId) {
      const newEvent = {
        title,
        start: dates.start,
        end: dates.end,
        color: generateHexColor(),
      };
      createEvent(newEvent, calendarId);
    }
    onCloseModalCreate();
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
      {isOpenModalCreate && (
        <CalendarEventModal
          isOpen={isOpenModalCreate}
          onClose={onCloseModalCreate}
          onSubmit={onSubmitModal}
          dates={selectedDates}
        />
      )}

      {selectedEvent && (
        <CalendarEventsTabsModal
          isOpen={isOpenModalDelete}
          event={selectedEvent}
          onClose={onCloseModalDelete}
        />
      )}
    </>
  );
};

export { Calendar };
