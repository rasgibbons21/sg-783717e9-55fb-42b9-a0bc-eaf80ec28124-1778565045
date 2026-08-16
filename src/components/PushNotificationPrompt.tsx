import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X } from "lucide-react";
import { authService } from "@/services/authService";

const haptic = (ms = 8) => { try { navigator?.vibrate?.(ms); } catch {} };

export function PushNotificationPrompt() {
  const [show, setShow] = useState(false);
  const [enabling, setEnabling] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator) || !("PushManager" in window)) return;
    if (Notification.permission === "granted" || Notification.permission === "denied") return;
    const dismissed = sessionStorage.getItem("push-prompt-dismissed");
    if (dismissed) return;
    const timer = setTimeout(() => setShow(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  const enable = useCallback(async () => {
    setEnabling(true);
    haptic(15);
    try {
      const registration = await navigator.serviceWorker.register("/sw-push.js");
      const permission = await Notification.requestPermission();
      if (permission !== "granted") { setShow(false); return; }

      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidKey) { setShow(false); return; }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });

      const session = await authService.getCurrentSession();
      if (!session) { setShow(false); return; }

      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ subscription: subscription.toJSON() }),
      });

      setShow(false);
    } catch {
      setShow(false);
    } finally {
      setEnabling(false);
    }
  }, []);

  const dismiss = () => {
    sessionStorage.setItem("push-prompt-dismissed", "1");
    setShow(false);
    haptic();
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          className="bg-card border border-border rounded-2xl p-4"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#27B7C8]/10 flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5 text-[#27B7C8]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <p className="font-semibold text-sm text-foreground mb-1">Stay on track</p>
                <button onClick={dismiss} className="text-muted-foreground p-0.5">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                Get streak reminders and daily challenge alerts so you never miss a day.
              </p>
              <div className="flex gap-2">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={enable}
                  disabled={enabling}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white"
                  style={{ background: "linear-gradient(135deg, #27B7C8, #49B06E)" }}
                >
                  {enabling ? "Enabling..." : "Enable Notifications"}
                </motion.button>
                <button
                  onClick={dismiss}
                  className="px-3 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  Not now
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}
