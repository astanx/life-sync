import {
  DndContext,
  DragOverlay,
  closestCorners,
  useDroppable,
  DragEndEvent,
  DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useStagesStore } from "@/features/main/projects/stages_table/model";
import classes from "./KanbanBoard.module.css";
import { parseISO, format } from "date-fns";
import { FC, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

type Status = {
  id: 'todo' | 'in_progress' | 'done';
  title: string;
};

type Stage = {
  id: number;
  title: string;
  start: string;
  end: string;
  status: Status['id'];
  position: number;
};

type SortableItemProps = {
  stage: Stage;
  disabled?: boolean;
};

type ColumnProps = {
  id: Status['id'];
  items: Stage[];
  title: string;
  disabled?: boolean;
};

const STATUSES: Status[] = [
  { id: "todo", title: "To Do" },
  { id: "in_progress", title: "In Progress" },
  { id: "done", title: "Done" },
];

const SortableItem: FC<SortableItemProps> = ({ stage, disabled }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id: stage.id,
    disabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition ?? undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={classes.card}
    >
      <div className={classes.cardContent}>
        <h4>{stage.title}</h4>
        <div className={classes.dates}>
          {format(parseISO(stage.start), "dd.MM.yy")} - 
          {format(parseISO(stage.end), "dd.MM.yy")}
        </div>
      </div>
    </div>
  );
};

const Column: FC<ColumnProps> = ({ id, items, title, disabled }) => {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div className={classes.column}>
      <h3>{title}</h3>
      <div ref={setNodeRef} className={classes.tasksContainer}>
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          {items.map((stage) => (
            <SortableItem
              key={stage.id}
              stage={stage}
              disabled={disabled}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
};

const KanbanBoard = () => {
  const { stages, updateStageLocal, getStages, updateStagePosition } =
    useStagesStore();
  const { projectId } = useParams<{ projectId: string }>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeId, setActiveId] = useState<number | null>(null);

  useEffect(() => {
    if (projectId) {
      setIsLoading(true);
      getStages(projectId)
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [projectId, getStages]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const sourceStage = stages.find((s) => s.id === active.id);
    const destinationStatus = (
      over.data.current?.sortable?.containerId || over.id
    ) as Status['id'];
    if (!sourceStage) return;
    const updatedStage = {
      ...sourceStage,
      status: destinationStatus,
      position: stages.filter((s) => s.status === destinationStatus).length,
    };
    try {
      if (projectId) {  
        updateStageLocal(updatedStage);
        await updateStagePosition(updatedStage, projectId);
      }
    } catch (error) {
      console.error("Update failed:", error);
      updateStageLocal(updatedStage);
    }
  };

  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveId(active.id as number);
  };

  if (isLoading) return <div className={classes.loading}>Loading...</div>;

  return (
    <DndContext
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <div className={classes.kanbanBoard}>
        {STATUSES.map((status) => (
          <Column
            key={status.id}
            id={status.id}
            title={status.title}
            items={stages.filter((s) => s.status === status.id)}
            disabled={isLoading}
          />
        ))}
      </div>

      <DragOverlay>
        {activeId ? (
          <div className={classes.card}>
            <div className={classes.cardContent}>
              <h4>{stages.find((s) => s.id === activeId)?.title}</h4>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export { KanbanBoard };