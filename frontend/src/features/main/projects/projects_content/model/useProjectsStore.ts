import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { projectsAPI } from "../api";

interface Project {
  title: string;
  id: number;
}

interface Store {
  projects: Project[];
  getProjects: () => Promise<void>;
  createProject: (title: string) => Promise<void>;
  getProjectTitle: (projectId: string) => string;
  deleteProject: (projectId: string) => Promise<void>;
  updateProject: (title: string, projectId: string) => Promise<void>;
}

const useProjectsStore = create<Store>()(
  persist(
    (set, get) => ({
      projects: [],
      getProjects: async () => {
        const response = await projectsAPI.getProjects();
        if (response.data.error) {
          console.error(response.data.error);
          return;
        }
        set(() => ({ projects: response.data.project }));
      },
      createProject: async (title: string) => {
        const response = await projectsAPI.createProject(title);
        if (response.data.error) {
          console.error(response.data.error);
          return;
        }
        set((state) => ({
          projects: [...state.projects, response.data.project],
        }));

        return response.data.project.id;
      },
      getProjectTitle: (projectId: string) => {
        return get().projects.find((project) => project.id === +projectId)!
          .title;
      },
      deleteProject: async (projectId: string) => {
        const response = await projectsAPI.deleteProject(projectId);
        if (response.data.error) {
          console.error(response.data.error);
          return;
        }
        set((state) => ({
          projects: state.projects.filter(
            (project) => project.id !== +projectId
          ),
        }));
      },
      updateProject: async (title: string, projectId: string) => {
        const response = await projectsAPI.updateProject(title, projectId);
        if (response.data.error) {
          console.error(response.data.error);
          return;
        }
        set((state) => ({
          projects: state.projects.map((project) => {
            if (project.id === +projectId) {
              return { ...project, title };
            }
            return project;
          }),
        }));
      },
    }),

    {
      name: "projects-storage",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);

export { useProjectsStore };
