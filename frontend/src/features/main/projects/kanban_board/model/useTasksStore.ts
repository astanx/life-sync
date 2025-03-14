import { create } from "zustand";
import {
  Task,
  TaskResponse,
  tasksAPI,
} from "@/features/main/projects/kanban_board/api";
import { createJSONStorage, persist } from "zustand/middleware";

interface TasksStore {
  tasks: Task[];
  isOpenModalTasks: boolean;
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
  createTask: (
    title: string,
    stageId: number,
    projectId: string
  ) => Promise<void>;
  updateIsOpenModalTasks: (isOpen: boolean) => void;
}

const useTasksStore = create<TasksStore>()(
  persist(
    (set) => ({
      tasks: [],
      isOpenModalTasks: false,

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
          const normalizedTasks = response.data.task.map((t: TaskResponse) => ({
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
      createTask: async (title, stageId, projectId) => {
        try {
          const response = await tasksAPI.createTask(
            { title, stage_id: stageId },
            projectId,
            stageId.toString()
          );

          const newTask = {
            id: response.data.id,
            title: response.data.title,
            position: response.data.position,
            stageId: stageId,
            projectId: parseInt(projectId),
            createdAt: new Date().toISOString(),
          };

          set((state) => ({
            tasks: [...state.tasks, newTask],
          }));
        } catch (error) {
          console.error("Error creating task:", error);
          throw error;
        }
      },
      updateIsOpenModalTasks: (isOpen: boolean) =>
        set(() => ({ isOpenModalTasks: isOpen })),
    }),
    {
      name: "tasks-storage",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ tasks: state.tasks }),
    }
  )
);

export { useTasksStore };
