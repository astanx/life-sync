import { useTasksStore } from "@/features/main/projects/kanban_board/model";
import { useEffect } from "react";
import { useParams } from "react-router-dom";

export const useTasksLoader = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { tasks, getTasks, addTask, updateTask } = useTasksStore();

  useEffect(() => {
    if (!projectId) return;

    const wsUrl = `wss://lifesync-backend.onrender.com/api/project/${projectId}/ws/tasks`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("WebSocket connected");
      getTasks(projectId, "0");
    };

    ws.onmessage = (event) => {
      console.log("WebSocket message:", event.data);
      try {
        const data = JSON.parse(event.data);
        const normalized = {
          id: data.id,
          title: data.title,
          position: data.position,
          stageId: data.stage_id,
          projectId: data.project_id,
          createdAt: data.created_at,
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
      setTimeout(() => getTasks(projectId, "0"), 5000);
    };

    return () => ws.close();
  }, [projectId, addTask, updateTask, getTasks]);

  return { tasks };
};
