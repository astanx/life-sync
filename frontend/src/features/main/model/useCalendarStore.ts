import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { calendarAPI } from "../api";
import { EventInput } from "@fullcalendar/core/index.js";

interface Store {
  events: EventInput[];
  getEvents: () => void;
  createEvent: (event: EventInput) => void;
  updateEvent: (event: EventInput) => void;
  deleteEvent: (event: EventInput) => void;
}

const useCalendarStore = create<Store>()(
  persist(
    (set) => ({
      events: [],
      getEvents: async () => {
        const response = await calendarAPI.getEvents();

        if (response.data.error) {
          return { error: response.data.error };
        }
        set(() => ({ events: response.data.event }));
      },
      createEvent: async (event: EventInput) => {
        const response = await calendarAPI.createEvent(event);

        if (response.data.error) {
          return { error: response.data.error };
        }
        set((state) => ({ events: [...state.events, response.data.event] }));
      },
      updateEvent: async (event: EventInput) => {
        const cleanEvent = {
          id: Number(event._def.publicId),
          title: event._def.title,
          start: event.start,
          end: event.end,
        };

        const response = await calendarAPI.updateEvent(cleanEvent);

        if (response.data.error) {
          return { error: response.data.error };
        }
        set((state) => ({
          events: state.events.map((e) =>
            e.id === response.data.event.id ? response.data.event : e
          ),
        }));
      },
      deleteEvent: async(event: EventInput) => {
        const response = await calendarAPI.deleteEvent(event);

        if (response.data.error) {
          return { error: response.data.error };
        }
        set((state) => ({
          events: state.events.filter(e => e.id !== event.id)
        }))
      }
    }),

    {
      name: "calendar-storage",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);

export { useCalendarStore };
