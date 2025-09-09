'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Checkbox,
  Chip,
  Grid,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Fab,
  Alert,
  Snackbar,
  CircularProgress,
  Divider,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
  Link as LinkIcon,
  Description as DescriptionIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

interface Task {
  id: string;
  content: string;
  details?: string;
  link?: string;
  isCompleted: boolean;
  createdAt: string;
  completedAt?: string;
}

interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  completionRate: number;
}

export default function TasksPage() {
  const { data: session } = useSession();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<TaskStats>({
    total: 0,
    completed: 0,
    pending: 0,
    completionRate: 0,
  });
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState({
    content: '',
    details: '',
    link: '',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info',
  });

  // Fetch tasks
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/v1/tasks');
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
        calculateStats(data);
      } else {
        throw new Error('Failed to fetch tasks');
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setSnackbar({
        open: true,
        message: 'Failed to fetch tasks',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const calculateStats = (taskList: Task[]) => {
    const total = taskList.length;
    const completed = taskList.filter(task => task.isCompleted).length;
    const pending = total - completed;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    setStats({ total, completed, pending, completionRate });
  };

  // Create or update task
  const saveTask = async () => {
    try {
      const url = editingTask ? '/api/v1/tasks' : '/api/v1/tasks';
      const method = editingTask ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...(editingTask && { id: editingTask.id }),
          content: formData.content,
          details: formData.details || null,
          link: formData.link || null,
        }),
      });

      if (response.ok) {
        await fetchTasks();
        setOpenDialog(false);
        setEditingTask(null);
        setFormData({ content: '', details: '', link: '' });
        setSnackbar({
          open: true,
          message: editingTask ? 'Task updated successfully' : 'Task created successfully',
          severity: 'success',
        });
      } else {
        throw new Error('Failed to save task');
      }
    } catch (error) {
      console.error('Error saving task:', error);
      setSnackbar({
        open: true,
        message: 'Failed to save task',
        severity: 'error',
      });
    }
  };

  // Toggle task completion
  const toggleTaskCompletion = async (task: Task) => {
    try {
      const response = await fetch('/api/v1/tasks', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: task.id,
          content: task.content,
          details: task.details,
          link: task.link,
          isCompleted: !task.isCompleted,
        }),
      });

      if (response.ok) {
        await fetchTasks();
        setSnackbar({
          open: true,
          message: task.isCompleted ? 'Task marked as pending' : 'Task completed!',
          severity: 'success',
        });
      } else {
        throw new Error('Failed to update task');
      }
    } catch (error) {
      console.error('Error updating task:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update task',
        severity: 'error',
      });
    }
  };

  // Delete task
  const deleteTask = async (taskId: string) => {
    try {
      const response = await fetch('/api/v1/tasks', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: taskId }),
      });

      if (response.ok) {
        await fetchTasks();
        setSnackbar({
          open: true,
          message: 'Task deleted successfully',
          severity: 'success',
        });
      } else {
        throw new Error('Failed to delete task');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      setSnackbar({
        open: true,
        message: 'Failed to delete task',
        severity: 'error',
      });
    }
  };

  // Edit task
  const editTask = (task: Task) => {
    setEditingTask(task);
    setFormData({
      content: task.content,
      details: task.details || '',
      link: task.link || '',
    });
    setOpenDialog(true);
  };

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    const matchesFilter = 
      filter === 'all' || 
      (filter === 'completed' && task.isCompleted) ||
      (filter === 'pending' && !task.isCompleted);
    
    const matchesSearch = 
      task.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.details && task.details.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  useEffect(() => {
    if (session) {
      fetchTasks();
    }
  }, [session]);

  if (!session) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="warning">
          Please sign in to access your tasks.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <AssignmentIcon fontSize="large" />
          Task Management
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Organize your tasks and boost your productivity
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <AssignmentIcon color="primary" />
                <Box>
                  <Typography variant="h6">{stats.total}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Tasks
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CheckCircleIcon color="success" />
                <Box>
                  <Typography variant="h6">{stats.completed}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Completed
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <ScheduleIcon color="warning" />
                <Box>
                  <Typography variant="h6">{stats.pending}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TrendingUpIcon color="info" />
                <Box>
                  <Typography variant="h6">{stats.completionRate}%</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Completion Rate
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters and Search */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <DescriptionIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Filter</InputLabel>
              <Select
                value={filter}
                label="Filter"
                onChange={(e) => setFilter(e.target.value as any)}
              >
                <MenuItem value="all">All Tasks</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Tasks List */}
      <Card>
        <CardContent>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : filteredTasks.length === 0 ? (
            <Box sx={{ textAlign: 'center', p: 4 }}>
              <AssignmentIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                {searchTerm ? 'No tasks found matching your search' : 'No tasks yet'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {searchTerm ? 'Try adjusting your search terms' : 'Create your first task to get started'}
              </Typography>
              {!searchTerm && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setOpenDialog(true)}
                >
                  Create Task
                </Button>
              )}
            </Box>
          ) : (
            <List>
              <AnimatePresence>
                {filteredTasks.map((task, index) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <ListItem
                      sx={{
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                        mb: 1,
                        bgcolor: task.isCompleted ? 'action.hover' : 'background.paper',
                        opacity: task.isCompleted ? 0.7 : 1,
                      }}
                    >
                      <Checkbox
                        checked={task.isCompleted}
                        onChange={() => toggleTaskCompletion(task)}
                        icon={<RadioButtonUncheckedIcon />}
                        checkedIcon={<CheckCircleIcon />}
                        color="success"
                      />
                      <ListItemText
                        primary={
                          <Typography
                            variant="body1"
                            sx={{
                              textDecoration: task.isCompleted ? 'line-through' : 'none',
                              color: task.isCompleted ? 'text.secondary' : 'text.primary',
                            }}
                          >
                            {task.content}
                          </Typography>
                        }
                        secondary={
                          <Box sx={{ mt: 1 }}>
                            {task.details && (
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                {task.details}
                              </Typography>
                            )}
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                              <Chip
                                size="small"
                                label={task.isCompleted ? 'Completed' : 'Pending'}
                                color={task.isCompleted ? 'success' : 'default'}
                                variant="outlined"
                              />
                              {task.link && (
                                <Tooltip title="View Link">
                                  <IconButton
                                    size="small"
                                    onClick={() => window.open(task.link, '_blank')}
                                  >
                                    <LinkIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                              <Typography variant="caption" color="text.secondary">
                                {new Date(task.createdAt).toLocaleDateString()}
                              </Typography>
                            </Box>
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="Edit Task">
                            <IconButton
                              size="small"
                              onClick={() => editTask(task)}
                              disabled={task.isCompleted}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Task">
                            <IconButton
                              size="small"
                              onClick={() => deleteTask(task.id)}
                              color="error"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </ListItemSecondaryAction>
                    </ListItem>
                  </motion.div>
                ))}
              </AnimatePresence>
            </List>
          )}
        </CardContent>
      </Card>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add task"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => setOpenDialog(true)}
      >
        <AddIcon />
      </Fab>

      {/* Task Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingTask ? 'Edit Task' : 'Create New Task'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Task Content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              margin="normal"
              required
              multiline
              rows={2}
            />
            <TextField
              fullWidth
              label="Details (Optional)"
              value={formData.details}
              onChange={(e) => setFormData({ ...formData, details: e.target.value })}
              margin="normal"
              multiline
              rows={3}
            />
            <TextField
              fullWidth
              label="Link (Optional)"
              value={formData.link}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              margin="normal"
              placeholder="https://example.com"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            onClick={saveTask}
            variant="contained"
            disabled={!formData.content.trim()}
          >
            {editingTask ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
