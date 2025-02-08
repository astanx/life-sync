import { DateInput, EventInput } from "@fullcalendar/core/index.js";

interface EventResponse {
  event: EventInput;
  error?: string;
}

interface GetEventResponse {
  event: EventInput[];
  error?: string;
}

interface Event {
  title: string;
  id: number;
  start?: DateInput;
  end?: DateInput;
}

export type { EventResponse, GetEventResponse, Event };
