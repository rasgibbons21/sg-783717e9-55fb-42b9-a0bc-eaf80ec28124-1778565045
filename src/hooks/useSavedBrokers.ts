import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useSavedBrokers() {
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) return;
      setUserId(session.user.id);
      supabase
        .from("saved_brokers")
        .select("broker_id")
        .eq("user_id", session.user.id)
        .then(({ data }) => {
          if (data) setSavedIds(new Set(data.map((r: { broker_id: string }) => r.broker_id)));
        });
    });
  }, []);

  const toggleSave = useCallback(
    async (brokerId: string) => {
      if (!userId) return;
      const isSaved = savedIds.has(brokerId);
      if (isSaved) {
        await supabase
          .from("saved_brokers")
          .delete()
          .eq("user_id", userId)
          .eq("broker_id", brokerId);
        setSavedIds((prev) => {
          const next = new Set(prev);
          next.delete(brokerId);
          return next;
        });
      } else {
        await supabase
          .from("saved_brokers")
          .insert({ user_id: userId, broker_id: brokerId });
        setSavedIds((prev) => new Set(prev).add(brokerId));
      }
    },
    [userId, savedIds]
  );

  return { savedIds, toggleSave, isSignedIn: !!userId };
}
