import { FC } from "react";
import classes from "./Column.module.css";
import { SortableContext } from "@dnd-kit/sortable";
import {TaskItem} from "@/entities/main/project/kanban_board/task_item";
import { useDroppable } from "@dnd-kit/core";

type Task = {
  id: number;
  title: string;
  position: number;
  stageId: number;
  projectId: number;
  createdAt: string;
};

type ColumnProps = {
  id: string;
  tasks: Task[];
  title: string;
};

const Column: FC<ColumnProps> = ({ id, title, tasks }) => {
  const { setNodeRef } = useDroppable({
    id: id,
    data: {
      stageId: parseInt(id),
    },
  });

  return (
    <div ref={setNodeRef} className={classes.column}>
      <h3>{title}</h3>
      <SortableContext items={tasks.map((t) => t.id.toString())}>
        {tasks.map((task) => (
          <TaskItem key={task.id} task={task} stageId={id} />
        ))}
      </SortableContext>
    </div>
  );
};

export { Column };
