import { BrowserRouter, Route, Routes } from "react-router-dom"
import { Home } from "@/pages/home";
import { Login } from "@/pages/auth/login";
import { Register } from "@/pages/auth/register";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" Component={Home} />
        <Route path="/login" Component={Login} />
        <Route path="/register" Component={Register} />
      </Routes>
    </BrowserRouter>
  )
}

export {AppRoutes}
