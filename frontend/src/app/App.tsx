import { AppRoutes, MainRoutes } from "./routes";
import { useAuthStore } from "@/features/auth/model";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const App = () => {
  const loginFromCookie = useAuthStore((state) => state.loginFromCookie);
  const isLogined = useAuthStore((state) => state.isLogined);
  const navigate = useNavigate();

  useEffect(() => {
    const hasRedirected = sessionStorage.getItem("hasRedirected");
    if (!isLogined) {
      loginFromCookie().then(() => {
        if (isLogined && !hasRedirected) {
          sessionStorage.setItem("hasRedirected", "true");
          navigate("/dashboard");
        }
      });
    }
  }, [loginFromCookie, navigate, isLogined]);

  return (
    <>
      <AppRoutes />
      <MainRoutes />
    </>
  );
};

export default App;
