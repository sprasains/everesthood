"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Box, Button, Container, Paper, TextField, Typography, CircularProgress } from "@mui/material";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import dynamic from "next/dynamic";

const RichTextEditor = () => <div>RichTextEditor placeholder</div>;

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params?.id as string;
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();
  const [editorContent, setEditorContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPost() {
      setLoading(true);
      const res = await fetch(`/api/v1/posts/${postId}`);
      if (!res.ok) {
        enqueueSnackbar("Failed to load post", { variant: "error" });
        router.push("/news-feed");
        return;
      }
      const post = await res.json();
      setValue("title", post.title);
      setEditorContent(post.content);
      setLoading(false);
    }
    if (postId) fetchPost();
  }, [postId, setValue, router, enqueueSnackbar]);

  const { mutate, status } = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(`/api/v1/posts/${postId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, content: editorContent }),
      });
      if (!res.ok) throw new Error("Failed to update post");
      return res.json();
    },
    onSuccess: (data) => {
      enqueueSnackbar("Post updated!", { variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["community-posts"] });
      if (data?.post?.id) {
        router.push(`/posts/${data.post.id}`);
      } else {
        router.push("/news-feed");
      }
    },
    onError: () => {
      enqueueSnackbar("Failed to update post", { variant: "error" });
    }
  });

  if (loading) {
    return <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#0f2027", color: "white" }}>
      <Container sx={{ pt: 12, maxWidth: 600 }}>
        <Paper sx={{ p: 4, bgcolor: "rgba(255,255,255,0.07)" }}>
          <Typography variant="h5" fontWeight="bold" mb={2}>
            Edit Post
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
            <Box sx={{ my: 2 }}>
              <RichTextEditor />
            </Box>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={status === 'pending'}
              sx={{ mt: 2 }}
              fullWidth
              startIcon={status === 'pending' ? <CircularProgress size={20} /> : null}
            >
              {status === 'pending' ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </Paper>
      </Container>
    </Box>
  );
} 