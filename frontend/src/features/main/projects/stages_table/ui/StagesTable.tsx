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
  parseISO,
  isBefore,
  isAfter,
  isSameMonth,
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

interface Connection {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

const StagesTable = () => {
  const [isOpenModalCreate, setIsOpenModalCreate] = useState(false);
  const [isOpenModalTabs, setIsOpenModalTabs] = useState(false);
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null);
  const [connections, setConnections] = useState<Connection[]>([]);
  const tableRef = useRef<HTMLTableElement>(null);
  const cellsRef = useRef<Map<string, HTMLElement>>(new Map());

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
              status: data.status || 'todo',
              position: data.position || 0
            });
            break;
          case "update":
            updateStageLocal({
              ...data,
              start: data.start,
              end: data.end,
              status: data.status,   
              position: data.position
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

  useEffect(() => {
    if (stages.length > 0) {
      setTimeout(calculateConnections, 100);
    }
  }, [stages]);

  const getAllMonths = (): MonthData[] => {
    const allMonths = new Set<string>();

    stages.forEach((stage) => {
      const start = parseISO(stage.start);
      const end = parseISO(stage.end);
      const startMonth = format(start, "yyyy-MM");
      const endMonth = format(end, "yyyy-MM");
      allMonths.add(startMonth);
      allMonths.add(endMonth);
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

  const calculateConnections = () => {
    const newConnections: Connection[] = [];
    const sortedStages = [...stages].sort((a, b) => 
      parseISO(a.start).getTime() - parseISO(b.start).getTime()
    );

    for (let i = 0; i < sortedStages.length - 1; i++) {
      const currentStage = sortedStages[i];
      const nextStage = sortedStages[i + 1];
      
      const currentEnd = parseISO(currentStage.end);
      const nextStart = parseISO(nextStage.start);
      
      if (isBefore(nextStart, currentEnd)) continue;

      const currentWeek = endOfWeek(currentEnd, { weekStartsOn: 1 });
      const nextWeek = startOfWeek(nextStart, { weekStartsOn: 1 });

      const startCell = cellsRef.current.get(
        `${format(currentWeek, "yyyy-MM-dd")}_${currentStage.id}`
      );
      const endCell = cellsRef.current.get(
        `${format(nextWeek, "yyyy-MM-dd")}_${nextStage.id}`
      );

      if (startCell && endCell) {
        const startRect = startCell.getBoundingClientRect();
        const endRect = endCell.getBoundingClientRect();
        const tableRect = tableRef.current?.getBoundingClientRect();

        if (tableRect) {
          newConnections.push({
            startX: startRect.right - tableRect.left - 4,
            startY: startRect.top - tableRect.top + startRect.height / 2,
            endX: endRect.left - tableRect.left + 4,
            endY: endRect.top - tableRect.top + endRect.height / 2,
          });
        }
      }
    }

    setConnections(newConnections);
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

  const handleStageClick = (stage: Stage) => {
    setSelectedStage(stage);
    setIsOpenModalTabs(true);
  };

  const onCloseModalCreate = () => {
    setIsOpenModalCreate(false);
  };
  
  const onCloseModalTabs = () => {
    setIsOpenModalTabs(false);
    setSelectedStage(null);
  };

  if (stages && stages.length > 0) {
    const allMonths = getAllMonths();
    const monthGroups = chunkArray(allMonths, 3);

    return (
      <>
        {monthGroups.map((group, groupIndex) => {
          const filteredStages = stages.filter(stage => 
            group.some(month => 
              isSameMonth(parseISO(stage.start), month.date) ||
              isSameMonth(parseISO(stage.end), month.date)
            )
          );

          return (
            <div key={groupIndex} className={classes.tableWrapper}>
              <table className={classes.table} ref={tableRef}>
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
                        onClick={() => handleStageClick(stage)}
                        style={{ cursor: "pointer" }}
                      >
                        {stage.title}
                      </td>
                      {group.map((month) =>
                        month.weeks.map((week) => {
                          const weekStart = startOfWeek(week, { weekStartsOn: 1 });
                          const weekEnd = endOfWeek(week, { weekStartsOn: 1 });
                          const isInStage = isWeekInStage(weekStart, weekEnd, stage);
                          const weekKey = format(week, "yyyy-MM-dd");

                          return (
                            <td
                              key={`${stage.id}-${weekKey}`}
                              className={classes.cell}
                              ref={(el) => {
                                if (el && isInStage) {
                                  cellsRef.current.set(
                                    `${weekKey}_${stage.id}`,
                                    el
                                  );
                                }
                              }}
                            >
                              {isInStage && (
                                <div
                                  className={classes.stageBlock}
                                  onClick={() => handleStageClick(stage)}
                                />
                              )}
                            </td>
                          );
                        })
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
              <svg className={classes.connectionsOverlay}>
                {connections.map((conn, index) => (
                  <path
                    key={index}
                    d={`M ${conn.startX} ${conn.startY} C ${conn.startX + 50} ${conn.startY}, ${conn.endX - 50} ${conn.endY}, ${conn.endX} ${conn.endY}`}
                    stroke="#4CAF50"
                    strokeWidth="2"
                    fill="none"
                    strokeDasharray="4 2"
                  />
                ))}
              </svg>
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
