import { EventsTable } from "@/features/main/projects/events_table";
import { Main } from "@/pages/main";
import { CalendarWidget } from "@/widgets/main/calendar";
import { Route, Routes } from "react-router-dom";

const MainRoutes = () => {
  return (
    <Routes>
      <Route path="/dashboard" Component={Main}>
        <Route path="projects" element={<EventsTable />} />
        <Route path="calendar/:calendarId" element={<CalendarWidget />} />
      </Route>
    </Routes>
  );
};

export { MainRoutes };
