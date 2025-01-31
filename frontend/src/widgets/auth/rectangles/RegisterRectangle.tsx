import { Rectangle } from "@/widgets/auth/rectangles";
import register_image from "@/shared/assets/images/register_image.png";

const RegisterRectangle = () => {
  return (
    <Rectangle>
      <img src={register_image} alt="register" />
    </Rectangle>
  );
};
export { RegisterRectangle };
