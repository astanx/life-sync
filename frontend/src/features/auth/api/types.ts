interface User {
  password: string;
  email: string;
  repeat_password?: string;
}
type Response = {
  error?: string;
  id: number;
};

type VerifyCodeResponse = 
    | { error: string }
    | { message: string };

export type { User, Response, VerifyCodeResponse };
