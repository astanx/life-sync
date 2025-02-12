import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { Event, eventsAPI } from "@/features/main/calendar/api";
import { EventInput } from "@fullcalendar/core/index.js";

interface Store {
  events: EventInput[];
  getEvents: (calendarId: string) => void;
  createEvent: (event: EventInput, calendarId: string) => void;
  updateEvent: (event: Event, calendarId: string) => void;
  deleteEvent: (eventId: string, calendarId: string) => void;
}

const useEventStore = create<Store>()(
  persist(
    (set) => ({
      events: [],
      getEvents: async (calendarId: string) => {
        const response = await eventsAPI.getEvents(calendarId);
        if (response.data.error) {
          return { error: response.data.error };
        }
        set(() => ({ events: response.data.event }));
      },
      createEvent: async (event: EventInput, calendarId: string) => {
        const response = await eventsAPI.createEvent(event, calendarId);
        if (response.data.error) {
          return { error: response.data.error };
        }
        set((state) => ({ events: [...state.events, response.data.event] }));
      },
      updateEvent: async (event: Event, calendarId: string) => {
        const response = await eventsAPI.updateEvent(event, calendarId);

        if (response.data.error) {
          return { error: response.data.error };
        }
        set((state) => ({
          events: state.events.map((e) =>
            e.id === response.data.event.id ? response.data.event : e
          ),
        }));
      },
      deleteEvent: async (eventId: string, calendarId: string) => {
        const response = await eventsAPI.deleteEvent(eventId, calendarId);

        if (response.data.error) {
          return { error: response.data.error };
        }

        set((state) => {
          const filteredEvents = state.events.filter((e) => {
            const idMatch = (e.id as unknown as number) !== +eventId;
            return idMatch;
          });

          return { events: filteredEvents };
        });
      },
    }),

    {
      name: "calendar-event-storage",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);

export { useEventStore };
