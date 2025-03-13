import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import classes from './TaskItem.module.css';

type Task = {
  id: number;
  title: string;
  position: number;
  stageId: number;
  projectId: number;
  createdAt: string;
};

type TaskItemProps = {
  task: Task;
  stageId: string;
};

const TaskItem = ({ task, stageId }: TaskItemProps) => {
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

export { TaskItem};