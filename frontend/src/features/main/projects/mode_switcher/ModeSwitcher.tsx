import { useState } from "react";
import classes from "./ModeSwitcher.module.css";

type Switches = "calendar" | "stages";

const ModeSwitcher = () => {
  const [active, setActive] = useState<Switches>("calendar");

  const handleStagesClick = () => {
    setActive("stages");
  };

  const handleCalendarClick = () => {
    setActive("calendar");
  };

  return (
    <div className={classes.modeSwitcher}>
      <span
        className={`${active === "stages" ? classes.active : ""}`}
        onClick={handleStagesClick}
      >
        List of Stages
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
