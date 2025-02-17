import { useAuthStore } from "@/features/auth/model";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const useAuthRedirect = () => {
  const navigate = useNavigate();
  const isLogined = useAuthStore((state) => state.isLogined);

  useEffect(() => {
    if (!isLogined) {
      navigate("/");
    }
  }, [isLogined, navigate]);

  return isLogined;
};

export { useAuthRedirect };
