interface User {
  password: string;
  username: string;
  repeat_password?: string;
}
type Response = {
  error?: string;
  token: string;
};

export type { User, Response };
