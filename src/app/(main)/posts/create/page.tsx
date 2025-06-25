"use client";
import { Box, Button, Container, Paper, TextField, Typography, CircularProgress } from "@mui/material";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";

export default function CreatePostPage() {
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  const { mutate, isLoading } = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/v1/community/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create post");
      return res.json();
    },
    onSuccess: () => {
      enqueueSnackbar("Post created successfully!", { variant: "success" });
      queryClient.invalidateQueries(["community-posts"]);
      reset();
    },
    onError: () => {
      enqueueSnackbar("Failed to create post", { variant: "error" });
    }
  });

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#0f2027", color: "white" }}>
      <Container sx={{ pt: 12, maxWidth: 600 }}>
        <Paper sx={{ p: 4, bgcolor: "rgba(255,255,255,0.07)" }}>
          <Typography variant="h5" fontWeight="bold" mb={2}>
            Create a New Post
          </Typography>
          <form onSubmit={handleSubmit(mutate)}>
            <TextField
              label="Title"
              fullWidth
              margin="normal"
              {...register("title", { required: "Title is required" })}
              error={!!errors.title}
              helperText={errors.title?.message}
            />
            <TextField
              label="Content"
              fullWidth
              margin="normal"
              multiline
              minRows={4}
              {...register("content", { required: "Content is required" })}
              error={!!errors.content}
              helperText={errors.content?.message}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isLoading}
              sx={{ mt: 2 }}
              fullWidth
              startIcon={isLoading ? <CircularProgress size={20} /> : null}
            >
              {isLoading ? "Posting..." : "Create Post"}
            </Button>
          </form>
        </Paper>
      </Container>
    </Box>
  );
}
