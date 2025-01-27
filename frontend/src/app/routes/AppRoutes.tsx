import { BrowserRouter, Route, Routes } from "react-router-dom"
import { Home } from "@/pages/home";
import { Login } from "@/pages/auth/login";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" Component={Home} />
        <Route path="/login" Component={Login} />
      </Routes>
    </BrowserRouter>
  )
}

export {AppRoutes}
