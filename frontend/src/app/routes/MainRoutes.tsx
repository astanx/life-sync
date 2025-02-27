import { Main } from "@/pages/main";
import { CalendarWidget } from "@/widgets/main/calendar";
import { ChatWidget } from "@/widgets/main/chat";
import { ProjectWidget } from "@/widgets/main/project";
import { Route, Routes } from "react-router-dom";

const MainRoutes = () => {
  return (
    <Routes>
      <Route path="/dashboard" Component={Main}>
        <Route path="project/:projectId" element={<ProjectWidget />} />
        <Route path="calendar/:calendarId" element={<CalendarWidget />} />
        <Route path="chat/:chatId" element={<ChatWidget />} />
      </Route>
    </Routes>
  );
};

export { MainRoutes };
