import { stagesIntence } from "./intence";
import { Stage } from "./types";

const stagesAPI = {
  createStage: async (stage: Omit<Stage, "id">, projectId: string) => {
    const response = await stagesIntence.post(
      `/${projectId}`,
      stage
    );
    return response;
  },
  getStages: async (projectId: string) => {
    const response = await stagesIntence.get(
      `/${projectId}`
    );
    return response;
  },
  updateStage: async (stage: Stage, projectId: string) => {
    const response = await stagesIntence.put(`/${projectId}`, {
      ...stage,
      id: +stage.id,
    });
    return response;
  },
  deleteStage: async (stageId: string, projectId: string) => {
    const response = await stagesIntence.delete(
      `/${projectId}/${stageId}`
    );
    return response;
  },
  updateStagePosition: async (stage: Stage, projectId: string) => {
    const response = await stagesIntence.patch(`/${projectId}`, {
      ...stage,
      id: +stage.id,
    });
    return response;
  }
};

export { stagesAPI };
