import { projectsIntence } from "@/features/main/projects/projects_content/api";

const projectsAPI = {
  createProject: async (title: string) => {
    const response = await projectsIntence.post("", { title });
    return response;
  },
  getProjects: async () => {
    const response = await projectsIntence.get("");
    return response;
  },
  deleteProject: async (projectId: string) => {
    const response = await projectsIntence.delete(`/${projectId}`);
    return response;
  },
  updateProject: async (title: string, projectId: string) => {
    const response = await projectsIntence.put(``, { title, id: +projectId });
    return response;
  },
  updateLastOpened: async (projectId: string) => {
    const response = await projectsIntence.patch(`/${projectId}`,);
    return response;
  }
};

export { projectsAPI };
