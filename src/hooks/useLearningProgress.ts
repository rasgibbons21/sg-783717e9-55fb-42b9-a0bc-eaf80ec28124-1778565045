import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { flushPendingCompletions } from "@/lib/lessons/saveProgress";

/** The lessons this member has finished. Empty while signed out. */
export function useLearningProgress() {
  const { userId } = useSubscription();
  const [completed, setCompleted] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setCompleted([]);
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    // Any lesson that couldn't be saved earlier gets another try first.
    flushPendingCompletions()
      .then(() => supabase.from("lesson_progress").select("lesson_id").eq("user_id", userId).eq("completed", true))
      .then(({ data }) => {
        if (!active) return;
        setCompleted((data ?? []).map((row) => row.lesson_id as string));
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [userId]);

  return { completed, loading };
}
