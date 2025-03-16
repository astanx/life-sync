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
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTasksStore } from "@/features/main/projects/kanban_board/model";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { Task, tasksAPI } from "@/features/main/projects/kanban_board/api";
import { useStagesLoader, useTasksLoader } from "@/shared/hooks";
import { Column } from "@/entities/main/project/kanban_board/column/Column";
import { ProjectTaskCreateModal } from "@/features/main/projects/modals/tasks/project_task_create_modal";
import { ProjectTaskTabsModal } from "@/features/main/projects/modals/tasks/project_task_tabs_modal";

const KanbanBoard = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { stages } = useStagesLoader();
  const { tasks } = useTasksLoader();
  const { moveTask } = useTasksStore();
  const [activeStageId, setActiveStageId] = useState<number | null>(null);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [targetState, setTargetState] = useState<{
    stageId: number;
    position: number;
  } | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const {
    isOpenModalTasks,
    updateIsOpenModalTasks,
    isOpenModalTabs,
    updateIsOpenModalTabs,
  } = useTasksStore();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeType = active.data.current?.type;
    const overType = over.data.current?.type;

    if (activeType !== "task") return;

    let newStageId: number;
    let newPosition: number;

    if (overType === "task") {
      const overTask = tasks.find(
        (t) => t.id.toString() === over.id.toString()
      );
      if (!overTask) return;
      newStageId = overTask.stageId;
      newPosition = overTask.position;
    } else if (overType === "stage") {
      const stage = stages.find((s) => s.id.toString() === over.id.toString());
      if (!stage) return;
      newStageId = stage.id;
      newPosition = tasks.filter((t) => t.stageId === newStageId).length;
    } else {
      return;
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

  useEffect(() => {
    if (!projectId) return;

    const ws = new WebSocket(`ws://your-api-url/project/${projectId}/ws/tasks`);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      switch (data.Type) {
        case "update_collaborators":
          useTasksStore.getState().updateTaskCollaborators(data.ID, data.Collaborators);
          break;
      }
    };

    return () => {
      ws.close();
    };
  }, [projectId]);

  const handleColumnClick = (stageId: number) => {
    setActiveStageId(stageId);
    updateIsOpenModalTasks(true);
  };

  const handleItemClick = (task: Task) => {
    setSelectedTask(task);
    updateIsOpenModalTabs(true);
  };

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={({ active }) =>
          setActiveId(parseInt(active.id.toString()))
        }
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className={classes.kanbanBoard}>
          {stages.map((stage) => (
            <Column
              onClick={handleColumnClick}
              key={stage.id}
              id={stage.id.toString()}
              title={stage.title}
              tasks={tasks
                .filter((task) => task.stageId === stage.id)
                .sort((a, b) => a.position - b.position)}
              onItemClick={handleItemClick}
              projectId={projectId || ""}
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
      <ProjectTaskCreateModal
        isOpen={isOpenModalTasks}
        onClose={() => updateIsOpenModalTasks(false)}
        stageId={activeStageId || 0}
        projectId={projectId || ""}
      />
      {selectedTask && (
        <ProjectTaskTabsModal
          isOpen={isOpenModalTabs}
          onClose={() => updateIsOpenModalTabs(false)}
          task={selectedTask}
        />
      )}
    </>
  );
};

export { KanbanBoard };
