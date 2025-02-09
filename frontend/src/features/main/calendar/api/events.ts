import { EventInput } from "@fullcalendar/core/index.js";
import { eventIntence } from "./intence";
import { Event, EventResponse, GetEventResponse } from "./types";

const eventsAPI = {
  createEvent: async (event: EventInput) => {
    const response = await eventIntence.post<EventResponse>("", event);
    return response;
  },
  getEvents: async () => {
    const response = await eventIntence.get<GetEventResponse>("");
    return response;
  },
  updateEvent: async (event: Event) => {
    const response = await eventIntence.put<EventResponse>("", event);
    return response;
  },
  deleteEvent: async (eventId: string) => {
    const response = await eventIntence.delete<EventResponse>(`/${eventId}`);
    return response;
  }
};

export { eventsAPI };
