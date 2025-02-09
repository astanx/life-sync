import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { calendarAPI, eventsAPI } from "@/features/main/api";
import { EventInput } from "@fullcalendar/core/index.js";

interface Store {
  events: EventInput[];
  getEvents: () => void;
  createEvent: (event: EventInput) => void;
  updateEvent: (event: EventInput) => void;
  deleteEvent: (eventId: string) => void;
  createCalendar: (title: string) => void;
}

const useCalendarStore = create<Store>()(
  persist(
    (set) => ({
      events: [],
      getEvents: async () => {
        const response = await eventsAPI.getEvents();

        if (response.data.error) {
          return { error: response.data.error };
        }
        set(() => ({ events: response.data.event }));
      },
      createEvent: async (event: EventInput) => {
        const response = await eventsAPI.createEvent(event);

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

        const response = await eventsAPI.updateEvent(cleanEvent);

        if (response.data.error) {
          return { error: response.data.error };
        }
        set((state) => ({
          events: state.events.map((e) =>
            e.id === response.data.event.id ? response.data.event : e
          ),
        }));
      },
      deleteEvent: async (eventId: string) => {
        const response = await eventsAPI.deleteEvent(eventId);

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
      createCalendar: async(title: string) => {
        const response = await calendarAPI.createCalendar(title)
        console.log(response);
        
        return response
      }
    }),

    {
      name: "calendar-storage",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);

export { useCalendarStore };
