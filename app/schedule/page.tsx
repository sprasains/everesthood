"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import { Box, Typography, List, ListItem, ListItemText, Button, TextField, Divider, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert, IconButton, CircularProgress } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

export default function SchedulePage() {
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({ title: "", description: "", startTime: "", endTime: "", attendeeIds: [] });
  const [editEvent, setEditEvent] = useState<any>(null);
  const [deleteEvent, setDeleteEvent] = useState<any>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({ open: false, message: "", severity: "success" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    fetch("/api/v1/schedule/events").then(r => r.json()).then(d => setEvents(d.events));
  }, []);

  const validate = (data: any) => {
    const errs: any = {};
    if (!data.title) errs.title = "Title required";
    if (!data.startTime) errs.startTime = "Start time required";
    if (!data.endTime) errs.endTime = "End time required";
    if (data.startTime && data.endTime && data.startTime > data.endTime) errs.endTime = "End must be after start";
    return errs;
  };

  const handleEdit = (item: any) => {
    setEditEvent({ ...item });
    setErrors({});
  };

  const handleDelete = (item: any) => {
    setDeleteEvent(item);
  };

  const handleEditSave = async () => {
    const errs = validate(editEvent);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      await fetch(`/api/v1/schedule/events/${editEvent.id}`, { method: "PUT", body: JSON.stringify(editEvent), headers: { "Content-Type": "application/json" } });
      setSnackbar({ open: true, message: "Event updated!", severity: "success" });
      setEditEvent(null);
      fetch("/api/v1/schedule/events").then(r => r.json()).then(d => setEvents(d.events));
    } catch {
      setSnackbar({ open: true, message: "Update failed", severity: "error" });
    }
    setLoading(false);
  };

  const handleDeleteConfirm = async () => {
    setLoading(true);
    try {
      await fetch(`/api/v1/schedule/events/${deleteEvent.id}`, { method: "DELETE" });
      setSnackbar({ open: true, message: "Event deleted!", severity: "success" });
      setDeleteEvent(null);
      fetch("/api/v1/schedule/events").then(r => r.json()).then(d => setEvents(d.events));
    } catch {
      setSnackbar({ open: true, message: "Delete failed", severity: "error" });
    }
    setLoading(false);
  };

  const addEvent = async () => {
    const errs = validate(newEvent);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      await fetch("/api/v1/schedule/events", { method: "POST", body: JSON.stringify(newEvent), headers: { "Content-Type": "application/json" } });
      setNewEvent({ title: "", description: "", startTime: "", endTime: "", attendeeIds: [] });
      setSnackbar({ open: true, message: "Event added!", severity: "success" });
      fetch("/api/v1/schedule/events").then(r => r.json()).then(d => setEvents(d.events));
    } catch {
      setSnackbar({ open: true, message: "Add failed", severity: "error" });
    }
    setLoading(false);
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>Family Schedule</Typography>
      <Divider sx={{ my: 2 }} />
      <Typography variant="h6">Events</Typography>
      <List>
        {events.map((e: any) => (
          <ListItem key={e.id} secondaryAction={
            <>
              <IconButton onClick={() => handleEdit(e)}><EditIcon /></IconButton>
              <IconButton onClick={() => handleDelete(e)}><DeleteIcon /></IconButton>
            </>
          }>
            <ListItemText primary={e.title} secondary={`From: ${e.startTime} To: ${e.endTime}`} />
          </ListItem>
        ))}
      </List>
      <Box sx={{ display: 'flex', gap: 2, my: 2 }}>
        <TextField label="Title" value={newEvent.title} onChange={e => setNewEvent(v => ({ ...v, title: e.target.value }))} error={!!errors.title} helperText={errors.title} />
        <TextField label="Description" value={newEvent.description} onChange={e => setNewEvent(v => ({ ...v, description: e.target.value }))} />
        <TextField label="Start Time" value={newEvent.startTime} onChange={e => setNewEvent(v => ({ ...v, startTime: e.target.value }))} type="datetime-local" InputLabelProps={{ shrink: true }} error={!!errors.startTime} helperText={errors.startTime} />
        <TextField label="End Time" value={newEvent.endTime} onChange={e => setNewEvent(v => ({ ...v, endTime: e.target.value }))} type="datetime-local" InputLabelProps={{ shrink: true }} error={!!errors.endTime} helperText={errors.endTime} />
        <Button onClick={addEvent} variant="contained">Add</Button>
      </Box>
      <Dialog open={!!editEvent} onClose={() => setEditEvent(null)}>
        <DialogTitle>Edit Event</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 300 }}>
          <TextField label="Title" value={editEvent?.title || ""} onChange={e => setEditEvent((v: any) => ({ ...v, title: e.target.value }))} error={!!errors.title} helperText={errors.title} />
          <TextField label="Description" value={editEvent?.description || ""} onChange={e => setEditEvent((v: any) => ({ ...v, description: e.target.value }))} />
          <TextField label="Start Time" value={editEvent?.startTime || ""} onChange={e => setEditEvent((v: any) => ({ ...v, startTime: e.target.value }))} type="datetime-local" InputLabelProps={{ shrink: true }} error={!!errors.startTime} helperText={errors.startTime} />
          <TextField label="End Time" value={editEvent?.endTime || ""} onChange={e => setEditEvent((v: any) => ({ ...v, endTime: e.target.value }))} type="datetime-local" InputLabelProps={{ shrink: true }} error={!!errors.endTime} helperText={errors.endTime} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditEvent(null)}>Cancel</Button>
          <Button onClick={handleEditSave} disabled={loading} variant="contained">{loading ? <CircularProgress size={20} /> : "Save"}</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={!!deleteEvent} onClose={() => setDeleteEvent(null)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>Are you sure you want to delete this event?</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteEvent(null)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} disabled={loading} color="error" variant="contained">{loading ? <CircularProgress size={20} /> : "Delete"}</Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
        <Alert onClose={() => setSnackbar(s => ({ ...s, open: false }))} severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
} 