"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import { Box, Container, Typography, Button, Paper, Grid, TextField, Dialog, DialogTitle, DialogContent, DialogActions, IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

export default function PersonasPage() {
    const [personas, setPersonas] = useState([]);
    const [open, setOpen] = useState(false);
    const [editingPersona, setEditingPersona] = useState(null);

    const fetchPersonas = async () => {
        const res = await fetch("/api/v1/personas");
        if (res.ok) setPersonas(await res.json());
    };

    useEffect(() => { fetchPersonas(); }, []);

    const handleOpen = (persona = null) => {
        setEditingPersona(persona);
        setOpen(true);
    };

    const handleClose = () => setOpen(false);
    
    const handleSave = async (event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const data = Object.fromEntries(formData.entries());

        const url = editingPersona ? `/api/v1/personas/${editingPersona.id}` : '/api/v1/personas';
        const method = editingPersona ? 'PUT' : 'POST';

        await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        handleClose();
        fetchPersonas();
    };

    const handleDelete = async (personaId) => {
        await fetch(`/api/v1/personas/${personaId}`, { method: 'DELETE' });
        fetchPersonas();
    };

    return (
        <Box sx={{ minHeight: "100vh", bgcolor: "#0f2027", color: "white" }}>
            <Navbar />
            <Container sx={{ pt: 12 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h4" fontWeight="bold">My Custom Personas</Typography>
                    <Button variant="contained" onClick={() => handleOpen()}>Create New</Button>
                </Box>
                {/* Grid to display existing personas with Edit/Delete buttons */}
                <Grid container spacing={3} sx={{ mt: 4 }}>
                    {personas.map((persona) => (
                        <Grid item xs={12} sm={6} md={4} key={persona.id}>
                            <Paper sx={{ p: 3, borderRadius: 3, bgcolor: "rgba(255,255,255,0.07)", color: "white", position: "relative" }}>
                                <Box display="flex" alignItems="center" gap={2} mb={2}>
                                    <span style={{ fontSize: 32 }}>{persona.icon || "🤖"}</span>
                                    <Box>
                                        <Typography variant="h6" fontWeight="bold">{persona.name}</Typography>
                                        <Typography variant="body2" sx={{ color: "#ccc" }}>{persona.prompt.slice(0, 60)}{persona.prompt.length > 60 ? "..." : ""}</Typography>
                                    </Box>
                                </Box>
                                <Box display="flex" gap={1} mt={2}>
                                    <Button size="small" variant="outlined" color="primary" onClick={() => handleOpen(persona)}>Edit</Button>
                                    <Button size="small" variant="outlined" color="error" onClick={() => handleDelete(persona.id)}>Delete</Button>
                                </Box>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>

                {/* Create/Edit Dialog */}
                <Dialog open={open} onClose={handleClose} PaperProps={{ component: 'form', onSubmit: handleSave }}>
                    <DialogTitle>{editingPersona ? 'Edit' : 'Create'} Persona</DialogTitle>
                    <DialogContent>
                        <TextField name="name" label="Persona Name" defaultValue={editingPersona?.name} fullWidth margin="dense" required />
                        <TextField name="icon" label="Icon (Emoji)" defaultValue={editingPersona?.icon} fullWidth margin="dense" />
                        <TextField name="prompt" label="AI Prompt Instructions" defaultValue={editingPersona?.prompt} multiline rows={6} fullWidth margin="dense" required />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose}>Cancel</Button>
                        <Button type="submit">Save</Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </Box>
    );
}
