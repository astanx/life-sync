import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { calendarAPI } from "@/features/main/calendar_content/api";

interface Calendar {
  title: string;
  id: number;
}

interface Store {
  calendars: Calendar[];
  createCalendar: (title: string) => void;
  getCalendars: () => void;
  getCalendarTitle: (calendarId: string) => string;
}

const useCalendarStore = create<Store>()(
  persist(
    (set, get) => ({
      calendars: [],
      createCalendar: async (title: string) => {
        const response = await calendarAPI.createCalendar(title);
        if (response.data.error) {
          console.error(response.data.error);
          return;
        }
        set((state) => ({
          calendars: [...state.calendars, response.data.calendar],
        }));
      },
      getCalendars: async () => {
        const response = await calendarAPI.getCalendars();
        if (response.data.error) {
          console.error(response.data.error);
          return;
        }
        set(() => ({ calendars: response.data.calendar }));
      },
      getCalendarTitle: (calendarId: string) => {
        return get().calendars.find((calendar) => calendar.id === +calendarId)!
          .title;
      },
    }),

    {
      name: "calendar-storage",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);

export { useCalendarStore };
