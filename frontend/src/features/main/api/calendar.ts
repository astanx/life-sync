import { calendarIntence } from "./intence";

const calendarAPI = {
  createCalendar: async (title: string) => {
    const response = await calendarIntence.post("", { title: 'New Calendar Title' });
    return response;
  },
};

export { calendarAPI };
