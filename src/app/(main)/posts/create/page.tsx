"use client";
import { Box, Button, Container, Paper, TextField, Typography, CircularProgress } from "@mui/material";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { useState } from "react";
import MenuItem from "@mui/material/MenuItem";

const POST_TYPES = [
  { label: "Text", value: "TEXT" },
  { label: "Poll", value: "POLL" },
  { label: "Link", value: "LINK" },
  { label: "Prediction", value: "PREDICTION" },
];

export default function CreatePostPage() {
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [mediaInput, setMediaInput] = useState("");
  const [type, setType] = useState("TEXT");

  const { mutate, status } = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/v1/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, type, mediaUrls }),
      });
      if (!res.ok) throw new Error("Failed to create post");
      return res.json();
    },
    onSuccess: () => {
      enqueueSnackbar("Post created successfully!", { variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["community-posts"] });
      reset();
    },
    onError: () => {
      enqueueSnackbar("Failed to create post", { variant: "error" });
    }
  });

  const handleAddMedia = () => {
    if (mediaInput.trim()) {
      setMediaUrls([...mediaUrls, mediaInput.trim()]);
      setMediaInput("");
    }
  };
  const handleRemoveMedia = (idx: number) => {
    setMediaUrls(mediaUrls.filter((_, i) => i !== idx));
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#0f2027", color: "white" }}>
      <Container sx={{ pt: 12, maxWidth: 600 }}>
        <Paper sx={{ p: 4, bgcolor: "rgba(255,255,255,0.07)" }}>
          <Typography variant="h5" fontWeight="bold" mb={2}>
            Create a New Post
          </Typography>
          <form onSubmit={handleSubmit((data) => mutate(data))}>
            <TextField
              label="Title"
              fullWidth
              margin="normal"
              {...register("title")}
              error={!!errors.title}
              helperText={errors.title?.message?.toString()}
            />
            <TextField
              label="Content"
              fullWidth
              margin="normal"
              multiline
              minRows={4}
              {...register("content", { required: "Content is required" })}
              error={!!errors.content}
              helperText={errors.content?.message?.toString()}
            />
            <TextField
              select
              label="Type"
              value={type}
              onChange={e => setType(e.target.value)}
              fullWidth
              margin="normal"
            >
              {POST_TYPES.map(opt => (
                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
              ))}
            </TextField>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 2 }}>
              <TextField
                label="Add Media URL"
                value={mediaInput}
                onChange={e => setMediaInput(e.target.value)}
                fullWidth
              />
              <Button onClick={handleAddMedia} variant="outlined">Add</Button>
            </Box>
            {mediaUrls.length > 0 && (
              <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {mediaUrls.map((url, i) => (
                  <Box key={i} sx={{ position: 'relative' }}>
                    <img src={url} alt="media" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8 }} />
                    <Button size="small" color="error" sx={{ position: 'absolute', top: 0, right: 0, minWidth: 0, p: 0 }} onClick={() => handleRemoveMedia(i)}>✕</Button>
                  </Box>
                ))}
              </Box>
            )}
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={status === 'pending'}
              sx={{ mt: 2 }}
              fullWidth
              startIcon={status === 'pending' ? <CircularProgress size={20} /> : null}
            >
              {status === 'pending' ? "Posting..." : "Create Post"}
            </Button>
          </form>
        </Paper>
      </Container>
    </Box>
  );
}
