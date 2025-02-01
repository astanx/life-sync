import { InputCell } from "@/shared/ui/input_cell";
import classes from "./VerificationForm.module.css";
import { Controller, useForm } from "react-hook-form";
import { useRef, useState } from "react";
import { AuthButton } from "@/features/auth/auth_button";
import { useAuthStore } from "../model";
import { useNavigate } from "react-router-dom";

interface Form {
  authCode: string[];
}

const VerificationForm = () => {
  const { handleSubmit, control } = useForm<Form>({
    defaultValues: { authCode: Array(5).fill("") }, 
  });
  const [verifyCodeError, setVerifyCodeError] = useState("")

  const verifyCode = useAuthStore((state) => state.verifyCode)
  const navigate = useNavigate()

  const submit = async (data: Form) => {
    const response = await verifyCode(data.authCode)

    if ('error' in response){
      setVerifyCodeError(response.error)
      return
    }
    setVerifyCodeError("")
    navigate("/projects")
  };

  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  

  const handleInputChange = (value: string, index: number) => {
    if (value.length > 0 && index < inputsRef.current.length - 1) {
      inputsRef.current[index + 1]?.focus(); 
    } else if (value.length === 0 && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };


  return (
    <form className={classes.form} onSubmit={handleSubmit(submit)}>
      <div>
        {Array.from({ length: 5 }).map((_, index) => (
          <Controller
            key={index}
            name={`authCode.${index}`}
            control={control}
            defaultValue=""
            rules={{ required: true }}
            render={({ field }) => (
              <InputCell
                {...field}
                index={index}
                ref={(el) => (inputsRef.current[index] = el)}
                onCustomChange={(value: string) => {
                  field.onChange(value);
                  handleInputChange(value, index);
                }}
              />
            )}
          />
        ))}
        {verifyCodeError && (
        <div className={classes.error}>{verifyCodeError}</div>
      )}
      </div>
      <AuthButton>Verify</AuthButton>
    </form>
  );
};

export { VerificationForm };