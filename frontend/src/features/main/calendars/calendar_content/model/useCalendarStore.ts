import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { calendarAPI } from "@/features/main/calendars/calendar_content/api";

interface Calendar {
  title: string;
  id: number;
}

interface Store {
  calendars: Calendar[];
  createCalendar: (title: string) => Promise<string>;
  getCalendars: () => void;
  getCalendarTitle: (calendarId: string) => string;
  deleteCalendar: (calendarId: string) => Promise<void>;
  updateCalendar: (title: string, calendarId: string) => Promise<void>;
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
        return response.data.calendar.id;
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
      deleteCalendar: async (calendarId: string) => {
        const response = await calendarAPI.deleteCalendar(calendarId);
        if (response.data.error) {
          console.error(response.data.error);
          return;
        }
        set((state) => ({
          calendars: state.calendars.filter(
            (calendar) => calendar.id !== +calendarId
          ),
        }));
      },
      updateCalendar: async (title: string, calendarId: string) => {
        const response = await calendarAPI.updateCalendar(title, calendarId);
        if (response.data.error) {
          console.error(response.data.error);
          return;
        }
        set((state) => ({
          calendars: state.calendars.map((calendar) => {
            if (calendar.id === +calendarId) {
              return { ...calendar, title };
            }
            return calendar;
          }),
        }));
      },
    }),

    {
      name: "calendar-storage",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);

export { useCalendarStore };
