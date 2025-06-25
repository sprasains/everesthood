"use client";
import { useState, useEffect } from "react";
import { Box, Container, Typography, Button, Paper, List, ListItem, ListItemText, IconButton } from "@mui/material";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

export default function ApiSettingsPage() {
    const [keys, setKeys] = useState([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        const fetchKeys = async () => {
            setLoading(true);
            const res = await fetch('/api/v1/user/api-keys');
            if (res.ok) setKeys(await res.json());
            setLoading(false);
        };
        fetchKeys();
    }, []);

    const generateKey = async () => {
        setCreating(true);
        const res = await fetch('/api/v1/user/api-keys', { method: 'POST' });
        if (res.ok) {
            const newKey = await res.json();
            setKeys((prev) => [newKey, ...prev]);
        }
        setCreating(false);
    };

    return (
        <Box sx={{ minHeight: "100vh", bgcolor: "#0f2027", color: "white" }}>
            <Container maxWidth="md" sx={{ pt: 12 }}>
                <Typography variant="h4" fontWeight="bold">Creator API</Typography>
                <Paper sx={{ p: 3, mt: 4, bgcolor: 'rgba(255,255,255,0.05)' }}>
                    <Button onClick={generateKey} variant="contained" disabled={creating}>
                        {creating ? 'Generating...' : 'Generate New API Key'}
                    </Button>
                    <List>
                        {keys.map(key => (
                            <ListItem key={key.id} secondaryAction={
                                <IconButton onClick={() => navigator.clipboard.writeText(key.key)}><ContentCopyIcon /></IconButton>
                            }>
                                <ListItemText primary={key.key} secondary={`Created on ${new Date(key.createdAt).toLocaleDateString()}`} />
                            </ListItem>
                        ))}
                    </List>
                </Paper>
            </Container>
        </Box>
    );
}
