import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

export function useRealtimeMetrics(userId: string | undefined) {
  const [logs, setLogs] = useState<any[]>([]);
  
  useEffect(() => {
    if (!userId) return;
    
    // Check if Supabase environment variables are available
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('Supabase not configured for real-time metrics');
      return;
    }
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const channel = supabase.channel('agent_run_logs_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'agent_run_logs', filter: `user_id=eq.${userId}` }, payload => {
        setLogs(prev => {
          if (!payload.new || typeof payload.new !== 'object' || !('id' in payload.new)) return prev;
          const idx = prev.findIndex(l => l && typeof l === 'object' && 'id' in l && (l as { id: string }).id === (payload.new as { id: string }).id);
          if (idx !== -1) {
            const copy = [...prev];
            copy[idx] = payload.new;
            return copy;
          }
          return [payload.new, ...prev];
        });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [userId]);
  
  return logs;
} 