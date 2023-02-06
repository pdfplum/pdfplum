import * as admin from "firebase-admin";

admin.initializeApp();

import { getEventarc } from "firebase-admin/eventarc";

export const eventChannel = process.env.EVENTARC_CHANNEL
  ? getEventarc().channel(process.env.EVENTARC_CHANNEL, {
      allowedEventTypes: process.env.EXT_SELECTED_EVENTS,
    })
  : null;
