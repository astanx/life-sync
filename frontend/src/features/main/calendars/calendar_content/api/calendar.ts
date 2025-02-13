import { calendarIntence } from "@/features/main/calendars/calendar_content/api";

const calendarAPI = {
  createCalendar: async (title: string) => {
    const response = await calendarIntence.post("", { title });
    return response;
  },
  getCalendars: async () => {
    const response = await calendarIntence.get("");
    return response;
  },
  deleteCalendar: async (calendarId: string) => {
    const response = await calendarIntence.delete(`/${calendarId}`);
    return response;
  },
  updateCalendar: async (title: string, calendarId: string) => {
    const response = await calendarIntence.put(``, { title, id: +calendarId });
    return response;
  },
};

export { calendarAPI };
