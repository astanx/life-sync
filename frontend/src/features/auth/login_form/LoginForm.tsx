import { Input } from "@/shared/ui/input";
import { AuthButton } from "@/features/auth/auth_button";
import classes from "./LoginForm.module.css";
import { useForm } from "react-hook-form";
import { User } from "@/features/auth/api";
import { useAuthStore } from "@/features/auth/model";
import { useNavigate } from "react-router-dom";

const LoginForm = () => {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<User>();

  const login = useAuthStore((state) => state.login);
  const sendVerificationCode = useAuthStore(
    (state) => state.sendVerificationCode
  );
  const navigate = useNavigate();

  const submit = async (user: User) => {
    const data = await login(user);

    if (data.error) {
      setError("email", {
        type: "manual",
        message: data.error || "Login failed",
      });
      return;
    }

    await sendVerificationCode();

    navigate("/verification");
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
      <AuthButton>Login</AuthButton>
    </form>
  );
};
export { LoginForm };
