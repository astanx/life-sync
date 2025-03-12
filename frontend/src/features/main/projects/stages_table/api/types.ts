interface Stage {
  id: number;
  title: string;
  start: string;
  end: string;
  position: number;
  status: "todo" | "in_progress" | "done";
}

type Status = {
  id: 'todo' | 'in_progress' | 'done';
  title: string;
};

export type { Stage, Status };
