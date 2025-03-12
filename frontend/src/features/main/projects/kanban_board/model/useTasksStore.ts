import { create } from "zustand";
import { Task, tasksAPI } from "@/features/main/projects/kanban_board/api";
import { createJSONStorage, persist } from "zustand/middleware";

interface Store {
  tasks: Task[];
  addTask: (task: Task) => void;
  updateTask: (taskId: number, updates: Partial<Task>) => void;
  moveTask: (taskId: number, newStageId: number, newPosition: number) => void;
  setTasks: (tasks: Task[]) => void;
  getTasks: (projectId: string, stageId: string) => Promise<void>;
}

const useTasksStore = create<Store>()(persist(
  (set, get) => ({
    tasks: [],
    
    addTask: (task) =>
      set((state) => ({
        tasks: [...state.tasks, task],
      })),
      
    updateTask: (taskId, updates) =>
      set((state) => ({
        tasks: state.tasks.map(task => 
          task.id === taskId ? { ...task, ...updates } : task
        ),
      })),
      
      moveTask: (taskId, newStageId, newPosition) => {
        set((state) => {
          const updatedTasks = state.tasks.map(task => {
            if (task.id === taskId) {
              return { 
                ...task, 
                stage_id: newStageId,
                position: newPosition
              };
            }
            return task;
          });
      
          updatedTasks
            .filter(t => t.stage_id === newStageId)
            .sort((a, b) => a.position - b.position)
            .forEach((task, index) => {
              task.position = index;
            });
      
          return { tasks: updatedTasks };
        });
      },
    
    setTasks: (tasks) => set({ tasks }),
    
    getTasks: async (projectId, stageId) => {
      const response = await tasksAPI.getTasks(projectId, stageId);
      get().setTasks(response.data.task);
    }
  }),
  {
    name: "tasks-storage",
    storage: createJSONStorage(() => sessionStorage),
  }
));

export { useTasksStore };