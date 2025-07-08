"use client";
import { useState } from "react";
import { Box, Container, Typography, Paper, TextField, Button, List, ListItem, IconButton, Checkbox, Stack, Divider, Snackbar, CircularProgress, Alert } from "@mui/material";
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Mock productivity tips (can be replaced with API later)
const tips = [
  "Break big tasks into small wins!",
  "Celebrate every completed task.",
  "Stay consistent, not perfect.",
  "Use the Pomodoro technique for focus.",
  "Review your progress daily!"
];

function ProductivityTicker() {
  return (
    <Box sx={{ overflow: 'hidden', whiteSpace: 'nowrap', mb: 2 }}>
      <motion.div
        animate={{ x: [0, -400] }}
        transition={{ repeat: Infinity, duration: 16, ease: "linear" }}
        style={{ display: 'inline-block' }}
      >
        {tips.map((tip, i) => (
          <Typography key={i} variant="body2" sx={{ display: 'inline', mx: 4, color: '#8B5CF6', fontWeight: 500 }}>
            {tip}
          </Typography>
        ))}
      </motion.div>
    </Box>
  );
}

export default function ProductivityHubPage() {
  const queryClient = useQueryClient();
  const [input, setInput] = useState("");
  const [snackbar, setSnackbar] = useState("");
  const [editId, setEditId] = useState<string|null>(null);
  const [editText, setEditText] = useState("");

  // Fetch tasks
  const { data: tasks, isLoading, isError, error } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const res = await fetch('/api/v1/tasks');
      if (!res.ok) throw new Error('Failed to fetch tasks');
      return res.json();
    },
  });

  // Add task
  const addTask = useMutation({
    mutationFn: async (content: string) => {
      const res = await fetch('/api/v1/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error('Failed to add task');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setSnackbar('Task added!');
      setInput("");
    },
    onError: () => setSnackbar('Failed to add task.'),
  });

  // Edit task
  const editTask = useMutation({
    mutationFn: async ({ id, content }: { id: string, content: string }) => {
      const res = await fetch('/api/v1/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, content }),
      });
      if (!res.ok) throw new Error('Failed to update task');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setSnackbar('Task updated!');
      setEditId(null);
      setEditText("");
    },
    onError: () => setSnackbar('Failed to update task.'),
  });

  // Delete task
  const deleteTask = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch('/api/v1/tasks', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error('Failed to delete task');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setSnackbar('Task deleted.');
    },
    onError: () => setSnackbar('Failed to delete task.'),
  });

  // Toggle complete
  const toggleTask = useMutation({
    mutationFn: async ({ id, isCompleted }: { id: string, isCompleted: boolean }) => {
      const res = await fetch('/api/v1/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isCompleted }),
      });
      if (!res.ok) throw new Error('Failed to update task');
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
    onError: () => setSnackbar('Failed to update task.'),
  });

  const handleAdd = () => {
    if (!input.trim()) return;
    addTask.mutate(input.trim());
  };
  const handleDelete = (id: string) => deleteTask.mutate(id);
  const handleToggle = (id: string, isCompleted: boolean) => toggleTask.mutate({ id, isCompleted: !isCompleted });
  const handleEdit = (id: string, text: string) => {
    setEditId(id);
    setEditText(text);
  };
  const handleEditSave = () => {
    if (editId && editText.trim()) {
      editTask.mutate({ id: editId, content: editText.trim() });
    }
  };

  const productivityScore = tasks ? tasks.filter((t: any) => t.isCompleted).length * 10 : 0;

  return (
    <Container maxWidth="sm" sx={{ pt: 8, pb: 8 }}>
      <Paper elevation={6} sx={{ p: { xs: 2, md: 4 }, borderRadius: 4, bgcolor: '#18181b', color: 'white', mb: 4 }}>
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <AssignmentTurnedInIcon sx={{ fontSize: 40, color: '#8B5CF6' }} />
          <Typography variant="h4" fontWeight="bold">Productivity Hub</Typography>
        </Box>
        <Typography variant="body1" sx={{ mb: 2, color: 'rgba(255,255,255,0.7)' }}>
          Organize your day, boost your focus, and celebrate your wins. Every completed task earns you XP!
        </Typography>
        <ProductivityTicker />
        <Divider sx={{ my: 2, borderColor: 'rgba(139,92,246,0.2)' }} />
        <Stack direction="row" spacing={2} mb={2}>
          <TextField
            value={editId ? editText : input}
            onChange={e => editId ? setEditText(e.target.value) : setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') editId ? handleEditSave() : handleAdd();
            }}
            placeholder={editId ? "Edit task..." : "Add a new task..."}
            size="small"
            fullWidth
            sx={{ bgcolor: '#232336', borderRadius: 2, input: { color: 'white' } }}
            inputProps={{ 'aria-label': editId ? 'Edit task' : 'Add task' }}
          />
          <Button
            variant="contained"
            color="secondary"
            onClick={editId ? handleEditSave : handleAdd}
            sx={{ borderRadius: 2, minWidth: 48 }}
            aria-label={editId ? 'Save task' : 'Add task'}
            disabled={addTask.isPending || editTask.isPending}
          >
            {editId ? <CheckCircleIcon /> : 'Add'}
          </Button>
        </Stack>
        {isLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={120}>
            <CircularProgress color="secondary" />
          </Box>
        ) : isError ? (
          <Alert severity="error">Failed to load tasks: {error?.message}</Alert>
        ) : (
          <List>
            <AnimatePresence>
              {tasks.map((task: any) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                >
                  <ListItem
                    secondaryAction={
                      <Stack direction="row" spacing={1}>
                        <IconButton edge="end" aria-label="edit" onClick={() => handleEdit(task.id, task.content)}>
                          <EditIcon sx={{ color: '#8B5CF6' }} />
                        </IconButton>
                        <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(task.id)}>
                          <DeleteIcon sx={{ color: '#f87171' }} />
                        </IconButton>
                      </Stack>
                    }
                    sx={{
                      bgcolor: task.isCompleted ? 'rgba(139,92,246,0.10)' : 'transparent',
                      borderRadius: 2,
                      mb: 1,
                      transition: 'background 0.2s',
                    }}
                  >
                    <Checkbox
                      checked={task.isCompleted}
                      onChange={() => handleToggle(task.id, task.isCompleted)}
                      sx={{ color: '#8B5CF6', '&.Mui-checked': { color: '#8B5CF6' } }}
                      inputProps={{ 'aria-label': 'Mark task complete' }}
                    />
                    <Typography
                      variant="body1"
                      sx={{
                        textDecoration: task.isCompleted ? 'line-through' : 'none',
                        color: task.isCompleted ? '#a3a3a3' : 'white',
                        flex: 1,
                        fontWeight: 500,
                      }}
                    >
                      {task.content}
                    </Typography>
                  </ListItem>
                </motion.div>
              ))}
            </AnimatePresence>
          </List>
        )}
        <Divider sx={{ my: 2, borderColor: 'rgba(139,92,246,0.2)' }} />
        <Box display="flex" alignItems="center" gap={2}>
          <Typography variant="body2" color="#8B5CF6" fontWeight={600}>
            Productivity Score:
          </Typography>
          <motion.div
            key={productivityScore}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1.1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            style={{ display: 'inline-block' }}
          >
            <Typography variant="h6" color="#8B5CF6" fontWeight="bold">
              {productivityScore} XP
            </Typography>
          </motion.div>
        </Box>
      </Paper>
      <Snackbar
        open={!!snackbar}
        autoHideDuration={2000}
        onClose={() => setSnackbar("")}
        message={snackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Container>
  );
} 