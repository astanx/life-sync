import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { projectsAPI } from "../api";

interface Project {
    title: string;
    id: number;
  }

interface Store {
    projects: Project[]
    getProjects: () => Promise<void>;
    createProject: (title: string) => Promise<void>;
}

const useProjectsStore = create<Store>()(
  persist(
    (set, get) => ({
      projects: [],
      getProjects: async () => {
        const response = await projectsAPI.getCalendars();
        if (response.data.error) {
          console.error(response.data.error);
          return;
        }
        set(() => ({ projects: response.data.project }));
      },

    }),

    {
      name: "calendar-storage",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);

export { useProjectsStore };
