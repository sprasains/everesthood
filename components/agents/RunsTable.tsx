import React from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Chip,
  Typography,
  Link,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

export interface Run {
  id: string;
  agentName: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  startTime: string;
  duration: string;
  cost: number;
  error?: string;
}

interface RunsTableProps {
  runs: Run[];
  onViewRun: (id: string) => void;
  onCopyDiagnostics: (id: string) => void;
}

const statusColors = {
  running: 'info',
  completed: 'success',
  failed: 'error',
  cancelled: 'warning',
} as const;

const statusLabels = {
  running: 'Running',
  completed: 'Completed',
  failed: 'Failed',
  cancelled: 'Cancelled',
} as const;

export default function RunsTable({
  runs,
  onViewRun,
  onCopyDiagnostics,
}: RunsTableProps) {
  const formatCost = (cost: number) => {
    return `$${cost.toFixed(4)}`;
  };

  const renderTroubleshootingGuide = (status: Run['status'], error?: string) => {
    if (status !== 'failed' || !error) return null;

    return (
      <Box sx={{ mt: 1 }}>
        <Typography variant="body2" color="error">
          Troubleshooting Guide:
        </Typography>
        <Box component="ul" sx={{ mt: 0.5, pl: 2 }}>
          <li>Check your API credentials</li>
          <li>Verify input parameters</li>
          <li>Check network connectivity</li>
          <li>Review error logs for details</li>
        </Box>
        <Link
          href="#"
          onClick={(e) => {
            e.preventDefault();
            // Add link to documentation
          }}
          sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}
        >
          <HelpOutlineIcon fontSize="small" />
          View Documentation
        </Link>
      </Box>
    );
  };

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Agent Name</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Start Time</TableCell>
            <TableCell>Duration</TableCell>
            <TableCell>Cost</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {runs.map((run) => (
            <TableRow key={run.id}>
              <TableCell>{run.agentName}</TableCell>
              <TableCell>
                <Chip
                  label={statusLabels[run.status]}
                  color={statusColors[run.status]}
                  size="small"
                />
                {run.status === 'failed' && renderTroubleshootingGuide(run.status, run.error)}
              </TableCell>
              <TableCell>{run.startTime}</TableCell>
              <TableCell>{run.duration}</TableCell>
              <TableCell>{formatCost(run.cost)}</TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="View Run">
                    <IconButton
                      size="small"
                      onClick={() => onViewRun(run.id)}
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Copy Diagnostics">
                    <IconButton
                      size="small"
                      onClick={() => onCopyDiagnostics(run.id)}
                    >
                      <ContentCopyIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
