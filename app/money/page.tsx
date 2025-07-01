"use client";
import { useEffect, useState } from "react";
import { Box, Typography, List, ListItem, ListItemText, Button, TextField, Divider, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert, IconButton, CircularProgress } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

export default function MoneyPage() {
  const [budgets, setBudgets] = useState([]);
  const [bills, setBills] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [newBudget, setNewBudget] = useState({ category: "", limitAmount: "" });
  const [newBill, setNewBill] = useState({ name: "", amount: "", dueDate: "" });
  const [newSub, setNewSub] = useState({ name: "", amount: "", renewalDate: "" });
  const [editItem, setEditItem] = useState<any>(null);
  const [editType, setEditType] = useState<string>("");
  const [deleteItem, setDeleteItem] = useState<any>(null);
  const [deleteType, setDeleteType] = useState<string>("");
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({ open: false, message: "", severity: "success" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    fetch("/api/v1/money/budgets").then(r => r.json()).then(d => setBudgets(d.budgets));
    fetch("/api/v1/money/bills").then(r => r.json()).then(d => setBills(d.bills));
    fetch("/api/v1/money/subscriptions").then(r => r.json()).then(d => setSubscriptions(d.subscriptions));
  }, []);

  const validate = (type: string, data: any) => {
    const errs: any = {};
    if (type === "budget") {
      if (!data.category) errs.category = "Category required";
      if (!data.limitAmount || isNaN(Number(data.limitAmount)) || Number(data.limitAmount) <= 0) errs.limitAmount = "Limit must be positive number";
    } else if (type === "bill") {
      if (!data.name) errs.name = "Name required";
      if (!data.amount || isNaN(Number(data.amount)) || Number(data.amount) <= 0) errs.amount = "Amount must be positive number";
      if (!data.dueDate) errs.dueDate = "Due date required";
    } else if (type === "sub") {
      if (!data.name) errs.name = "Name required";
      if (!data.amount || isNaN(Number(data.amount)) || Number(data.amount) <= 0) errs.amount = "Amount must be positive number";
      if (!data.renewalDate) errs.renewalDate = "Renewal date required";
    }
    return errs;
  };

  const handleEdit = (type: string, item: any) => {
    setEditType(type);
    setEditItem({ ...item });
    setErrors({});
  };

  const handleDelete = (type: string, item: any) => {
    setDeleteType(type);
    setDeleteItem(item);
  };

  const handleEditSave = async () => {
    const errs = validate(editType, editItem);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      let url = "";
      if (editType === "budget") url = `/api/v1/money/budgets/${editItem.id}`;
      if (editType === "bill") url = `/api/v1/money/bills/${editItem.id}`;
      if (editType === "sub") url = `/api/v1/money/subscriptions/${editItem.id}`;
      await fetch(url, { method: "PUT", body: JSON.stringify(editItem), headers: { "Content-Type": "application/json" } });
      setSnackbar({ open: true, message: "Updated successfully!", severity: "success" });
      setEditItem(null);
      // Refresh data
      fetch("/api/v1/money/budgets").then(r => r.json()).then(d => setBudgets(d.budgets));
      fetch("/api/v1/money/bills").then(r => r.json()).then(d => setBills(d.bills));
      fetch("/api/v1/money/subscriptions").then(r => r.json()).then(d => setSubscriptions(d.subscriptions));
    } catch {
      setSnackbar({ open: true, message: "Update failed", severity: "error" });
    }
    setLoading(false);
  };

  const handleDeleteConfirm = async () => {
    setLoading(true);
    try {
      let url = "";
      if (deleteType === "budget") url = `/api/v1/money/budgets/${deleteItem.id}`;
      if (deleteType === "bill") url = `/api/v1/money/bills/${deleteItem.id}`;
      if (deleteType === "sub") url = `/api/v1/money/subscriptions/${deleteItem.id}`;
      await fetch(url, { method: "DELETE" });
      setSnackbar({ open: true, message: "Deleted successfully!", severity: "success" });
      setDeleteItem(null);
      // Refresh data
      fetch("/api/v1/money/budgets").then(r => r.json()).then(d => setBudgets(d.budgets));
      fetch("/api/v1/money/bills").then(r => r.json()).then(d => setBills(d.bills));
      fetch("/api/v1/money/subscriptions").then(r => r.json()).then(d => setSubscriptions(d.subscriptions));
    } catch {
      setSnackbar({ open: true, message: "Delete failed", severity: "error" });
    }
    setLoading(false);
  };

  const addBudget = async () => {
    const errs = validate("budget", newBudget);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      await fetch("/api/v1/money/budgets", { method: "POST", body: JSON.stringify(newBudget), headers: { "Content-Type": "application/json" } });
      setNewBudget({ category: "", limitAmount: "" });
      setSnackbar({ open: true, message: "Budget added!", severity: "success" });
      fetch("/api/v1/money/budgets").then(r => r.json()).then(d => setBudgets(d.budgets));
    } catch {
      setSnackbar({ open: true, message: "Add failed", severity: "error" });
    }
    setLoading(false);
  };

  const addBill = async () => {
    const errs = validate("bill", newBill);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      await fetch("/api/v1/money/bills", { method: "POST", body: JSON.stringify(newBill), headers: { "Content-Type": "application/json" } });
      setNewBill({ name: "", amount: "", dueDate: "" });
      setSnackbar({ open: true, message: "Bill added!", severity: "success" });
      fetch("/api/v1/money/bills").then(r => r.json()).then(d => setBills(d.bills));
    } catch {
      setSnackbar({ open: true, message: "Add failed", severity: "error" });
    }
    setLoading(false);
  };

  const addSub = async () => {
    const errs = validate("sub", newSub);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      await fetch("/api/v1/money/subscriptions", { method: "POST", body: JSON.stringify(newSub), headers: { "Content-Type": "application/json" } });
      setNewSub({ name: "", amount: "", renewalDate: "" });
      setSnackbar({ open: true, message: "Subscription added!", severity: "success" });
      fetch("/api/v1/money/subscriptions").then(r => r.json()).then(d => setSubscriptions(d.subscriptions));
    } catch {
      setSnackbar({ open: true, message: "Add failed", severity: "error" });
    }
    setLoading(false);
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>Money Dashboard</Typography>
      <Divider sx={{ my: 2 }} />
      <Typography variant="h6">Budgets</Typography>
      <List>
        {budgets.map((b: any) => (
          <ListItem key={b.id} secondaryAction={
            <>
              <IconButton onClick={() => handleEdit("budget", b)}><EditIcon /></IconButton>
              <IconButton onClick={() => handleDelete("budget", b)}><DeleteIcon /></IconButton>
            </>
          }>
            <ListItemText primary={b.category} secondary={`Limit: $${b.limitAmount}`} />
          </ListItem>
        ))}
      </List>
      <Box sx={{ display: 'flex', gap: 2, my: 2 }}>
        <TextField label="Category" value={newBudget.category} onChange={e => setNewBudget(v => ({ ...v, category: e.target.value }))} error={!!errors.category} helperText={errors.category} />
        <TextField label="Limit" value={newBudget.limitAmount} onChange={e => setNewBudget(v => ({ ...v, limitAmount: e.target.value }))} type="number" error={!!errors.limitAmount} helperText={errors.limitAmount} />
        <Button onClick={addBudget} variant="contained">Add</Button>
      </Box>
      <Divider sx={{ my: 2 }} />
      <Typography variant="h6">Bills</Typography>
      <List>
        {bills.map((b: any) => (
          <ListItem key={b.id} secondaryAction={
            <>
              <IconButton onClick={() => handleEdit("bill", b)}><EditIcon /></IconButton>
              <IconButton onClick={() => handleDelete("bill", b)}><DeleteIcon /></IconButton>
            </>
          }>
            <ListItemText primary={b.name} secondary={`Amount: $${b.amount} | Due: ${b.dueDate}`} />
          </ListItem>
        ))}
      </List>
      <Box sx={{ display: 'flex', gap: 2, my: 2 }}>
        <TextField label="Name" value={newBill.name} onChange={e => setNewBill(v => ({ ...v, name: e.target.value }))} error={!!errors.name} helperText={errors.name} />
        <TextField label="Amount" value={newBill.amount} onChange={e => setNewBill(v => ({ ...v, amount: e.target.value }))} type="number" error={!!errors.amount} helperText={errors.amount} />
        <TextField label="Due Date" value={newBill.dueDate} onChange={e => setNewBill(v => ({ ...v, dueDate: e.target.value }))} type="date" InputLabelProps={{ shrink: true }} error={!!errors.dueDate} helperText={errors.dueDate} />
        <Button onClick={addBill} variant="contained">Add</Button>
      </Box>
      <Divider sx={{ my: 2 }} />
      <Typography variant="h6">Subscriptions</Typography>
      <List>
        {subscriptions.map((s: any) => (
          <ListItem key={s.id} secondaryAction={
            <>
              <IconButton onClick={() => handleEdit("sub", s)}><EditIcon /></IconButton>
              <IconButton onClick={() => handleDelete("sub", s)}><DeleteIcon /></IconButton>
            </>
          }>
            <ListItemText primary={s.name} secondary={`Amount: $${s.amount} | Renewal: ${s.renewalDate}`} />
          </ListItem>
        ))}
      </List>
      <Box sx={{ display: 'flex', gap: 2, my: 2 }}>
        <TextField label="Name" value={newSub.name} onChange={e => setNewSub(v => ({ ...v, name: e.target.value }))} error={!!errors.name} helperText={errors.name} />
        <TextField label="Amount" value={newSub.amount} onChange={e => setNewSub(v => ({ ...v, amount: e.target.value }))} type="number" error={!!errors.amount} helperText={errors.amount} />
        <TextField label="Renewal Date" value={newSub.renewalDate} onChange={e => setNewSub(v => ({ ...v, renewalDate: e.target.value }))} type="date" InputLabelProps={{ shrink: true }} error={!!errors.renewalDate} helperText={errors.renewalDate} />
        <Button onClick={addSub} variant="contained">Add</Button>
      </Box>
      <Dialog open={!!editItem} onClose={() => setEditItem(null)}>
        <DialogTitle>Edit {editType === "budget" ? "Budget" : editType === "bill" ? "Bill" : "Subscription"}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 300 }}>
          {editType === "budget" && (
            <>
              <TextField label="Category" value={editItem?.category || ""} onChange={e => setEditItem((v: any) => ({ ...v, category: e.target.value }))} error={!!errors.category} helperText={errors.category} />
              <TextField label="Limit" value={editItem?.limitAmount || ""} onChange={e => setEditItem((v: any) => ({ ...v, limitAmount: e.target.value }))} type="number" error={!!errors.limitAmount} helperText={errors.limitAmount} />
            </>
          )}
          {editType === "bill" && (
            <>
              <TextField label="Name" value={editItem?.name || ""} onChange={e => setEditItem((v: any) => ({ ...v, name: e.target.value }))} error={!!errors.name} helperText={errors.name} />
              <TextField label="Amount" value={editItem?.amount || ""} onChange={e => setEditItem((v: any) => ({ ...v, amount: e.target.value }))} type="number" error={!!errors.amount} helperText={errors.amount} />
              <TextField label="Due Date" value={editItem?.dueDate || ""} onChange={e => setEditItem((v: any) => ({ ...v, dueDate: e.target.value }))} type="date" InputLabelProps={{ shrink: true }} error={!!errors.dueDate} helperText={errors.dueDate} />
            </>
          )}
          {editType === "sub" && (
            <>
              <TextField label="Name" value={editItem?.name || ""} onChange={e => setEditItem((v: any) => ({ ...v, name: e.target.value }))} error={!!errors.name} helperText={errors.name} />
              <TextField label="Amount" value={editItem?.amount || ""} onChange={e => setEditItem((v: any) => ({ ...v, amount: e.target.value }))} type="number" error={!!errors.amount} helperText={errors.amount} />
              <TextField label="Renewal Date" value={editItem?.renewalDate || ""} onChange={e => setEditItem((v: any) => ({ ...v, renewalDate: e.target.value }))} type="date" InputLabelProps={{ shrink: true }} error={!!errors.renewalDate} helperText={errors.renewalDate} />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditItem(null)}>Cancel</Button>
          <Button onClick={handleEditSave} disabled={loading} variant="contained">{loading ? <CircularProgress size={20} /> : "Save"}</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={!!deleteItem} onClose={() => setDeleteItem(null)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>Are you sure you want to delete this {deleteType}?</DialogContent>
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