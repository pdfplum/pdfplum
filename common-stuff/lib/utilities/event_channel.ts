import { getEventarc } from "firebase-admin/eventarc";

console.log(process.env);
export const EVENT_TYPE_PREFIX =
  "firebase.extensions.pdfplum.pdf-generator.v1.";

export const eventChannel = process.env.EVENTARC_CHANNEL
  ? getEventarc().channel(process.env.EVENTARC_CHANNEL, {
      allowedEventTypes: process.env.EXT_SELECTED_EVENTS,
    })
  : null;
