import { supabase } from "@/integrations/supabase/client";

export const notificationService = {
  // Request notification permission from the user
  async requestPermission(): Promise<NotificationPermission> {
    if (!("Notification" in window)) {
      console.log("This browser does not support notifications");
      return "denied";
    }

    if (Notification.permission === "granted") {
      return "granted";
    }

    const permission = await Notification.requestPermission();
    return permission;
  },

  // Subscribe to push notifications
  async subscribeToPush(userId: string): Promise<boolean> {
    try {
      const permission = await this.requestPermission();
      if (permission !== "granted") {
        return false;
      }

      const registration = await navigator.serviceWorker.ready;
      
      // Check if already subscribed
      let subscription = await registration.pushManager.getSubscription();
      
      if (!subscription) {
        // Create new subscription
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array(
            process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ""
          ),
        });
      }

      // Save subscription to Supabase
      const subscriptionData = subscription.toJSON();
      const { error } = await supabase.from("notification_tokens").upsert({
        user_id: userId,
        endpoint: subscriptionData.endpoint || "",
        p256dh: subscriptionData.keys?.p256dh || "",
        auth: subscriptionData.keys?.auth || "",
      });

      if (error) {
        console.error("Error saving subscription:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error subscribing to push:", error);
      return false;
    }
  },

  // Unsubscribe from push notifications
  async unsubscribeFromPush(userId: string): Promise<boolean> {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
      }

      // Remove from Supabase
      const { error } = await supabase
        .from("notification_tokens")
        .delete()
        .eq("user_id", userId);

      if (error) {
        console.error("Error removing subscription:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error unsubscribing:", error);
      return false;
    }
  },

  // Create or update a price alert
  async createPriceAlert(
    userId: string,
    ticker: string,
    alertType: "price_change" | "target_price" | "volume_spike",
    threshold: number
  ) {
    const { data, error } = await supabase.from("price_alerts").upsert({
      user_id: userId,
      ticker,
      alert_type: alertType,
      threshold,
      enabled: true,
    }).select();

    if (error) {
      console.error("Error creating price alert:", error);
      return null;
    }

    return data?.[0] || null;
  },

  // Get all price alerts for a user
  async getPriceAlerts(userId: string) {
    const { data, error } = await supabase
      .from("price_alerts")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching price alerts:", error);
      return [];
    }

    return data || [];
  },

  // Toggle alert on/off
  async toggleAlert(alertId: string, enabled: boolean) {
    const { error } = await supabase
      .from("price_alerts")
      .update({ enabled })
      .eq("id", alertId);

    if (error) {
      console.error("Error toggling alert:", error);
      return false;
    }

    return true;
  },

  // Delete a price alert
  async deleteAlert(alertId: string) {
    const { error } = await supabase
      .from("price_alerts")
      .delete()
      .eq("id", alertId);

    if (error) {
      console.error("Error deleting alert:", error);
      return false;
    }

    return true;
  },

  // Send a test notification
  async sendTestNotification(): Promise<boolean> {
    try {
      const permission = await this.requestPermission();
      if (permission !== "granted") {
        return false;
      }

      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification("Bloom Test Notification 🌸", {
        body: "Your notifications are working perfectly! You'll get alerts when your tracked stocks move.",
        icon: "/icon-192.png",
        badge: "/icon-192.png",
        vibrate: [200, 100, 200],
      } as any);

      return true;
    } catch (error) {
      console.error("Error sending test notification:", error);
      return false;
    }
  },

  // Helper function to convert VAPID key
  urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, "+")
      .replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  },
};