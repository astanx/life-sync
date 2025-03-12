import { useSortable } from "@dnd-kit/sortable";
import { FC } from "react";
import classes from './TaskItem.module.css'
import { CSS } from "@dnd-kit/utilities";
import { Task } from "@/features/main/projects/kanban_board/api";

type Props = {
  task: Task;
  stageId: string;
};

const TaskItem: FC<Props> = ({ task, stageId }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ 
    id: task.id.toString(),
    data: {
      stageId: Number(stageId),
      position: task.position
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={classes.taskItem}
      data-stage-id={stageId}
      data-position={task.position}
    >
      {task.title}
    </div>
  );
};
export { TaskItem };