interface User {
  password: string;
  email: string;
  repeat_password?: string;
}
type Response = {
  error?: string;
  id: number;
};

export type { User, Response };
