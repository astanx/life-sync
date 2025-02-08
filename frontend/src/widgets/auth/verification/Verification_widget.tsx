import { Logo } from "@/shared/ui/logo";
import classes from "./Verification_widget.module.css";
import { VerificationForm } from "@/features/auth/verification_form";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/features/auth/model";
import { useEffect } from "react";

const VerificationWidget = () => {
  const navigate = useNavigate();
  const email = useAuthStore((state) => state.email);
  const sendVerificationCode = useAuthStore(
    (state) => state.sendVerificationCode
  );

  useEffect(() => {
    if (!email) {
      navigate("/login");
    }
  });
  return (
    <div>
      <div className={classes.logo_container}>
        <Logo />
      </div>
      <div className={classes.verification}>
        <h3>Enter your verification code</h3>
        <p>We sent a verification code to {email}</p>
        <VerificationForm />
        <span>
          No code yet?{" "}
          <span className={classes.code} onClick={sendVerificationCode}>
            Send another
          </span>
        </span>
      </div>
    </div>
  );
};
export { VerificationWidget };
