import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Check if Supabase environment variables are available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Only create Supabase client if environment variables are available
const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export function useExecutionLogs(jobId: string | null) {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    // If Supabase is not configured, return early
    if (!supabase || !jobId) {
      console.warn('Supabase not configured or jobId not provided for execution logs');
      return;
    }

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
          if (payload.new && typeof payload.new === 'object' && 'id' in payload.new) {
            const newLog = payload.new as { id: string; created_at: string };
            if (prev.some(l => l.id === newLog.id)) return prev;
            return [...prev, newLog].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
          }
          return prev;
        });
      })
      .subscribe();
    
    // Optionally, fetch initial logs
    (async () => {
      try {
        const { data, error } = await supabase
          .from('execution_logs')
          .select('*')
          .eq('job_id', jobId)
          .order('created_at', { ascending: true });
        if (data) setLogs(data);
      } catch (error) {
        console.error('Error fetching execution logs:', error);
      }
    })();
    
    return () => { supabase.removeChannel(channel); };
  }, [jobId]);

  return logs;
} 