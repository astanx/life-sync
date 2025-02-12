import { TabsModal } from "@/shared/ui/tabs_modal";
import { CalendarEditModalContent } from "@/features/main/modals/calendar/calendar_edit_modal";
import { FC } from "react";
import { CalendarDeleteModalContent } from "@/features/main/modals/calendar/calendar_delete_modal";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const CalendarTabsModal: FC<Props> = ({ isOpen, onClose }) => {
  return (
    <TabsModal
      onClose={onClose}
      isOpen={isOpen}
      editContent={<CalendarEditModalContent onClose={onClose} />}
      deleteContent={<CalendarDeleteModalContent onClose={onClose} />}
    />
  );
};

export { CalendarTabsModal };
