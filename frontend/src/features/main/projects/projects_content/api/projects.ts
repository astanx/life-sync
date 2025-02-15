import { projectsIntence } from "@/features/main/projects/projects_content/api";

const projectsAPI = {
  createCalendar: async (title: string) => {
    const response = await projectsIntence.post("", { title });
    return response;
  },
  getCalendars: async () => {
    const response = await projectsIntence.get("");
    return response;
  },
  deleteCalendar: async (projectId: string) => {
    const response = await projectsIntence.delete(`/${projectId}`);
    return response;
  },
  updateCalendar: async (title: string, projectId: string) => {
    const response = await projectsIntence.put(``, { title, id: +projectId });
    return response;
  },
};

export { projectsAPI };
