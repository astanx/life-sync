import { create } from "zustand";
import { tasksAPI } from "@/features/main/projects/kanban_board/api";
import { createJSONStorage, persist } from "zustand/middleware";

type Task = {
  id: number;
  title: string;
  position: number;
  stageId: number;
  projectId: number;
  createdAt: string;
};

interface TasksStore {
  tasks: Task[];
  addTask: (task: Task) => void;
  updateTask: (taskId: number, updates: Partial<Task>) => void;
  moveTask: (
    taskId: number,
    newStageId: number,
    newPosition: number,
    oldStageId: number,
    oldPosition: number
  ) => void;
  setTasks: (tasks: Task[]) => void;
  getTasks: (projectId: string, stageId: string) => Promise<void>;
}

const useTasksStore = create<TasksStore>()(
  persist(
    (set) => ({
      tasks: [],

      addTask: (task) =>
        set((state) => ({
          tasks: [...state.tasks, task],
        })),

      updateTask: (taskId, updates) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId ? { ...task, ...updates } : task
          ),
        })),

      moveTask: (taskId, newStageId, newPosition, oldStageId, oldPosition) => {
        set((state) => {
          const updatedTasks = state.tasks.map((task) => {
            if (task.stageId === oldStageId && task.position > oldPosition) {
              return { ...task, position: task.position - 1 };
            }

            if (task.stageId === newStageId && task.position >= newPosition) {
              return { ...task, position: task.position + 1 };
            }

            return task;
          });

          const movedTask = updatedTasks.find((t) => t.id === taskId);
          if (!movedTask) return state;

          return {
            tasks: [
              ...updatedTasks.filter((t) => t.id !== taskId),
              { ...movedTask, stageId: newStageId, position: newPosition },
            ].sort((a, b) => a.position - b.position),
          };
        });
      },

      setTasks: (tasks) => set({ tasks }),

      getTasks: async (projectId, stageId) => {
        try {
          const response = await tasksAPI.getTasks(projectId, stageId);
          const normalizedTasks = response.data.task.map((t: any) => ({
            id: t.id,
            title: t.title,
            position: t.position,
            stageId: t.stage_id,
            projectId: t.project_id,
            createdAt: t.created_at,
          }));

          set((state) => ({
            tasks: [
              ...state.tasks.filter((t) => t.stageId !== parseInt(stageId)),
              ...normalizedTasks,
            ],
          }));
        } catch (error) {
          console.error("Error loading tasks:", error);
        }
      },
    }),
    {
      name: "tasks-storage",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ tasks: state.tasks }),
    }
  )
);

export { useTasksStore };
