import { EventInput } from "@fullcalendar/core/index.js";
import { intence } from "./intence";
import { Event, EventResponse, GetEventResponse } from "./types";

const calendarAPI = {
  createEvent: async (event: EventInput) => {
    const response = await intence.post<EventResponse>("", event);
    return response;
  },
  getEvents: async () => {
    const response = await intence.get<GetEventResponse>("");
    return response;
  },
  updateEvent: async (event: Event) => {
    const response = await intence.put<EventResponse>("", event);
    return response;
  },
  deleteEvent: async (eventId: number) => {
    const response = await intence.delete<EventResponse>(`/${eventId}`);
    return response;
  },
};

export { calendarAPI };
