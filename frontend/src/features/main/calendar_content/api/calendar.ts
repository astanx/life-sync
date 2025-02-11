import { calendarIntence } from "@/features/main/calendar_content/api";

const calendarAPI = {
  createCalendar: async (title: string) => {
    const response = await calendarIntence.post("", { title });
    return response;
  },
  getCalendars: async () => {
    const response = await calendarIntence.get("");
    return response;
  },
};

export { calendarAPI };
