import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import classes from "./KanbanBoard.module.css";
import { useState } from "react";
import { useParams } from "react-router-dom";

import { useTasksStore } from "@/features/main/projects/kanban_board/model";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";

import { tasksAPI } from "@/features/main/projects/kanban_board/api";
import { useStagesLoader, useTasksLoader } from "@/shared/hooks";
import { Column } from "@/entities/main/project/kanban_board/column/Column";

const KanbanBoard = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { stages } = useStagesLoader();
  const { tasks } = useTasksLoader();
  const { moveTask } = useTasksStore();
  const [activeId, setActiveId] = useState<number | null>(null);
  const [targetState, setTargetState] = useState<{
    stageId: number;
    position: number;
  } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    if (!over) return;

    const isOverTask = over.data.current?.type === "task";
    const overId = over.id.toString();

    let newStageId: number;
    let newPosition: number;

    if (isOverTask) {
      const overTask = tasks.find((t) => t.id.toString() === overId);
      if (!overTask) return;
      newStageId = overTask.stageId;
      newPosition = overTask.position;
    } else {
      const stage = stages.find((s) => s.id.toString() === overId);
      if (!stage) return;
      newStageId = stage.id;
      newPosition = tasks.filter((t) => t.stageId === newStageId).length;
    }

    setTargetState({ stageId: newStageId, position: newPosition });
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active } = event;
    if (!targetState) return;

    const taskId = parseInt(active.id.toString());
    const currentTask = tasks.find((t) => t.id === taskId);
    if (!currentTask) return;

    try {
      moveTask(
        taskId,
        targetState.stageId,
        targetState.position,
        currentTask.stageId,
        currentTask.position
      );

      if (projectId) {
        await tasksAPI.updateTaskPosition(
          {
            id: taskId,
            stage_id: targetState.stageId,
            position: targetState.position,
          },
          projectId
        );
      }
    } catch (error) {
      console.error("Task move failed:", error);

      moveTask(
        taskId,
        currentTask.stageId,
        currentTask.position,
        targetState.stageId,
        targetState.position
      );
    } finally {
      setTargetState(null);
    }
  };

  if (!stages.length || !tasks.length) {
    return <div className={classes.loading}>Loading board...</div>;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={({ active }) => setActiveId(parseInt(active.id.toString()))}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className={classes.kanbanBoard}>
        {stages.map((stage) => (
          <Column
            key={stage.id}
            id={stage.id.toString()}
            title={stage.title}
            tasks={tasks
              .filter((task) => task.stageId === stage.id)
              .sort((a, b) => a.position - b.position)}
          />
        ))}
      </div>

      <DragOverlay>
        {activeId && (
          <div className={classes.card}>
            {tasks.find((task) => task.id === activeId)?.title}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
};

export { KanbanBoard };
