import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { Stage, stagesAPI } from "@/features/main/projects/stages_table/api";

interface Store {
  stages: Stage[];
  getStages: (projectId: string) => Promise<void>;
  createStage: (stage: Stage, projectId: string) => Promise<void>;
  updateStage: (stage: Stage, projectId: string) => Promise<void>;
  deleteStage: (stageId: string, projectId: string) => Promise<void>;
}

const useStagesStore = create<Store>()(
  persist(
    (set) => ({
      stages: [],
      getStages: async (projectId: string) => {
        const response = await stagesAPI.getStages(projectId);
        if (response.data.error) {
          console.error(response.data.error);
          return;
        }
        set(() => ({ stages: response.data.stage }));
      },
      createStage: async (stage: Stage, projectId: string) => {
        const response = await stagesAPI.createStage(stage, projectId);
        if (response.data.error) {
          console.error(response.data.error);
          return;
        }
        set((state) => ({ stages: [...state.stages, response.data.stage] }));
      },
      updateStage: async (stage: Stage, projectId: string) => {
        const response = await stagesAPI.updateStage(stage, projectId);

        if (response.data.error) {
          console.error(response.data.error);
          return;
        }
        set((state) => ({
          stages: state.stages.map((e) =>
            e.id === response.data.stage.id ? response.data.stage : e
          ),
        }));
      },
      deleteStage: async (stageId: string, projectId: string) => {
        const response = await stagesAPI.deleteStage(stageId, projectId);

        if (response.data.error) {
          console.error(response.data.error);
          return;
        }

        set((state) => ({
          stages: state.stages.filter(
            (stage) => stage.id !== +stageId
          ),
        }));
      },
    }),

    {
      name: "project-stages-storage",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);

export { useStagesStore };
