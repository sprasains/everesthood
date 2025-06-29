import React, { useEffect, useState } from "react";
import {
  Box, Typography, List, ListItem, ListItemText, Button, TextField, Divider, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert, IconButton, CircularProgress
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

export type CrudField = {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  validate?: (value: any) => string | undefined;
};

export type CrudManagerProps = {
  title: string;
  apiBase: string; // e.g. "/api/v1/docs"
  fields: CrudField[];
  itemLabel: string; // e.g. "Document"
};

export default function CrudManager({ title, apiBase, fields, itemLabel }: CrudManagerProps) {
  const [items, setItems] = useState<any[]>([]);
  const [newItem, setNewItem] = useState<any>(() => Object.fromEntries(fields.map(f => [f.name, ""])));
  const [editItem, setEditItem] = useState<any>(null);
  const [deleteItem, setDeleteItem] = useState<any>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({ open: false, message: "", severity: "success" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const fetchItems = () => {
    fetch(apiBase)
      .then(r => r.json())
      .then(d => setItems(d.items || d[`${itemLabel.toLowerCase()}s`] || []));
  };

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line
  }, []);

  const validate = (data: any) => {
    const errs: any = {};
    for (const f of fields) {
      if (f.required && !data[f.name]) errs[f.name] = `${f.label} required`;
      if (f.validate) {
        const msg = f.validate(data[f.name]);
        if (msg) errs[f.name] = msg;
      }
    }
    return errs;
  };

  const handleEdit = (item: any) => {
    setEditItem({ ...item });
    setErrors({});
  };
  const handleDelete = (item: any) => {
    setDeleteItem(item);
  };
  const handleEditSave = async () => {
    const errs = validate(editItem);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      await fetch(`${apiBase}/${editItem.id}`, { method: "PUT", body: JSON.stringify(editItem), headers: { "Content-Type": "application/json" } });
      setSnackbar({ open: true, message: `${itemLabel} updated!`, severity: "success" });
      setEditItem(null);
      fetchItems();
    } catch {
      setSnackbar({ open: true, message: `Update failed`, severity: "error" });
    }
    setLoading(false);
  };
  const handleDeleteConfirm = async () => {
    setLoading(true);
    try {
      await fetch(`${apiBase}/${deleteItem.id}`, { method: "DELETE" });
      setSnackbar({ open: true, message: `${itemLabel} deleted!`, severity: "success" });
      setDeleteItem(null);
      fetchItems();
    } catch {
      setSnackbar({ open: true, message: `Delete failed`, severity: "error" });
    }
    setLoading(false);
  };
  const addItem = async () => {
    const errs = validate(newItem);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      await fetch(apiBase, { method: "POST", body: JSON.stringify(newItem), headers: { "Content-Type": "application/json" } });
      setNewItem(Object.fromEntries(fields.map(f => [f.name, ""])));
      setSnackbar({ open: true, message: `${itemLabel} added!`, severity: "success" });
      fetchItems();
    } catch {
      setSnackbar({ open: true, message: `Add failed`, severity: "error" });
    }
    setLoading(false);
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>{title}</Typography>
      <Divider sx={{ my: 2 }} />
      <List>
        {items.map((item: any) => (
          <ListItem key={item.id} secondaryAction={
            <>
              <IconButton onClick={() => handleEdit(item)}><EditIcon /></IconButton>
              <IconButton onClick={() => handleDelete(item)}><DeleteIcon /></IconButton>
            </>
          }>
            <ListItemText primary={fields.map(f => item[f.name]).filter(Boolean).join(" | ")} />
          </ListItem>
        ))}
      </List>
      <Box sx={{ display: 'flex', gap: 2, my: 2 }}>
        {fields.map(f => (
          <TextField
            key={f.name}
            label={f.label}
            value={newItem[f.name] || ""}
            onChange={e => setNewItem((v: any) => ({ ...v, [f.name]: e.target.value }))}
            type={f.type || "text"}
            error={!!errors[f.name]}
            helperText={errors[f.name]}
            InputLabelProps={f.type === "date" || f.type === "datetime-local" ? { shrink: true } : undefined}
          />
        ))}
        <Button onClick={addItem} variant="contained">Add</Button>
      </Box>
      <Dialog open={!!editItem} onClose={() => setEditItem(null)}>
        <DialogTitle>Edit {itemLabel}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 300 }}>
          {fields.map(f => (
            <TextField
              key={f.name}
              label={f.label}
              value={editItem?.[f.name] || ""}
              onChange={e => setEditItem((v: any) => ({ ...v, [f.name]: e.target.value }))}
              type={f.type || "text"}
              error={!!errors[f.name]}
              helperText={errors[f.name]}
              InputLabelProps={f.type === "date" || f.type === "datetime-local" ? { shrink: true } : undefined}
            />
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditItem(null)}>Cancel</Button>
          <Button onClick={handleEditSave} disabled={loading} variant="contained">{loading ? <CircularProgress size={20} /> : "Save"}</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={!!deleteItem} onClose={() => setDeleteItem(null)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>Are you sure you want to delete this {itemLabel.toLowerCase()}?</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteItem(null)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} disabled={loading} color="error" variant="contained">{loading ? <CircularProgress size={20} /> : "Delete"}</Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
        <Alert onClose={() => setSnackbar(s => ({ ...s, open: false }))} severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
} 