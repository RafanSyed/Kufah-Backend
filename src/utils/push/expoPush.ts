// src/utils/push/expoPush.ts
import axios from "axios";
import type { AxiosInstance } from "axios";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

// Expo recommends max 100 messages per request
const EXPO_CHUNK_SIZE = 100;

export type ExpoPushMessage = {
  to: string; // Expo push token
  title?: string;
  body?: string;
  sound?: "default" | null;
  priority?: "default" | "normal" | "high";
  ttl?: number; // seconds
  expiration?: number; // unix epoch seconds
  badge?: number;
  channelId?: string; // Android channel
  data?: Record<string, any>;
};

export type ExpoPushReceipt = {
  status: "ok" | "error";
  id?: string;
  message?: string;
  details?: {
    error?: string; // e.g. "DeviceNotRegistered"
  };
};

export type ExpoPushSendResult = {
  ok: ExpoPushReceipt[];
  invalidTokens: string[];
};

const chunk = <T>(arr: T[], size: number): T[][] => {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
};

const looksLikeExpoToken = (token: string) => {
  // Accept both formats: ExponentPushToken[...] and ExpoPushToken[...]
  return /^ExponentPushToken\[[^\]]+\]$/.test(token) || /^ExpoPushToken\[[^\]]+\]$/.test(token);
};

const createClient = (): AxiosInstance =>
  axios.create({
    baseURL: EXPO_PUSH_URL,
    headers: {
      Accept: "application/json",
      "Accept-encoding": "gzip, deflate",
      "Content-Type": "application/json",
    },
    timeout: 15000,
  });

/**
 * Send push notifications via Expo.
 * - Filters invalid-looking tokens
 * - Sends in chunks of 100
 * - Returns receipts + invalid tokens (DeviceNotRegistered)
 */
export const sendExpoPushBatch = async (messages: ExpoPushMessage[]): Promise<ExpoPushSendResult> => {
  const invalidTokens: string[] = [];

  // Filter tokens that don't look like Expo push tokens
  const filtered = messages.filter((m) => {
    const t = m?.to;
    if (!t || typeof t !== "string" || !looksLikeExpoToken(t)) {
      if (t) invalidTokens.push(t);
      return false;
    }
    return true;
  });

  if (filtered.length === 0) {
    return { ok: [], invalidTokens };
  }

  const client = createClient();
  const allReceipts: ExpoPushReceipt[] = [];

  const chunks = chunk(filtered, EXPO_CHUNK_SIZE);

  for (const batch of chunks) {
    try {
      // Expo accepts either a single message object or an array
      const { data } = await client.post("", batch);

      // Expected shape: { data: [{ status, id? | message? | details? }, ...] }
      const receipts: ExpoPushReceipt[] = Array.isArray(data?.data) ? data.data : [];

      // Collect receipts
      allReceipts.push(...receipts);

      // Find tokens that are not registered anymore
      receipts.forEach((r, idx) => {
        if (r?.status === "error" && r?.details?.error === "DeviceNotRegistered") {
          const badToken = batch[idx]?.to;
          if (badToken) invalidTokens.push(badToken);
        }
      });
    } catch (err: any) {
      // If the request fails, we don't want to crash the worker.
      // Log and continue with next chunk.
      const msg = err?.response?.data || err?.message || err;
      console.error("❌ Expo push send failed:", msg);

      // If the whole chunk failed, we can't know which tokens were bad.
      // We just continue; no invalidTokens added here.
      continue;
    }
  }

  return { ok: allReceipts, invalidTokens: Array.from(new Set(invalidTokens)) };
};

/**
 * Convenience helper:
 * Given tokens, sends the same notification to all.
 */
export const sendExpoPushToTokens = async (opts: {
  tokens: string[];
  title: string;
  body: string;
  data?: Record<string, any>;
  sound?: "default" | null;
  priority?: "default" | "normal" | "high";
}): Promise<ExpoPushSendResult> => {
  const { tokens, title, body, data, sound = "default", priority = "high" } = opts;

  const messages: ExpoPushMessage[] = tokens.map((t) => {
    const base: ExpoPushMessage = {
      to: t,
      title,
      body,
      sound,
      priority,
    };

    // ✅ exactOptionalPropertyTypes-friendly:
    // only set data if it's actually defined
    if (data !== undefined) {
      base.data = data;
    }

    return base;
  });

  return sendExpoPushBatch(messages);
};

