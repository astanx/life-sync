type TaskResponse = {
  id: number;
  title: string;
  position: number;
  stage_id: number;
  project_id: number;
  created_at: string;
  collaborators: Collaborator[];
};


type Task = {
  id: number;
  title: string;
  position: number;
  stageId: number;
  projectId: number;
  createdAt: string;
  collaborators: Collaborator[];
};


type Collaborator = {
  id: number;
  email: string;
};

export type { Task, TaskResponse, Collaborator };
