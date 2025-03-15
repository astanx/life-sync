import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import classes from "./TaskItem.module.css";
import { FC } from "react";

type Task = {
  id: number;
  title: string;
  position: number;
  stageId: number;
  projectId: number;
  createdAt: string;
};

type Props = {
  task: Task;
  stageId: string;
  onClick: (task: Task) => void;
};

const TaskItem: FC<Props> = ({ task, stageId, onClick }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: task.id.toString(),
      data: {
        type: "task",
        stageId: Number(stageId),
        position: task.position,
      },
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={classes.taskItem}
      {...attributes}
    >
      <div className={classes.content} {...listeners}>
        {task.title}
      </div>

      <div className={classes.taskActions}>
        <button
          className={classes.menuButton}
          onClick={() => onClick(task)}
          aria-label="Task actions"
        >
          ⋮
        </button>
      </div>
    </div>
  );
};

export { TaskItem };
