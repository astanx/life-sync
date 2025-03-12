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
import { useStagesStore } from "@/features/main/projects/stages_table/model";
import classes from "./KanbanBoard.module.css";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Column } from "@/entities/main/project/kanban_board/column/Column";
import { tasksAPI } from "@/features/main/projects/kanban_board/api";
import { useTasksStore } from "@/features/main/projects/kanban_board/model";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";

interface DragData {
  stageId: number;
  position: number;
}

const KanbanBoard = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { stages } = useStagesStore();
  const { tasks, addTask, updateTask, moveTask, getTasks } = useTasksStore();
  const [activeId, setActiveId] = useState<number | null>(null);
  const ws = useRef<WebSocket | null>(null);
  const [currentStageId, setCurrentStageId] = useState<number | null>(null);

  useEffect(() => {
    if (projectId) {
      stages.forEach((stage) => {
        getTasks(projectId, stage.id.toString());
      });
    }
  }, [projectId, stages]);

  useEffect(() => {
    if (!projectId) return;

    ws.current = new WebSocket(
      `wss://lifesync-backend.onrender.com/api/project/stages/${projectId}/tasks/ws`
    );

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      switch (data.type) {
        case "create_task":
          addTask(data.task);
          break;
        case "update_task":
          updateTask(data.id, data);
          break;
      }
    };

    return () => ws.current?.close();
  }, [projectId]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    if (!over) return;

    const overId = over.id.toString();
    const stageId = stages.find(s => s.id.toString() === overId)?.id;
    
    if (stageId) {
      setCurrentStageId(stageId);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || !currentStageId) return;

    const activeData = active.data.current as DragData;
    const taskId = parseInt(active.id.toString());

    try {
      const newPosition = 0;
      
      // Обновляем задачу
      moveTask(taskId, currentStageId, newPosition);
      
      if (projectId) {
        await tasksAPI.updateTaskPosition(
          {
            id: taskId,
            stage_id: currentStageId,
            position: newPosition,
          },
          projectId
        );
      }
    } catch (error) {
      console.error('Task move failed:', error);
      moveTask(taskId, activeData.stageId, activeData.position);
    } finally {
      setCurrentStageId(null);
    }
  };

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
            tasks={tasks.filter((task) => task.stage_id === stage.id)}
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