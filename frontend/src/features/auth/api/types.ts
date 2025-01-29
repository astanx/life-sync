interface User {
  password: string;
  username: string;
}
type Response =  {
    error?: string
    token: string
} 

export type { User,Response };
