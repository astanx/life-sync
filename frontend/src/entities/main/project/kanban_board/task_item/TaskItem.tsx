import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import classes from "./TaskItem.module.css";
import { FC } from "react";
import type { Task } from "@/features/main/projects/kanban_board/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserPlus, faUsers } from "@fortawesome/free-solid-svg-icons";
import { tasksAPI } from "@/features/main/projects/kanban_board/api";
import { useParams } from "react-router-dom";
import { useAuthStore } from "@/features/auth/model";

type Props = {
  task: Task;
  stageId: string;
  onClick: (task: Task) => void;
};

const TaskItem: FC<Props> = ({ task, stageId, onClick }) => {
  const { id } = useAuthStore();
  const { projectId } = useParams<{ projectId: string }>();
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: task.id.toString(),
      data: {
        type: "task",
        stageId: stageId,
        position: task.position,
      },
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isCollaborator = task.collaborators?.some(c => c.id === id);
  const collaboratorsCount = task.collaborators?.length || 0;

  const handleJoinAsCollaborator = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!id || !projectId) return;
    
    try {
      await tasksAPI.addCollaborator(
        projectId, 
        task.id.toString(), 
        id, 
        task.stageId.toString()
      );

    } catch (error) {
      console.error("Failed to join as collaborator:", error);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={classes.taskItem}
      {...attributes}
    >
      <div className={classes.dragHandle} {...listeners}>
        <div className={classes.content}>
          <div className={classes.title}>{task.title}</div>
          <div className={classes.collaborationInfo}>
            <div className={classes.collaboratorsBadge} title="Collaborators">
              <FontAwesomeIcon icon={faUsers} className={classes.icon} />
              <span className={classes.count}>{collaboratorsCount}</span>
            </div>
          </div>
        </div>
      </div>

      <div className={classes.actionsContainer}>
        {!isCollaborator && (
          <button 
            className={classes.joinButton}
            onClick={handleJoinAsCollaborator}
            onMouseDown={(e) => e.stopPropagation()}
            title="Join as collaborator"
          >
            <FontAwesomeIcon icon={faUserPlus} className={classes.icon} />
          </button>
        )}
        
        <button
          className={classes.menuButton}
          onClick={(e) => {
            e.stopPropagation();
            onClick(task);
          }}
          onMouseDown={(e) => e.stopPropagation()}
          aria-label="Task actions"
        >
          ⋮
        </button>
      </div>
    </div>
  );
};

export { TaskItem };