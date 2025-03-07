import { create } from "zustand";
import { Stage, stagesAPI } from "../api";

interface Store {
  stages: Stage[];
  getStages: (projectId: string) => Promise<void>;
  createStage: (stage: Omit<Stage, "id">, projectId: string) => Promise<void>;
  updateStage: (stage: Stage, projectId: string) => Promise<void>;
  deleteStage: (stageId: string, projectId: string) => Promise<void>;
  addStage: (stage: Stage) => void;
  updateStageLocal: (stage: Stage) => void;
  deleteStageLocal: (stageId: number) => void;
}

const useStagesStore = create<Store>((set) => ({
  stages: [],
  getStages: async (projectId) => {
    try {
      const response = await stagesAPI.getStages(projectId);
      if (!response.data.error) {
        set({ stages: response.data.stage });
      }
    } catch (error) {
      console.error("Error fetching stages:", error);
    }
  },

  createStage: async (stageData, projectId) => {
    try {
      await stagesAPI.createStage(stageData, projectId);
    } catch (error) {
      console.error("Failed to create stage:", error);
      throw error;
    }
  },

  updateStage: async (stageData, projectId) => {
    try {
      await stagesAPI.updateStage(stageData, projectId);
    } catch (error) {
      console.error("Failed to update stage:", error);
      throw error;
    }
  },

  deleteStage: async (stageId, projectId) => {
    try {
      await stagesAPI.deleteStage(stageId, projectId);
    } catch (error) {
      console.error("Failed to delete stage:", error);
      throw error;
    }
  },

  addStage: (stage) => {
    set((state) => ({ stages: [...state.stages, stage] }));
  },

  updateStageLocal: (stage) => {
    set((state) => ({
      stages: state.stages.map((s) =>
        s.id === stage.id ? stage : s
      ),
    }));
  },

  deleteStageLocal: (stageId) => {
    set((state) => ({
      stages: state.stages.filter((s) => s.id !== stageId),
    }));
  },
}));

export { useStagesStore };