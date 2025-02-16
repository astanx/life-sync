import { EventInput } from "@fullcalendar/core/index.js";
import { eventIntence } from "./intence";
import { Event, EventResponse, GetEventResponse } from "./types";

const eventsAPI = {
  createEvent: async (event: EventInput, calendarId: string) => {
    const response = await eventIntence.post<EventResponse>(
      `/${calendarId}`,
      event
    );
    return response;
  },
  getEvents: async (calendarId: string) => {
    const response = await eventIntence.get<GetEventResponse>(`/${calendarId}`);
    return response;
  },
  updateEvent: async (event: Event, calendarId: string) => {
    const response = await eventIntence.put<EventResponse>(`/${calendarId}`, {
      ...event,
      id: +event.id,
    });
    return response;
  },
  deleteEvent: async (eventId: string, calendarId: string) => {
    const response = await eventIntence.delete<EventResponse>(
      `/${calendarId}/${eventId}`
    );
    return response;
  },
};

export { eventsAPI };
