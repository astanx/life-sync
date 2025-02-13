import { BrowserRouter } from "react-router-dom";
import { AppRoutes, MainRoutes } from "./routes";

const App = () => {
  return (
    <BrowserRouter>
      <AppRoutes />
      <MainRoutes />
    </BrowserRouter>
  );
};

export default App;
