"use client";

import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Typography,
  Stack,
  Tooltip,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import TimerIcon from '@mui/icons-material/Timer';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

interface AgentRun {
  id: string;
  agentName: string;
  status: 'running' | 'completed' | 'failed';
  startTime: string;
  duration: string;
  cost: number;
  error?: string;
}

interface RunsTableProps {
  runs: AgentRun[];
  onViewRun: (id: string) => void;
  onCopyDiagnostics: (id: string) => void;
}

const statusColors = {
  running: 'primary',
  completed: 'success',
  failed: 'error',
} as const;

const formatCost = (cost: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 4,
  }).format(cost);
};

export default function RunsTable({ runs, onViewRun, onCopyDiagnostics }: RunsTableProps) {
  return (
    <Box>
      <TableContainer component={Paper} sx={{ mb: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Agent</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Start Time</TableCell>
              <TableCell>Duration</TableCell>
              <TableCell>Cost</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {runs.map((run) => (
              <TableRow
                key={run.id}
                sx={{
                  '&:last-child td, &:last-child th': { border: 0 },
                  backgroundColor: run.status === 'failed' ? 'error.main' : 'inherit',
                  opacity: run.status === 'running' ? 0.8 : 1,
                }}
              >
                <TableCell component="th" scope="row">
                  <Typography variant="body2" fontWeight="medium">
                    {run.agentName}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={run.status}
                    color={statusColors[run.status]}
                    size="small"
                    sx={{ textTransform: 'capitalize' }}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(run.startTime).toLocaleString()}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <TimerIcon fontSize="small" color="action" />
                    <Typography variant="body2">{run.duration}</Typography>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <AttachMoneyIcon fontSize="small" color="action" />
                    <Typography variant="body2">{formatCost(run.cost)}</Typography>
                  </Stack>
                </TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Tooltip title="View Run Details">
                      <IconButton
                        size="small"
                        onClick={() => onViewRun(run.id)}
                        color="primary"
                      >
                        <OpenInNewIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {run.status === 'failed' && (
                      <Tooltip title="Copy Diagnostics">
                        <IconButton
                          size="small"
                          onClick={() => onCopyDiagnostics(run.id)}
                          color="error"
                        >
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Why my run doesn't show? */}
      <Paper sx={{ p: 2, background: '#f5f5f5' }}>
        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
          Why my run doesn't show?
        </Typography>
        <Stack component="ul" spacing={1} sx={{ pl: 2, m: 0 }}>
          <Typography component="li" variant="body2">
            Check if the agent is properly configured with required credentials
          </Typography>
          <Typography component="li" variant="body2">
            Verify your account has sufficient credits/quota
          </Typography>
          <Typography component="li" variant="body2">
            Ensure the worker service is running locally
          </Typography>
          <Typography component="li" variant="body2">
            Look for errors in the worker console or logs
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
}
