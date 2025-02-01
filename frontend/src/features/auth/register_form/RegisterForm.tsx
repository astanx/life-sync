import { Input } from "@/shared/ui/input";
import { AuthButton } from "../auth_button";
import classes from "./RegisterForm.module.css";
import { useForm } from "react-hook-form";
import { User } from "@/features/auth/api";
import { useAuthStore } from "@/features/auth/model";
import { useNavigate } from "react-router-dom";

const RegisterForm = () => {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<User>();

  const registerUser = useAuthStore((state) => state.register);
  const sendVerificationCode = useAuthStore((state) => state.sendVerificationCode)
  const navigate = useNavigate()
  
  const submit = async (user: User) => {
    if (user.password.trim() !== user.repeat_password?.trim()) {
      setError("repeat_password", {
        type: "manual",
        message: "Passwords don't match",
      });
      return;
    }
    const data = await registerUser(user);

    if (data.error) {
      setError("email", {
        type: "manual",
        message: data.error || "Register failed",
      });
      return
    }
    await sendVerificationCode()
    navigate("/verification")
  };

  return (
    <form className={classes.form} onSubmit={handleSubmit(submit)}>
      <Input
        label="Email"
        placeholder="Email"
        type="email"
        {...register("email", { required: true })}
      />
      {errors.email && (
        <span className={classes.error}>{errors.email.message}</span>
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
