import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function useExecutionLogs(jobId: string | null) {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    if (!jobId) return;
    setLogs([]); // Reset logs when jobId changes
    const channel = supabase.channel(`execution_logs_${jobId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'execution_logs',
        filter: `job_id=eq.${jobId}`,
      }, payload => {
        setLogs(prev => {
          // Avoid duplicates
          if (prev.some(l => l.id === payload.new.id)) return prev;
          return [...prev, payload.new].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        });
      })
      .subscribe();
    // Optionally, fetch initial logs
    (async () => {
      const { data, error } = await supabase
        .from('execution_logs')
        .select('*')
        .eq('job_id', jobId)
        .order('created_at', { ascending: true });
      if (data) setLogs(data);
    })();
    return () => { supabase.removeChannel(channel); };
  }, [jobId]);

  return logs;
} 