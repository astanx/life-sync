import { useTasksStore } from "@/features/main/projects/kanban_board/model";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useStagesStore } from "@/features/main/projects/stages_table/model";
import { Task } from "@/features/main/projects/kanban_board/api";

const useTasksLoader = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { tasks, getTasks, addTask, updateTask, removeTask, updateTaskCollaborators } = useTasksStore();
  const { stages } = useStagesStore();

  useEffect(() => {
    if (!projectId) return;

    const wsUrl = `wss://lifesync-backend.onrender.com/api/project/${projectId}/ws/tasks`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("WebSocket connected");
      stages.forEach((stage) => getTasks(projectId, stage.id.toString()));
    };

    ws.onmessage = (event) => {
      console.log("WebSocket message:", event.data);
      try {
        const data = JSON.parse(event.data);
        const normalized: Task = {
          id: data.id,
          title: data.title,
          position: data.position,
          stageId: data.stage_id,
          projectId: data.project_id,
          createdAt: data.created_at,
          collaborators: data.collaborators || [],
        };

        switch (data.type) {
          case "create_task":
            addTask(normalized);
            break;
          case "update_task":
            updateTask(normalized.id, {
              stageId: normalized.stageId,
              position: normalized.position,
            });
            break;
          case "delete_task":
            removeTask(normalized.id);
            break;
          case "update_collaborators":
            updateTaskCollaborators(normalized.id, normalized.collaborators);
            break;
        }
      } catch (error) {
        console.error("WebSocket message error:", error);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = (event) => {
      console.log("WebSocket closed:", event.code, event.reason);
      setTimeout(
        () =>
          stages.forEach((stage) => getTasks(projectId, stage.id.toString())),
        5000
      );
    };

    return () => ws.close();
  }, [projectId, addTask, updateTask, getTasks, stages, removeTask]);

  return { tasks };
};

export { useTasksLoader };
