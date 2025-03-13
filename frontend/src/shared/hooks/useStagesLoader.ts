import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useStagesStore } from '@/features/main/projects/stages_table/model';

export const useStagesLoader = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { stages, getStages, addStage, deleteStageLocal, updateStageLocal } = useStagesStore();

  useEffect(() => {
    if (!projectId) return;

    const ws = new WebSocket(
      `wss://lifesync-backend.onrender.com/api/project/stages/${projectId}/ws`
    );

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
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
    };

    return () => ws.close();
  }, [projectId, addStage, updateStageLocal, deleteStageLocal]);

  useEffect(() => {
    if (projectId && !stages.length) {
      getStages(projectId);
    }
  }, [projectId, getStages, stages.length]);

  return { stages, isLoading: !stages.length };
};