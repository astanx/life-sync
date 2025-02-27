import classes from "./SendMessage.module.css";
import { useForm } from "react-hook-form";

interface Form {
  message: string;
}

const SendMessage = () => {
  const { register, handleSubmit, reset } = useForm<Form>();

  const submit = (data: Form) => {
    reset();
  };
  return (
    <form className={classes.input_container} onSubmit={handleSubmit(submit)}>
      <input
        type="text"
        placeholder="Message"
        className={classes.custom_input}
        autoComplete="off"
        {...register("message", { required: true })}
      />
      <button className={classes.send_button}>
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z"
            fill="currentColor"
          />
        </svg>
      </button>
    </form>
  );
};

export { SendMessage };
