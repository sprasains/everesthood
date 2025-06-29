"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Box, Container, Typography, Button, Paper, Grid, TextField, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, CircularProgress } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { motion } from "framer-motion";
import { useSnackbar } from 'notistack';

const fetchPersonas = async () => {
  const res = await fetch("/api/v1/personas");
  if (!res.ok) throw new Error("Failed to fetch personas");
  return res.json();
};
const savePersona = async (data: any) => {
  const url = data.id ? `/api/v1/personas/${data.id}` : '/api/v1/personas';
  const method = data.id ? 'PUT' : 'POST';
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to save persona');
  return res.json();
};
const deletePersona = async (id: string) => {
  const res = await fetch(`/api/v1/personas/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete persona');
  return res.json();
};

export default function PersonasPage() {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const { data: personas, isLoading } = useQuery({
    queryKey: ["personas"],
    queryFn: fetchPersonas,
  });
  const [open, setOpen] = useState(false);
  const [editingPersona, setEditingPersona] = useState<any>(null);
  const { mutate: save, isPending: saving } = useMutation({
    mutationFn: savePersona,
    onSuccess: () => {
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["personas"] });
      enqueueSnackbar('Persona saved!', { variant: 'success' });
    },
    onError: () => {
      enqueueSnackbar('Failed to save persona', { variant: 'error' });
    }
  });
  const { mutate: remove, isPending: deleting } = useMutation({
    mutationFn: deletePersona,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["personas"] });
      enqueueSnackbar('Persona deleted!', { variant: 'success' });
    },
    onError: () => {
      enqueueSnackbar('Failed to delete persona', { variant: 'error' });
    }
  });

  const handleOpen = (persona: any = null) => {
    setEditingPersona(persona);
    setOpen(true);
  };
  const handleClose = () => setOpen(false);
  const handleSave = (event: any) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData.entries());
    if (editingPersona?.id) data.id = editingPersona.id;
    save(data);
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#0f2027", color: "white" }}>
      <Container maxWidth="md" sx={{ pt: 12 }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <Paper elevation={4} sx={{ p: { xs: 2, md: 4 }, mb: 4, bgcolor: 'background.paper', borderRadius: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h4" fontWeight="bold">My Custom Personas</Typography>
              <Button variant="contained" onClick={() => handleOpen()} sx={{ borderRadius: 3 }}>Create New</Button>
            </Box>
            <Grid container spacing={3} sx={{ mt: 2 }}>
              {isLoading ? <CircularProgress /> : personas?.length > 0 ? personas.map((persona: any) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={persona.id}>
                  <Paper sx={{ p: 3, bgcolor: 'rgba(255,255,255,0.05)', position: 'relative', borderRadius: 3 }}>
                    <Typography fontWeight="bold">{persona.name}</Typography>
                    <Typography color="text.secondary">{persona.description}</Typography>
                    <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 1 }}>
                      <IconButton onClick={() => handleOpen(persona)}><EditIcon /></IconButton>
                      <IconButton onClick={() => remove(persona.id)} disabled={deleting}><DeleteIcon /></IconButton>
                    </Box>
                  </Paper>
                </Grid>
              )) : <Typography color="text.secondary" sx={{ ml: 2 }}>No personas found.</Typography>}
            </Grid>
            <Dialog open={open} onClose={handleClose} PaperProps={{ sx: { borderRadius: 3 } }}>
              <form onSubmit={handleSave}>
                <DialogTitle>{editingPersona ? "Edit Persona" : "Create Persona"}</DialogTitle>
                <DialogContent>
                  <TextField
                    name="name"
                    label="Name"
                    defaultValue={editingPersona?.name || ""}
                    fullWidth
                    margin="normal"
                    required
                  />
                  <TextField
                    name="description"
                    label="Description"
                    defaultValue={editingPersona?.description || ""}
                    fullWidth
                    margin="normal"
                    multiline
                    minRows={2}
                  />
                </DialogContent>
                <DialogActions>
                  <Button onClick={handleClose}>Cancel</Button>
                  <Button type="submit" variant="contained" disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
                </DialogActions>
              </form>
            </Dialog>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
}
