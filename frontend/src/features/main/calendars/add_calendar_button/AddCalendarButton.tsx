import { AddButton } from "@/shared/ui/add_button";
import { useState } from "react";
import { CalendarModal } from "@/features/main/calendars/modals/calendar/calendar_modal";

const AddCalendarButton = () => {
  const [isOpenModal, setIsOpenModal] = useState(false);

  const handleClick = () => {
    setIsOpenModal(true);
  };

  const onClose = () => {
    setIsOpenModal(false);
  };
  return (
    <div>
      <AddButton title="Add new calendar" onClick={handleClick} />
      <CalendarModal isOpen={isOpenModal} onClose={onClose} />
    </div>
  );
};

export { AddCalendarButton };
