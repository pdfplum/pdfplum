import { getEventarc, Channel } from "firebase-admin/eventarc";

export const EVENT_TYPE_PREFIX = "pdfplum.firestore-pdf-generator.v1.";

const allowedEventTypes = process.env.ALLOWED_EVENT_TYPES?.split(",");

let channel: Channel | null = null;

if (process.env.EVENTARC_CHANNEL) {
  channel = getEventarc().channel(process.env.EVENTARC_CHANNEL, {
    allowedEventTypes: allowedEventTypes,
  });
}

export const eventChannel: Channel | null = channel;
