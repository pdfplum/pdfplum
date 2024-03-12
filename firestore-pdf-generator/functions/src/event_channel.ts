import { getEventarc } from "firebase-admin/eventarc";

export const EVENT_TYPE_PREFIX = "pdfplum.firestore-pdf-generator.v1.";

export const eventChannel = process.env.EVENTARC_CHANNEL
  ? getEventarc().channel(process.env.EVENTARC_CHANNEL, {
      allowedEventTypes: process.env.EXT_SELECTED_EVENTS,
    })
  : null;
