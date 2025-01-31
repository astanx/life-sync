import classes from "./Verification.module.css";
import { VerificationRectangle } from "@/widgets/auth/rectangles";
import { VerificationWidget } from "@/widgets/auth/verification";

const Verification = () => {
  return (
    <div className={classes.register_container}>
      <VerificationWidget />
      <VerificationRectangle />
    </div>
  );
};

export { Verification };
