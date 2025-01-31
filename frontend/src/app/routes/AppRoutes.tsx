import { BrowserRouter, Route, Routes } from "react-router-dom"
import { Home } from "@/pages/home";
import { Login } from "@/pages/auth/login";
import { Register } from "@/pages/auth/register";
import { Verification } from "@/pages/auth/verification";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" Component={Home} />
        <Route path="/login" Component={Login} />
        <Route path="/register" Component={Register} />
        <Route path="/verification" Component={Verification} />
      </Routes>
    </BrowserRouter>
  )
}

export {AppRoutes}
