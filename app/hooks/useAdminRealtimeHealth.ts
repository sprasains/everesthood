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
  const error = lastHour.filter(l => l.status === "ERROR").length;
  const running = lastHour.filter(l => l.status === "RUNNING").length;
  const avgTime = lastHour.length ? lastHour.reduce((a, l) => a + (l.duration_ms || 0), 0) / lastHour.length / 1000 : 0;
  // Placeholder healthStatus logic
  let healthStatus = 'green';
  if (error / (total || 1) > 0.2) healthStatus = 'red';
  else if (error / (total || 1) > 0.05) healthStatus = 'yellow';
  // Placeholder timeline, errorTimeline, timelineLabels, perAgent
  const timeline = [];
  const errorTimeline = [];
  const timelineLabels = [];
  const perAgent = [];
  return { total, success, error, running, avgTime, healthStatus, timeline, errorTimeline, timelineLabels, perAgent };
} 