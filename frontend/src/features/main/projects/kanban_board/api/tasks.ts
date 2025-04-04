import { tasksIntence } from "@/features/main/projects/kanban_board/api";

type UpdateTaskPositionPayload = {
  id: number;
  stage_id: number;
  position: number;
};

type UpdateTaskPayload = {
  id: number;
  title?: string;
  stage_id?: number;
  position?: number;
};

const tasksAPI = {
  createTask: async (
    task: { title: string; stage_id: number },
    projectId: string,
    stageId: string
  ) => {
    const response = await tasksIntence.post(
      `/${projectId}/${stageId}/tasks`,
      task
    );
    return response;
  },

  getTasks: async (projectId: string, stageId: string) => {
    const response = await tasksIntence.get(`/${projectId}/${stageId}/tasks`);
    return response;
  },

  updateTaskPosition: async (
    task: UpdateTaskPositionPayload,
    projectId: string
  ) => {
    const response = await tasksIntence.patch(
      `/${projectId}/${task.stage_id}/tasks`,
      task
    );
    return response;
  },

  updateTask: async (task: UpdateTaskPayload, projectId: string) => {
    const response = await tasksIntence.patch(
      `/${projectId}/${task.stage_id}/tasks`,
      task
    );
    return response;
  },

  deleteTask: async (taskId: number, stageId: number, projectId: string) => {
    const response = await tasksIntence.delete(
      `/${projectId}/${stageId}/tasks/${taskId}`
    );
    return response;
  },

  addCollaborator: async (
    projectId: string,
    taskId: string,
    userId: number,
    stageId: string
  ) => {
    const response = await tasksIntence.post(
      `/${projectId}/${stageId}/tasks/${taskId}/collaborators`,
      { userId }
    );
    return response;
  },

  removeCollaborator: async (
    projectId: string,
    taskId: string,
    userId: string
  ) => {
    const response = await tasksIntence.delete(
      `/${projectId}/tasks/${taskId}/collaborators/${userId}`
    );
    return response;
  },

  getCollaborators: async (projectId: string, taskId: string) => {
    const response = await tasksIntence.get(
      `/${projectId}/tasks/${taskId}/collaborators`
    );
    return response;
  },
};

export { tasksAPI };
