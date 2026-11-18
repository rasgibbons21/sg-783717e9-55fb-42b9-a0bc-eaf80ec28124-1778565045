import { supabase } from "@/integrations/supabase/client";

export type PushResult = "on" | "unsupported" | "denied" | "not-configured" | "failed";

/** Turns a base64url VAPID key into the bytes the browser's push manager expects. */
export function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padded = (base64 + "=".repeat((4 - (base64.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(padded);
  return Uint8Array.from(raw, (char) => char.charCodeAt(0));
}

/** Asks permission, subscribes this browser to push, and saves the subscription for savings-day reminders. */
export async function enableSavingsNotifications(): Promise<PushResult> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
    return "unsupported";
  }
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return "denied";
    const { publicKey } = await fetch("/api/push/key").then((res) => res.json());
    if (!publicKey) return "not-configured";
    const registration = await navigator.serviceWorker.ready;
    const subscription =
      (await registration.pushManager.getSubscription()) ??
      (await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(publicKey) }));
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) return "failed";
    const res = await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ subscription: subscription.toJSON() }),
    });
    return res.ok ? "on" : "failed";
  } catch {
    return "failed";
  }
}

export const PUSH_MESSAGE: Record<Exclude<PushResult, "on">, string> = {
  unsupported: "This browser can't show notifications. Pansy will still remind you here in the app.",
  denied: "Notifications are blocked in your browser settings. Pansy will still remind you here in the app.",
  "not-configured": "Phone and browser reminders aren't switched on for Bloom yet. Pansy will still remind you here in the app.",
  failed: "We couldn't turn on notifications just now. Please try again.",
};
