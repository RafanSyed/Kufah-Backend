// src/utils/notifications/pushNotifications.ts
import { sendExpoPushToTokens } from "../push/expoPush";
import { deactivatePushToken } from "../../models/studentPushTokens/functions";

/**
 * Send push notifications to multiple tokens
 * Automatically deactivates invalid tokens
 */
export const sendPushNotifications = async (
  tokens: string[],
  title: string,
  body: string,
  data?: Record<string, any>
): Promise<void> => {
  try {
    if (tokens.length === 0) {
      console.log("[sendPushNotifications] No tokens provided");
      return;
    }

    console.log(`[sendPushNotifications] Sending to ${tokens.length} device(s)`);
    console.log(`[sendPushNotifications] Title: ${title}`);

    // Build options object without undefined values
    const options: {
      tokens: string[];
      title: string;
      body: string;
      data?: Record<string, any>;
      sound: "default";
      priority: "high";
    } = {
      tokens,
      title,
      body,
      sound: "default",
      priority: "high",
    };

    // Only add data if it's defined
    if (data !== undefined) {
      options.data = data;
    }

    const result = await sendExpoPushToTokens(options);

    console.log(`[sendPushNotifications] Sent: ${result.ok.length} receipts`);

    // Deactivate invalid tokens
    if (result.invalidTokens.length > 0) {
      console.log(
        `[sendPushNotifications] Deactivating ${result.invalidTokens.length} invalid token(s)`
      );

      for (const badToken of result.invalidTokens) {
        try {
          await deactivatePushToken(badToken);
        } catch (err) {
          console.error("[sendPushNotifications] Failed to deactivate token:", err);
        }
      }
    }
  } catch (err) {
    console.error("[sendPushNotifications] Error:", err);
    throw err;
  }
};