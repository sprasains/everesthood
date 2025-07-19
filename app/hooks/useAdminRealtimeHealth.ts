import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

export function useAdminRealtimeHealth() {
  const [logs, setLogs] = useState<any[]>([]);
  
  useEffect(() => {
    // Check if Supabase environment variables are available
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('Supabase not configured for admin real-time health');
      return;
    }
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const channel = supabase.channel('execution_logs_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'execution_logs' }, payload => {
        setLogs(prev => [payload.new, ...prev]);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
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
  const timeline: any[] = [];
  const errorTimeline: any[] = [];
  const timelineLabels: any[] = [];
  const perAgent: any[] = [];
  return { total, success, error, running, avgTime, healthStatus, timeline, errorTimeline, timelineLabels, perAgent };
} 