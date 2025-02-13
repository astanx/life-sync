import { TabsModal } from "@/shared/ui/tabs_modal";
import { CalendarEditEventModalContent } from "../calendar_edit_event_modal";
import { CalendarDeleteEventModalContent } from "../calendar_delete_event_modal";
import { FC } from "react";
import { Event } from "@/features/main/calendars/calendar/api";

interface Props {
  isOpen: boolean;
  event: Event;
  onClose: () => void;
}

const CalendarEventsTabsModal: FC<Props> = ({ isOpen, onClose, event }) => {
  return (
    <TabsModal
    isOpen={isOpen}
    onClose={onClose}
      editContent={<CalendarEditEventModalContent onClose={onClose} event={event}/>}
      deleteContent={<CalendarDeleteEventModalContent onClose={onClose} id={String(event.id)}/>}
    />
  );
};

export { CalendarEventsTabsModal };
