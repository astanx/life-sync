import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { EventInput } from "@fullcalendar/core";
import classes from "./Calendar.module.css";
import { useEventStore } from "@/features/main/calendar/model";
import { generateHexColor } from "@/shared/utils";
import { CalendarEventModal } from "@/features/main/modals/calendar_event_modal";
import { CalendarDeleteEventModal } from "../../modals/calendar_delete_event_modal";

interface Dates {
  start: string;
  end: string;
}

const Calendar = () => {
  const [isOpenModalCreate, setIsOpenModalCreate] = useState(false);
  const [isOpenModalDelete, setIsOpenModalDelete] = useState(false);
  const [selectedDates, setSelectedDates] = useState<Dates | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string>("");

  const events = useEventStore((state) => state.events);
  const getEvents = useEventStore((state) => state.getEvents);
  const createEvent = useEventStore((state) => state.createEvent);
  const updateEvent = useEventStore((state) => state.updateEvent);

  useEffect(() => {
    getEvents();
  }, []);

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
    const updatedEvent = {
      ...dropInfo.event,
      start: dropInfo.event.startStr,
      end: dropInfo.event.endStr,
    };

    updateEvent(updatedEvent);
  };

  const handleEventClick = (clickInfo: any) => {
    setIsOpenModalDelete(true);
    setSelectedEventId(clickInfo.event.id);
  };

  const onCloseModalCreate = () => {
    setIsOpenModalCreate(false);
    setSelectedDates(null);
  };

  const onCloseModalDelete = () => {
    setIsOpenModalDelete(false);
    setSelectedEventId("");
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
      <CalendarEventModal
        isOpen={isOpenModalCreate}
        onClose={onCloseModalCreate}
        onSubmit={onSubmitModal}
      />

      <CalendarDeleteEventModal
        isOpen={isOpenModalDelete}
        id={selectedEventId}
        onClose={onCloseModalDelete}
      />
    </>
  );
};

export { Calendar };
