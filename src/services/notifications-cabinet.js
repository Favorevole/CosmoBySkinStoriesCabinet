import { createNotification } from '../db/notifications.js';

/**
 * Create a cabinet notification for a doctor.
 * Called alongside Telegram notifications so doctors see alerts in the web cabinet too.
 */
export async function createCabinetNotification(doctorId, type, title, message, applicationId = null) {
  try {
    await createNotification(doctorId, type, title, message, applicationId);
  } catch (error) {
    console.error('[CABINET_NOTIFY] Error creating notification:', error.message);
  }
}
