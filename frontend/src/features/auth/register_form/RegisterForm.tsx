import { Input } from "@/shared/ui/input";
import { AuthButton } from "../auth_button";
import classes from "./RegisterForm.module.css";
import { useForm } from "react-hook-form";
import { AxiosError } from "axios";
import { authAPI, Response, User } from "@/features/auth/api";

const RegisterForm = () => {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<User>();
  const submit = async (user: User) => {
    if (user.password.trim() !== user.repeat_password?.trim()) {
      setError("repeat_password", {
        type: "manual",
        message: "Passwords don't match",
      });
      return;
    }
    try {
      await authAPI.register(user);
    } catch (error) {
      const apiError = error as AxiosError<Response>;

      if (apiError.response && apiError.response.data) {
        setError("username", {
          type: "manual",
          message: apiError.response.data.error || "Register failed",
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
      <Input
        label="Repeat password"
        type="password"
        placeholder="Password"
        {...register("repeat_password", { required: true })}
      />
      {errors.repeat_password && (
        <span className={classes.error}>{errors.repeat_password.message}</span>
      )}
      <AuthButton>Register</AuthButton>
    </form>
  );
};
export { RegisterForm };
