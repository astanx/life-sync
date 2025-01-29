import { Input } from "@/shared/ui/input";
import { AuthButton } from "@/features/auth/auth_button";
import classes from "./LoginForm.module.css";
import { useForm } from "react-hook-form";
import { authAPI, Response, User } from "@/features/auth/api";
import { AxiosError } from "axios";

const LoginForm = () => {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<User>();
  const submit = async (user: User) => {
    try {
      await authAPI.login(user);
    } catch (error) {
      const apiError = error as AxiosError<Response>;

      if (apiError.response && apiError.response.data) {
        setError("username", {
          type: "manual",
          message: apiError.response.data.error || "Login failed",
        });
      } else {
        setError("username", {
          type: "manual",
          message: "An unexpected error occurred",
        });
      }
    }
  };
  return (
    <form className={classes.form} onSubmit={handleSubmit(submit)}>
      <Input
        label="Email"
        placeholder="Email"
        {...register("username", { required: true })}
      />
      {errors.username && (
        <span className={classes.error}>{errors.username.message}</span>
      )}
      <Input
        label="Password"
        type="password"
        placeholder="Password"
        {...register("password", { required: true })}
      />
      {errors.password && (
        <span className={classes.error}>{errors.password.message}</span>
      )}
      <AuthButton>Login</AuthButton>
    </form>
  );
};
export { LoginForm };
