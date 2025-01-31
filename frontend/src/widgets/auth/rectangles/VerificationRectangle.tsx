import { Rectangle } from "@/widgets/auth/rectangles";
import verification_image from "@/shared/assets/images/verification_image.png";

const VerificationRectangle = () => {
  return (
    <Rectangle>
      <img src={verification_image} alt="verification" />
    </Rectangle>
  );
};
export { VerificationRectangle };
