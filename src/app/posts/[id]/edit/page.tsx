"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { Box, Button, Container, Paper, TextField, Typography, CircularProgress } from "@mui/material";
import { useSnackbar } from "notistack";
import dynamic from "next/dynamic";

const RichTextEditor = dynamic(() => import("@/components/ui/RichTextEditor"), { ssr: false });

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const id = typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : undefined;
  const { enqueueSnackbar } = useSnackbar();
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm();
  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState<any>(null);
  const [editorContent, setEditorContent] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    const fetchPost = async () => {
      setLoading(true);
      const res = await fetch(`/api/v1/posts/${id}`);
      if (res.ok) {
        const data = await res.json();
        setPost(data);
        setValue("title", data.title || "");
        setEditorContent(data.content || null);
      } else {
        enqueueSnackbar("Failed to load post", { variant: "error" });
        router.push("/dashboard");
      }
      setLoading(false);
    };
    fetchPost();
  }, [id, setValue, enqueueSnackbar, router]);

  const onSubmit = async (data: any) => {
    if (!id) return;
    try {
      const res = await fetch(`/api/v1/posts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, content: editorContent }),
      });
      if (res.ok) {
        enqueueSnackbar("Post updated!", { variant: "success" });
        router.push(`/posts/${id}`);
      } else {
        const err = await res.json();
        enqueueSnackbar(err.error || "Failed to update post", { variant: "error" });
      }
    } catch (error) {
      enqueueSnackbar("Unexpected error", { variant: "error" });
    }
  };

  if (loading) {
    return (
      <Box minHeight="60vh" display="flex" alignItems="center" justifyContent="center">
        <CircularProgress />
      </Box>
    );
  }

  if (!post) return null;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#0f2027", color: "white" }}>
      <Container sx={{ pt: 12, maxWidth: 600 }}>
        <Paper sx={{ p: 4, bgcolor: "rgba(255,255,255,0.07)" }}>
          <Typography variant="h5" fontWeight="bold" mb={2}>
            Edit Post
          </Typography>
          <form onSubmit={handleSubmit(onSubmit)}>
            <TextField
              label="Title"
              fullWidth
              margin="normal"
              {...register("title")}
              error={!!errors.title}
              helperText={errors.title?.message?.toString()}
            />
            <Box sx={{ my: 2 }}>
              <RichTextEditor initialContent={editorContent} onUpdate={setEditorContent} />
            </Box>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isSubmitting}
              sx={{ mt: 2 }}
              fullWidth
              startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </Paper>
      </Container>
    </Box>
  );
} 