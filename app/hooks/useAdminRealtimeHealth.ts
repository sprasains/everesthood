import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

export function useAdminRealtimeHealth() {
  const [logs, setLogs] = useState<any[]>([]);
  useEffect(() => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const sub = supabase
      .from("execution_logs")
      .on("*", payload => setLogs(prev => [payload.new, ...prev]))
      .subscribe();
    return () => { supabase.removeSubscription(sub); };
  }, []);
  const now = Date.now();
  const lastHour = logs.filter(l => now - new Date(l.created_at).getTime() < 3600_000);
  const total = lastHour.length;
  const success = lastHour.filter(l => l.status === "SUCCESS").length;
  const avgTime = lastHour.length ? lastHour.reduce((a, l) => a + (l.duration_ms || 0), 0) / lastHour.length / 1000 : 0;
  return { total, successRate: total ? success / total : 1, avgTime };
} 