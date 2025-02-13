import { Fragment } from "react";
import classes from "./EventsTable.module.css";

const EventsTable = () => {
  const months = ["Январь", "Февраль", "Март"];
  const stages = ["Стадия 1", "Стадия 2", "Стадия 3"];

  return (
    <table className={classes.table}>
      <thead>
        <tr>
          <th className={classes.header}></th>
          {months.map((month, index) => (
            <th key={index} colSpan={4} className={classes.header}>
              {month}
            </th>
          ))}
        </tr>
        <tr>
          <th className={classes.stages}>Stages</th>
          {months.map((_, index) => (
            <Fragment key={index}>
              <th className={classes.subtitle}>1W</th>
              <th className={classes.subtitle}>2W</th>
              <th className={classes.subtitle}>3W</th>
              <th className={classes.subtitle}>4W</th>
            </Fragment>
          ))}
        </tr>
      </thead>
      <tbody>
        {stages.map((stage, index) => (
          <tr key={index}>
            <td className={classes.cell}>{stage}</td>
            {months.map((_, monthIndex) => (
              <Fragment key={monthIndex}>
                <td className={classes.cell}></td>
                <td className={classes.cell}></td>
                <td className={classes.cell}></td>
                <td className={classes.cell}></td>
              </Fragment>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export { EventsTable };
