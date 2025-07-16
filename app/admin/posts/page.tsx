"use client";
export const dynamic = "force-dynamic";
import { useState } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Typography,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  CircularProgress,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Image from 'next/image';

function fetchPosts() {
  return fetch("/api/v1/posts").then((res) => res.json());
}

export default function AdminPostsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-posts"],
    queryFn: fetchPosts,
  });
  const posts = data?.posts || [];
  const [editPost, setEditPost] = useState<any>(null);
  const [editValues, setEditValues] = useState({ title: "", content: "" });
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();

  const handleEdit = (post: any) => {
    setEditPost(post);
    setEditValues({ title: post.title || "", content: post.content || "" });
  };

  const handleSave = async () => {
    if (!editPost) return;
    setSaving(true);
    await fetch(`/api/v1/posts/${editPost.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editValues),
    });
    setSaving(false);
    setEditPost(null);
    queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Posts Admin
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Image</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Last Update</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : (
              posts.map((post: any) => (
                <TableRow key={post.id}>
                  <TableCell>
                    <Avatar
                      variant="rounded"
                      src={post.metadata?.image || "https://i.pravatar.cc/150?u=everhood"}
                      sx={{ width: 56, height: 56 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Tooltip
                      title={
                        <Box sx={{ p: 1, maxWidth: 300 }}>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {post.title}
                          </Typography>
                          <Image
                            src={post.metadata?.image || "https://i.pravatar.cc/150?u=everhood"}
                            alt="preview"
                            width={300}
                            height={180}
                            style={{ width: "100%", borderRadius: 8, margin: "8px 0", objectFit: 'cover' }}
                          />
                          <Typography variant="body2" color="text.secondary">
                            {post.content}
                          </Typography>
                        </Box>
                      }
                      arrow
                      placement="right"
                    >
                      <span style={{ cursor: "pointer", color: "#1976d2", textDecoration: "underline" }}>
                        {post.title}
                      </span>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    {new Date(post.updatedAt || post.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEdit(post)}>
                      <EditIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={!!editPost} onClose={() => setEditPost(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Post</DialogTitle>
        <DialogContent>
          <TextField
            label="Title"
            fullWidth
            margin="normal"
            value={editValues.title}
            onChange={(e) => setEditValues((v) => ({ ...v, title: e.target.value }))}
          />
          <TextField
            label="Content"
            fullWidth
            margin="normal"
            multiline
            minRows={4}
            value={editValues.content}
            onChange={(e) => setEditValues((v) => ({ ...v, content: e.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditPost(null)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={saving}>
            {saving ? <CircularProgress size={20} /> : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
