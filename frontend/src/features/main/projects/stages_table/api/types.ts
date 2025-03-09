interface Stage {
  id: number;
  title: string;
  start: string;
  end: string;
  position: number;
  status: "todo" | "in_progress" | "done";
}

export type { Stage };
