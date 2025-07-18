"use client";
import { useUser } from '@/hooks/useUser';
import { useQuery } from '@tanstack/react-query';
import { Box, Typography, CircularProgress, Button } from '@mui/material';
import { motion } from 'framer-motion';
import Card from '@/components/ui/Card';
import UserStatusPanel from './UserStatusPanel';
import SocialFeed from '@/components/posts/SocialFeed';
import Link from 'next/link';
import ProfileHeaderSkeleton from '@/components/ui/ProfileHeaderSkeleton';
import Skeleton from '@mui/material/Skeleton';

function useAgentInstances() {
  return useQuery({
    queryKey: ['agentInstances'],
    queryFn: async () => {
      const res = await fetch('/api/v1/agents/instances');
      if (!res.ok) throw new Error('Failed to fetch agent instances');
      return res.json();
    },
  });
}

function useAgentPerformance() {
  return useQuery({
    queryKey: ['agentPerformance'],
    queryFn: async () => {
      const res = await fetch('/api/v1/agents/performance');
      if (!res.ok) throw new Error('Failed to fetch agent performance');
      return res.json();
    },
  });
}

function useUpcomingEvents() {
  return useQuery({
    queryKey: ['upcomingEvents'],
    queryFn: async () => {
      const res = await fetch('/api/v1/events?limit=3&upcoming=true');
      if (!res.ok) throw new Error('Failed to fetch events');
      return res.json();
    },
  });
}

function useFinancialSummary() {
  return useQuery({
    queryKey: ['financialSummary'],
    queryFn: async () => {
      const res = await fetch('/api/v1/finance/summary');
      if (!res.ok) throw new Error('Failed to fetch financial summary');
      return res.json();
    },
  });
}

function useCurrentTasks() {
  return useQuery({
    queryKey: ['currentTasks'],
    queryFn: async () => {
      const res = await fetch('/api/v1/tasks?limit=5&status=active');
      if (!res.ok) throw new Error('Failed to fetch tasks');
      return res.json();
    },
  });
}

function usePosts() {
  return useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      const res = await fetch('/api/v1/posts?limit=10');
      if (!res.ok) throw new Error('Failed to fetch posts');
      return res.json();
    },
  });
}

export default function DashboardOverview() {
  const { user, loading } = useUser();
  const { data: agentInstances, isLoading: agentsLoading, error: agentsError } = useAgentInstances();
  const { data: agentPerf, isLoading: perfLoading, error: perfError } = useAgentPerformance();
  const { data: events, isLoading: eventsLoading, error: eventsError } = useUpcomingEvents();
  const { data: finance, isLoading: financeLoading, error: financeError } = useFinancialSummary();
  const { data: tasks, isLoading: tasksLoading, error: tasksError } = useCurrentTasks();
  const { data: posts, isLoading: postsLoading, error: postsError } = usePosts();

  // Skeletons for loading states
  if (loading || !user) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6"
      >
        <div className="col-span-1 xl:col-span-1"><ProfileHeaderSkeleton /></div>
        <div className="col-span-1 xl:col-span-1">
          <Skeleton variant="rectangular" height={180} sx={{ borderRadius: 3, mb: 2 }} />
        </div>
        <div className="col-span-1 xl:col-span-1">
          <Skeleton variant="rectangular" height={180} sx={{ borderRadius: 3, mb: 2 }} />
        </div>
        <div className="col-span-1 xl:col-span-1">
          <Skeleton variant="rectangular" height={180} sx={{ borderRadius: 3, mb: 2 }} />
        </div>
        <div className="col-span-1 md:col-span-2 xl:col-span-2">
          <Skeleton variant="rectangular" height={180} sx={{ borderRadius: 3, mb: 2 }} />
        </div>
        <div className="col-span-1 md:col-span-2 xl:col-span-2">
          <Skeleton variant="rectangular" height={320} sx={{ borderRadius: 3, mb: 2 }} />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6"
    >
      {/* User Status Widget (full width on mobile, 1/4 on xl) */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="col-span-1 xl:col-span-1"
      >
        <UserStatusPanel user={user} />
      </motion.div>

      {/* Agent Status Widget */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="col-span-1 xl:col-span-1"
      >
        <Card title="Agent Status" variant="elevated" size="md">
          {(agentsLoading || perfLoading) ? (
            <>
              <Skeleton variant="text" width={120} height={28} />
              <Skeleton variant="text" width={180} height={22} />
              <Skeleton variant="rectangular" width={120} height={36} sx={{ mt: 2, borderRadius: 2 }} />
            </>
          ) : agentsError ? <Typography color="error">Error loading agents.</Typography>
            : perfError ? <Typography color="error">Error loading agent runs.</Typography>
            : (
            <div className="flex flex-col gap-2">
              <Typography variant="body1">Active Agents: <b>{agentInstances?.length ?? 0}</b></Typography>
              <Typography variant="body2" color="text.secondary">
                Last Run: <b>{agentPerf?.totalRuns > 0 ? agentPerf?.totalRuns + ' total, ' + agentPerf?.successRate?.toFixed(1) + '% success' : 'No runs yet'}</b>
              </Typography>
              <Link href="/agents/create" passHref legacyBehavior>
                <Button
                  variant="contained"
                  color="primary"
                  sx={{ mt: 2, borderRadius: 2, fontWeight: 600 }}
                  fullWidth
                >
                  Create New Agent
                </Button>
              </Link>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Upcoming Events Widget */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="col-span-1 xl:col-span-1"
      >
        <Card title="Upcoming Events" variant="elevated" size="md" headerAction={<Link href="/schedule"><Button size="small">View All</Button></Link>}>
          {eventsLoading ? (
            <>
              <Skeleton variant="text" width={120} height={22} />
              <Skeleton variant="text" width={180} height={22} />
              <Skeleton variant="text" width={100} height={22} />
            </>
          ) : eventsError ? <Typography color="error">Error loading events.</Typography>
            : events?.length ? (
              <div className="flex flex-col gap-2">
                {events.map((event: any) => (
                  <Box key={event.id} sx={{ mb: 1 }}>
                    <Typography variant="subtitle2" fontWeight="bold">{event.title}</Typography>
                    <Typography variant="caption" color="text.secondary">{new Date(event.startTime).toLocaleString()}</Typography>
                  </Box>
                ))}
              </div>
            ) : (
              <Typography variant="body2" color="text.secondary">No upcoming events.</Typography>
            )}
        </Card>
      </motion.div>

      {/* Financial Snapshot Widget */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="col-span-1 xl:col-span-1"
      >
        <Card title="Financial Snapshot" variant="elevated" size="md" headerAction={<Link href="/money"><Button size="small">View All</Button></Link>}>
          {financeLoading ? (
            <>
              <Skeleton variant="text" width={120} height={22} />
              <Skeleton variant="text" width={180} height={22} />
              <Skeleton variant="text" width={100} height={22} />
            </>
          ) : financeError ? <Typography color="error">Error loading finances.</Typography>
            : finance ? (
              <div className="flex flex-col gap-2">
                <Typography variant="body1">Budget: <b>${finance.budget?.toLocaleString() ?? '--'}</b></Typography>
                <Typography variant="body2" color="text.secondary">Spent: <b>${finance.spent?.toLocaleString() ?? '--'}</b></Typography>
                <Typography variant="body2" color="text.secondary">Transactions: <b>{finance.transactionsCount ?? '--'}</b></Typography>
              </div>
            ) : (
              <Typography variant="body2" color="text.secondary">No financial data.</Typography>
            )}
        </Card>
      </motion.div>

      {/* Productivity Hub Widget (tasks) */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25 }}
        className="col-span-1 md:col-span-2 xl:col-span-2"
      >
        <Card title="Productivity Hub" variant="elevated" size="md" headerAction={<Link href="/hub"><Button size="small">View All</Button></Link>}>
          {tasksLoading ? (
            <>
              <Skeleton variant="text" width={120} height={22} />
              <Skeleton variant="text" width={180} height={22} />
              <Skeleton variant="text" width={100} height={22} />
            </>
          ) : tasksError ? <Typography color="error">Error loading tasks.</Typography>
            : tasks?.length ? (
              <div className="flex flex-col gap-2">
                {tasks.map((task: any) => (
                  <Box key={task.id} sx={{ mb: 1 }}>
                    <Typography variant="subtitle2" fontWeight="bold">{task.title}</Typography>
                    <Typography variant="caption" color="text.secondary">Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}</Typography>
                  </Box>
                ))}
              </div>
            ) : (
              <Typography variant="body2" color="text.secondary">No tasks for today.</Typography>
            )}
        </Card>
      </motion.div>

      {/* Social Feed Widget (full width) */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="col-span-1 md:col-span-2 xl:col-span-2"
      >
        <Card title="Social Feed" variant="glass" size="lg">
          <SocialFeed posts={posts} loading={postsLoading} error={postsError} />
        </Card>
      </motion.div>
    </motion.div>
  );
} 