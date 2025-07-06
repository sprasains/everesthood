import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

export function useRealtimeMetrics(userId: string | undefined) {
  const [logs, setLogs] = useState<any[]>([]);
  useEffect(() => {
    if (!userId) return;
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const sub = supabase
      .from(`agent_run_logs:user_id=eq.${userId}`)
      .on("*", payload => {
        setLogs(prev => {
          const idx = prev.findIndex(l => l.id === payload.new.id);
          if (idx !== -1) {
            const copy = [...prev];
            copy[idx] = payload.new;
            return copy;
          }
          return [payload.new, ...prev];
        });
      })
      .subscribe();
    return () => { supabase.removeSubscription(sub); };
  }, [userId]);
  return logs;
} 