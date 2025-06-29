"use client";
import { useEffect, useState } from "react";
import { Box, Typography, List, ListItem, ListItemText, Button, TextField, Divider, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert, IconButton, CircularProgress } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

export default function FamilyPage() {
  const [families, setFamilies] = useState([]);
  const [newFamily, setNewFamily] = useState({ name: "" });
  const [editFamily, setEditFamily] = useState<any>(null);
  const [deleteFamily, setDeleteFamily] = useState<any>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({ open: false, message: "", severity: "success" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    fetch("/api/v1/family").then(r => r.json()).then(d => setFamilies(d.families));
  }, []);

  const validate = (data: any) => {
    const errs: any = {};
    if (!data.name) errs.name = "Family name required";
    return errs;
  };

  const handleEdit = (item: any) => {
    setEditFamily({ ...item });
    setErrors({});
  };

  const handleDelete = (item: any) => {
    setDeleteFamily(item);
  };

  const handleEditSave = async () => {
    const errs = validate(editFamily);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      await fetch(`/api/v1/family/${editFamily.id}`, { method: "PUT", body: JSON.stringify(editFamily), headers: { "Content-Type": "application/json" } });
      setSnackbar({ open: true, message: "Family updated!", severity: "success" });
      setEditFamily(null);
      fetch("/api/v1/family").then(r => r.json()).then(d => setFamilies(d.families));
    } catch {
      setSnackbar({ open: true, message: "Update failed", severity: "error" });
    }
    setLoading(false);
  };

  const handleDeleteConfirm = async () => {
    setLoading(true);
    try {
      await fetch(`/api/v1/family/${deleteFamily.id}`, { method: "DELETE" });
      setSnackbar({ open: true, message: "Family deleted!", severity: "success" });
      setDeleteFamily(null);
      fetch("/api/v1/family").then(r => r.json()).then(d => setFamilies(d.families));
    } catch {
      setSnackbar({ open: true, message: "Delete failed", severity: "error" });
    }
    setLoading(false);
  };

  const addFamily = async () => {
    const errs = validate(newFamily);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      await fetch("/api/v1/family", { method: "POST", body: JSON.stringify(newFamily), headers: { "Content-Type": "application/json" } });
      setNewFamily({ name: "" });
      setSnackbar({ open: true, message: "Family added!", severity: "success" });
      fetch("/api/v1/family").then(r => r.json()).then(d => setFamilies(d.families));
    } catch {
      setSnackbar({ open: true, message: "Add failed", severity: "error" });
    }
    setLoading(false);
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>My Families</Typography>
      <Divider sx={{ my: 2 }} />
      <Typography variant="h6">Families</Typography>
      <List>
        {families.map((f: any) => (
          <ListItem key={f.id} secondaryAction={
            <>
              <IconButton onClick={() => handleEdit(f)}><EditIcon /></IconButton>
              <IconButton onClick={() => handleDelete(f)}><DeleteIcon /></IconButton>
            </>
          }>
            <ListItemText primary={f.name} />
          </ListItem>
        ))}
      </List>
      <Box sx={{ display: 'flex', gap: 2, my: 2 }}>
        <TextField label="Family Name" value={newFamily.name} onChange={e => setNewFamily(v => ({ ...v, name: e.target.value }))} error={!!errors.name} helperText={errors.name} />
        <Button onClick={addFamily} variant="contained">Add</Button>
      </Box>
      <Dialog open={!!editFamily} onClose={() => setEditFamily(null)}>
        <DialogTitle>Edit Family</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 300 }}>
          <TextField label="Family Name" value={editFamily?.name || ""} onChange={e => setEditFamily((v: any) => ({ ...v, name: e.target.value }))} error={!!errors.name} helperText={errors.name} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditFamily(null)}>Cancel</Button>
          <Button onClick={handleEditSave} disabled={loading} variant="contained">{loading ? <CircularProgress size={20} /> : "Save"}</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={!!deleteFamily} onClose={() => setDeleteFamily(null)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>Are you sure you want to delete this family?</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteFamily(null)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} disabled={loading} color="error" variant="contained">{loading ? <CircularProgress size={20} /> : "Delete"}</Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
        <Alert onClose={() => setSnackbar(s => ({ ...s, open: false }))} severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
} 