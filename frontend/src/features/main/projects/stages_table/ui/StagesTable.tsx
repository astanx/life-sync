import { Fragment, useEffect, useRef, useState } from "react";
import classes from "./StagesTable.module.css";
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
import { useStagesStore } from "@/features/main/projects/stages_table/model";
import { ProjectCreateStageModal } from "@/features/main/projects/modals/stages/project_create_stage_modal";
import { useParams } from "react-router-dom";
import { ProjectStagesTabsModal } from "@/features/main/projects/modals/stages/project_stages_tabs_modal";
import { Stage } from "@/features/main/projects/stages_table/api";

interface MonthData {
  name: string;
  date: Date;
  weeks: Date[];
}

interface ProjectParams extends Record<string, string | undefined> {
  projectId?: string;
}

const StagesTable = () => {
  const [isOpenModalCreate, setIsOpenModalCreate] = useState(false);
  const [isOpenModalTabs, setIsOpenModalTabs] = useState(false);
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null);

  const ws = useRef<WebSocket | null>(null);
  const { projectId } = useParams<ProjectParams>();
  const { stages, getStages } = useStagesStore();

  useEffect(() => {
    if (!projectId) return;

    getStages(projectId);

    ws.current = new WebSocket(
      `wss://lifesync-backend.onrender.com/api/project/stages/${projectId}/ws`
    );

    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const { addStage, updateStageLocal, deleteStageLocal } =
          useStagesStore.getState();
        switch (data.type) {
          case "create":
            addStage({
              ...data,
              start: data.start,
              end: data.end,
            });
            break;
          case "update":
            updateStageLocal({
              ...data,
              start: data.start,
              end: data.end,
            });
            break;
          case "delete":
            deleteStageLocal(data.id);
            break;
        }
      } catch (error) {
        console.error("Error processing WebSocket message:", error);
      }
    };

    return () => {
      ws.current?.close();
    };
  }, [projectId]);

  const getAllMonths = (): MonthData[] => {
    const allMonths = new Set<string>();

    stages.forEach((stage) => {
      const start = parseISO(stage.start);
      const end = parseISO(stage.end);
      const months = eachMonthOfInterval({ start, end });
      months.forEach((month) => allMonths.add(format(month, "yyyy-MM")));
    });

    return Array.from(allMonths)
      .map((monthKey) => {
        const date = parseISO(monthKey + "-01");
        return {
          name: format(date, "MMMM yyyy"),
          date: date,
          weeks: eachWeekOfInterval(
            { start: startOfMonth(date), end: endOfMonth(date) },
            { weekStartsOn: 1 }
          ),
        };
      })
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  };

  const onCloseModalCreate = () => {
    setIsOpenModalCreate(false);
  };

  const onCloseModalTabs = () => {
    setIsOpenModalTabs(false);
    setSelectedStage(null);
  };

  const isWeekInStage = (
    weekStart: Date,
    weekEnd: Date,
    stage: Stage
  ): boolean => {
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
    for (let i = 0; i < array.length; i += size)
      result.push(array.slice(i, i + size));
    return result;
  };

  if (stages) {
    const allMonths = getAllMonths();
    const monthGroups = chunkArray(allMonths, 3);

    const isStageInGroup = (
      stage: Stage,
      groupMonths: MonthData[]
    ): boolean => {
      const stageStart = parseISO(stage.start);
      const stageEnd = parseISO(stage.end);
      return groupMonths.some((month) => {
        const monthStart = startOfMonth(month.date);
        const monthEnd = endOfMonth(month.date);
        return (
          isWithinInterval(monthStart, { start: stageStart, end: stageEnd }) ||
          isWithinInterval(monthEnd, { start: stageStart, end: stageEnd }) ||
          (isBefore(monthStart, stageStart) && isAfter(monthEnd, stageEnd))
        );
      });
    };

    const handleStageClick = (stage: Stage) => {
      setSelectedStage(stage);
      setIsOpenModalTabs(true);
    };

    return (
      <>
        {monthGroups.map((group, groupIndex) => {
          const filteredStages = stages.filter((stage) =>
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
                      <td
                        className={classes.cell}
                        onClick={() => {
                          handleStageClick(stage);
                        }}
                        style={{ cursor: "pointer" }}
                      >
                        {stage.title}
                      </td>
                      {group.map((month, monthIndex) => (
                        <Fragment key={`${stage.id}-${monthIndex}`}>
                          {month.weeks.map((week, weekIndex) => {
                            const weekStart = startOfWeek(week, {
                              weekStartsOn: 1,
                            });
                            const weekEnd = endOfWeek(week, {
                              weekStartsOn: 1,
                            });
                            return (
                              <td
                                key={`${stage.id}-${monthIndex}-${weekIndex}`}
                                className={classes.cell}
                              >
                                {isWeekInStage(weekStart, weekEnd, stage) && (
                                  <div
                                    className={classes.stageBlock}
                                    onClick={() => {
                                      handleStageClick(stage);
                                    }}
                                  />
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

        <ProjectCreateStageModal
          isOpen={isOpenModalCreate}
          onClose={onCloseModalCreate}
        />

        {selectedStage && (
          <ProjectStagesTabsModal
            isOpen={isOpenModalTabs}
            stage={selectedStage}
            onClose={onCloseModalTabs}
          />
        )}
      </>
    );
  }
};

export { StagesTable };
