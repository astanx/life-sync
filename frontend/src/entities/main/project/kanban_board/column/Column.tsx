import { FC } from "react";
import classes from "./Column.module.css";
import { SortableContext } from "@dnd-kit/sortable";
import { TaskItem } from "@/entities/main/project/kanban_board/task_item";
import { useDroppable } from "@dnd-kit/core";
import { Task } from "@/features/main/projects/kanban_board/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

type ColumnProps = {
  id: string;
  tasks: Task[];
  title: string;
  projectId: string;
  onClick: (stageId: number) => void;
  onItemClick: (task: Task) => void;
};

const Column: FC<ColumnProps> = ({
  id,
  title,
  tasks,
  onClick,
  onItemClick,
}) => {
  const { setNodeRef } = useDroppable({
    id,
    data: {
      type: "stage",
    },
  });

  return (
    <div ref={setNodeRef} className={classes.column}>
      <div className={classes.header}>
        <h3>{title}</h3>
        <button
          className={classes.addButton}
          onClick={() => onClick(+id)}
          aria-label="Add task"
        >
          <FontAwesomeIcon icon={faPlus} />
        </button>
      </div>

      <SortableContext items={tasks.map((t) => t.id.toString())}>
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            stageId={id}
            onClick={onItemClick}
          />
        ))}
      </SortableContext>

      {tasks.length === 0 && (
        <div className={classes.emptyState}>Drop tasks here</div>
      )}
    </div>
  );
};

export { Column };
