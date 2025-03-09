import { FC } from "react";
import classes from "./ModeSwitcher.module.css";

type Switches = "calendar" | "kanban";

interface Props {
  active: Switches;
  onSwitch: (mode: Switches) => void;
}

const ModeSwitcher: FC<Props> = ({ active, onSwitch }) => {

  const handleKanbanClick = () => {
    onSwitch("kanban");
  };

  const handleCalendarClick = () => {
    onSwitch("calendar");
  };

  return (
    <div className={classes.modeSwitcher}>
      <span
        className={`${active === "kanban" ? classes.active : ""}`}
        onClick={handleKanbanClick}
      >
        Kanban Board
      </span>
      <span
        className={`${active === "calendar" ? classes.active : ""}`}
        onClick={handleCalendarClick}
      >
        Stages Calendar
      </span>
    </div>
  );
};

export { ModeSwitcher };
