"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Box, Container, Typography, Button, Paper, List, ListItem, ListItemText, IconButton, CircularProgress } from "@mui/material";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { motion } from "framer-motion";

const fetchKeys = async () => {
  const res = await fetch('/api/v1/user/api-keys');
  if (!res.ok) throw new Error('Failed to fetch API keys');
  return res.json();
};
const createKey = async () => {
  const res = await fetch('/api/v1/user/api-keys', { method: 'POST' });
  if (!res.ok) throw new Error('Failed to create API key');
  return res.json();
};

export default function ApiSettingsPage() {
  const queryClient = useQueryClient();
  const { data: keys, isLoading } = useQuery({
    queryKey: ["api-keys"],
    queryFn: fetchKeys,
  });
  const { mutate: generateKey, isPending: creating } = useMutation({
    mutationFn: createKey,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["api-keys"] }),
  });

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#0f2027", color: "white" }}>
      <Container maxWidth="md" sx={{ pt: 12 }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <Typography variant="h4" fontWeight="bold">Creator API</Typography>
          <Paper sx={{ p: 3, mt: 4, bgcolor: 'rgba(255,255,255,0.05)' }}>
            <Button onClick={() => generateKey()} variant="contained" disabled={creating} sx={{ mb: 2 }}>
              {creating ? <CircularProgress size={20} /> : 'Generate New API Key'}
            </Button>
            {isLoading ? <CircularProgress /> : (
              <List>
                {keys?.length > 0 ? keys.map((key: any) => (
                  <ListItem key={key.id} secondaryAction={
                    <IconButton onClick={() => navigator.clipboard.writeText(key.key)}><ContentCopyIcon /></IconButton>
                  }>
                    <ListItemText primary={key.key} secondary={`Created on ${new Date(key.createdAt).toLocaleDateString()}`} />
                  </ListItem>
                )) : <Typography color="text.secondary">No API keys yet.</Typography>}
              </List>
            )}
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
}
