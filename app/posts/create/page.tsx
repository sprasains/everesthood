"use client";
import { Box, Button, Container, Paper, TextField, Typography, CircularProgress } from "@mui/material";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { useState } from "react";
import MenuItem from "@mui/material/MenuItem";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Image from 'next/image';

const POST_TYPES = [
  { label: "Text", value: "TEXT" },
  { label: "Poll", value: "POLL" },
  { label: "Link", value: "LINK" },
  { label: "Prediction", value: "PREDICTION" },
];

const RichTextEditor = () => <div>RichTextEditor placeholder</div>;

export default function CreatePostPage() {
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [mediaInput, setMediaInput] = useState("");
  const [type, setType] = useState("TEXT");
  const router = useRouter();
  const [editorContent, setEditorContent] = useState<any>(null);

  const { mutate, status } = useMutation({
    mutationFn: async (data: any) => {
      const mentions: any[] = [];
      const findMentions = (node: any) => {
        if (node?.type === "mention" && node.attrs?.id) {
          mentions.push(node.attrs.id);
        }
        if (node?.content) {
          node.content.forEach(findMentions);
        }
      };
      findMentions(editorContent);
      const mentionedUserIds = Array.from(new Set(mentions));
      const res = await fetch("/api/v1/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, type, mediaUrls, content: editorContent, mentionedUserIds }),
      });
      if (!res.ok) throw new Error("Failed to create post");
      return res.json();
    },
    onSuccess: (data) => {
      enqueueSnackbar("Post created successfully!", { variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["community-posts"] });
      let userId = null;
      try {
        userId = JSON.parse(localStorage.getItem('currentUser') || '{}').id;
      } catch {}
      if (userId) {
        queryClient.invalidateQueries({ queryKey: ["userPosts", userId] });
      } else {
        queryClient.invalidateQueries({ queryKey: ["userPosts"] });
      }
      if (data?.post?.id) {
        router.push(`/posts/${data.post.id}`);
      }
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
            <Box sx={{ my: 2 }}>
              <RichTextEditor initialContent={editorContent} onUpdate={setEditorContent} />
            </Box>
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
                    <Image src={url} alt="media" width={80} height={80} style={{ objectFit: 'cover', borderRadius: 8 }} />
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
              {status === 'pending' ? "Posting..." : "Publish"}
            </Button>
          </form>
        </Paper>
      </Container>
    </Box>
  );
}
