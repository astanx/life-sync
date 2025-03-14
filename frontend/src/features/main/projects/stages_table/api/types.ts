interface Stage {
  id: number;
  title: string;
  start: string;
  end: string;
}

type Status = {
  id: 'todo' | 'in_progress' | 'done';
  title: string;
};

export type { Stage, Status };
