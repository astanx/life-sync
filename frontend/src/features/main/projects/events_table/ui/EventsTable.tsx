import { Fragment } from "react";
import classes from "./EventsTable.module.css";
import {
  format,
  eachWeekOfInterval,
  startOfMonth,
  endOfMonth,
  getWeek,
  isWithinInterval,
  startOfWeek,
  endOfWeek,
  eachMonthOfInterval,
  parseISO,
  isBefore,
  isAfter,
} from "date-fns";

interface Stage {
  id: number;
  title: string;
  start: string;
  end: string;
}

interface MonthData {
  name: string;
  date: Date;
  weeks: Date[];
}

const EventsTable = () => {
  const stages: Stage[] = [
    { id: 1, title: "Stage 1", start: "2024-11-10", end: "2024-12-10" },
    { id: 2, title: "Stage 2", start: "2024-11-19", end: "2025-12-18" },
    { id: 3, title: "Stage 3", start: "2025-01-19", end: "2025-11-18" },
    { id: 4, title: "Stage 4", start: "2024-01-19", end: "2025-10-18" },
  ];

  const getAllMonths = (): MonthData[] => {
    const allMonths = new Set<string>();

    stages.forEach((stage) => {
      const start = parseISO(stage.start);
      const end = parseISO(stage.end);
      
      const months = eachMonthOfInterval({ start, end });
      months.forEach(month => {
        const monthKey = format(month, "yyyy-MM");
        allMonths.add(monthKey);
      });
    });

    return Array.from(allMonths)
      .map(monthKey => {
        const date = parseISO(monthKey + "-01");
        return {
          name: format(date, "MMMM yyyy"),
          date: date,
          weeks: eachWeekOfInterval(
            { start: startOfMonth(date), end: endOfMonth(date) },
            { weekStartsOn: 1 }
          )
        };
      })
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  };

  const isWeekInStage = (weekStart: Date, weekEnd: Date, stage: Stage): boolean => {
    const stageStart = parseISO(stage.start);
    const stageEnd = parseISO(stage.end);

    return (
      isWithinInterval(weekStart, { start: stageStart, end: stageEnd }) ||
      isWithinInterval(weekEnd, { start: stageStart, end: stageEnd }) ||
      (isBefore(weekStart, stageStart) && isAfter(weekEnd, stageEnd))
    );
  };

  const chunkArray = <T,>(array: T[], size: number): T[][] => {
    const result = [];
    for (let i = 0; i < array.length; i += size) {
      result.push(array.slice(i, i + size));
    }
    return result;
  };

  const allMonths = getAllMonths();
  const monthGroups = chunkArray(allMonths, 3);

  const isStageInGroup = (stage: Stage, groupMonths: MonthData[]): boolean => {
    const stageStart = parseISO(stage.start);
    const stageEnd = parseISO(stage.end);
    
    return groupMonths.some(month => {
      const monthStart = startOfMonth(month.date);
      const monthEnd = endOfMonth(month.date);
      return isWithinInterval(monthStart, { start: stageStart, end: stageEnd }) ||
             isWithinInterval(monthEnd, { start: stageStart, end: stageEnd }) ||
             (isBefore(monthStart, stageStart) && isAfter(monthEnd, stageEnd));
    });
  };

  return (
    <div>
      {monthGroups.map((group, groupIndex) => {
        const filteredStages = stages.filter(stage => 
          isStageInGroup(stage, group)
        );

        return (
          <div key={groupIndex} className={classes.tableWrapper}>
            <table className={classes.table}>
              <thead>
                <tr>
                  <th className={classes.header}></th>
                  {group.map((month, index) => (
                    <th
                      key={index}
                      colSpan={month.weeks.length}
                      className={classes.header}
                    >
                      {month.name}
                    </th>
                  ))}
                </tr>
                <tr>
                  <th className={classes.stages}>Stages</th>
                  {group.map((month, index) => (
                    <Fragment key={index}>
                      {month.weeks.map((week, weekIndex) => (
                        <th
                          key={`${index}-${weekIndex}`}
                          className={classes.subtitle}
                        >
                          {getWeek(week, { weekStartsOn: 1 })}W
                        </th>
                      ))}
                    </Fragment>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredStages.map((stage) => (
                  <tr key={stage.id}>
                    <td className={classes.cell}>{stage.title}</td>
                    {group.map((month, monthIndex) => (
                      <Fragment key={`${stage.id}-${monthIndex}`}>
                        {month.weeks.map((week, weekIndex) => {
                          const weekStart = startOfWeek(week, { weekStartsOn: 1 });
                          const weekEnd = endOfWeek(week, { weekStartsOn: 1 });

                          return (
                            <td
                              key={`${stage.id}-${monthIndex}-${weekIndex}`}
                              className={classes.cell}
                            >
                              {isWeekInStage(weekStart, weekEnd, stage) && (
                                <div className={classes.stageBlock}></div>
                              )}
                            </td>
                          );
                        })}
                      </Fragment>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
};

export { EventsTable };