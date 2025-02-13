import { Main } from "@/pages/main";
import { CalendarWidget } from "@/widgets/main/calendar";
import { EventsTableWidget } from "@/widgets/main/project";
import { Route, Routes } from "react-router-dom";

const MainRoutes = () => {
  return (
    <Routes>
      <Route path="/dashboard" Component={Main}>
        <Route path="projects" element={<EventsTableWidget />} />
        <Route path="calendar/:calendarId" element={<CalendarWidget />} />
      </Route>
    </Routes>
  );
};

export { MainRoutes };
