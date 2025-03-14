type TaskResponse = {
  id: number;
  title: string;
  position: number;
  stage_id: number;
  project_id: number;
  created_at: string;
};

type Task = {
  id: number;
  title: string;
  position: number;
  stageId: number;
  projectId: number;
  createdAt: string;
};

export type { Task, TaskResponse };
