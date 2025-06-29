"use client";
import { Card, CardContent, CardActions, CardMedia, Box, Avatar, Typography, Link as MuiLink, Button, TextField, IconButton } from "@mui/material";
import { Post, User, NewsArticle } from "@prisma/client";
import Link from "next/link";
import ThreadedComments from "./ThreadedComments";
import { useState, useEffect, useRef } from "react";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import CircularProgress from "@mui/material/CircularProgress";
import { useSession } from "next-auth/react";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import RichTextRenderer from './RichTextRenderer';

type PostWithDetails = Post & {
  author: Partial<User>;
  newsArticle?: NewsArticle | null;
  likeCount?: number; // Add likeCount for UI
};

interface PostCardProps {
  post: PostWithDetails;
}

export default function PostCard({ post }: PostCardProps) {
  const [refreshComments, setRefreshComments] = useState(0);
  const [likeCount, setLikeCount] = useState(post.likeCount ?? 0);
  const [liked, setLiked] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const { data: session } = useSession();
  const isAuthor = post.authorId === session?.user?.id;
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const [pop, setPop] = useState(false); // For pop animation

  // Edit form
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: { title: post.title, content: post.content }
  });
  const editMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(`/api/v1/posts/${post.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update post');
      return res.json();
    },
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: ['community-posts'] });
      const previousPosts = queryClient.getQueryData<any[]>(['community-posts']);
      queryClient.setQueryData(['community-posts'], (old: any[] = []) =>
        old.map((p) => p.id === post.id ? { ...p, ...data } : p)
      );
      return { previousPosts };
    },
    onError: (_err, _data, context) => {
      if (context?.previousPosts) {
        queryClient.setQueryData(['community-posts'], context.previousPosts);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['community-posts'] });
    },
    onSuccess: () => {
      setIsEditDialogOpen(false);
      enqueueSnackbar('Post updated!', { variant: 'success' });
    },
  });
  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/v1/posts/${post.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete post');
      return res.json();
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['community-posts'] });
      const previousPosts = queryClient.getQueryData<any[]>(['community-posts']);
      queryClient.setQueryData(['community-posts'], (old: any[] = []) => old.filter((p) => p.id !== post.id));
      return { previousPosts };
    },
    onError: (_err, _data, context) => {
      if (context?.previousPosts) {
        queryClient.setQueryData(['community-posts'], context.previousPosts);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['community-posts'] });
    },
    onSuccess: () => {
      setIsDeleteDialogOpen(false);
      enqueueSnackbar('Post deleted!', { variant: 'success' });
    },
  });

  // Fetch like status for current user
  useEffect(() => {
    async function fetchLikeStatus() {
      if (!session?.user?.id) return;
      const res = await fetch(`/api/v1/posts/${post.id}/like`, { method: "GET" });
      if (res.ok) {
        const data = await res.json();
        setLiked(!!data.liked);
        if (typeof data.likeCount === "number") setLikeCount(data.likeCount);
      } else {
        // fallback: fetch like count directly if available
        setLiked(false);
        setLikeCount(post.likeCount ?? 0);
      }
    }
    fetchLikeStatus();
  }, [post.id, session?.user?.id, post.likeCount]);

  // Optimistic like mutation
  const likeMutation = useMutation({
    mutationFn: async (action: 'like' | 'unlike') => {
      const res = await fetch(`/api/v1/posts/${post.id}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) throw new Error('Failed to like post');
      return res.json();
    },
    onMutate: async (action) => {
      await queryClient.cancelQueries({ queryKey: ['community-posts'] });
      const previousPosts = queryClient.getQueryData<any[]>(['community-posts']);
      // Optimistically update like state/count for this post
      setLiked(action === 'like');
      setLikeCount((c) => action === 'like' ? c + 1 : Math.max(0, c - 1));
      setPop(true);
      return { previousPosts };
    },
    onError: (_err, action, context) => {
      if (context?.previousPosts) {
        queryClient.setQueryData(['community-posts'], context.previousPosts);
      }
      setLiked((prev) => !prev);
      setLikeCount((c) => liked ? c + 1 : Math.max(0, c - 1));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['community-posts'] });
    },
    onSuccess: (data) => {
      setLiked(data.liked);
      setLikeCount(data.likeCount);
    },
  });

  const handleLike = () => {
    if (likeLoading) return;
    setLikeLoading(true);
    likeMutation.mutate(liked ? 'unlike' : 'like', {
      onSettled: () => setLikeLoading(false),
    });
  };

  // Pop animation reset
  useEffect(() => {
    if (pop) {
      const timeout = setTimeout(() => setPop(false), 200);
      return () => clearTimeout(timeout);
    }
  }, [pop]);

  const handleComment = () => setRefreshComments((c) => c + 1);

  return (
    <Card
      data-testid="post-card"
      sx={{
        p: 0,
        bgcolor: "rgba(255, 255, 255, 0.05)",
        borderRadius: 3,
        mb: 2,
        boxShadow: 3,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <Avatar src={post.author.image || "https://i.pravatar.cc/150?u=everhood"} />
          <Box>
            <Typography fontWeight="bold">{post.author.name} {likeCount >= 10 && <span style={{marginLeft: 6, fontSize: 18}} title="Trending"><span role="img" aria-label="fire">🔥</span> Trending</span>}</Typography>
            <Typography variant="caption" color="text.secondary">
              {new Date(post.createdAt).toLocaleString()}
            </Typography>
          </Box>
        </Box>
        {post.title && (
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
            {post.title}
          </Typography>
        )}
        {/* Render rich text content safely */}
        <Box sx={{ my: 2 }}>
          {post.isDeleted ? (
            <Typography color="text.secondary" fontStyle="italic">[deleted]</Typography>
          ) : (
            <RichTextRenderer content={post.content} />
          )}
        </Box>
        {post.mediaUrls && post.mediaUrls.length > 0 && (
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
            {post.mediaUrls.map((url: string, i: number) => (
              <CardMedia
                key={i}
                component="img"
                image={url}
                sx={{ width: 120, height: 120, objectFit: "cover", borderRadius: 2 }}
              />
            ))}
          </Box>
        )}
        {post.newsArticle && (
          <Card variant="outlined" sx={{ p: 2, mt: 2, borderColor: "rgba(255,255,255,0.2)" }}>
            <MuiLink
              href={post.newsArticle.link}
              target="_blank"
              rel="noopener noreferrer"
              underline="none"
              sx={{ display: 'flex', alignItems: 'center', gap: 2 }}
            >
              {post.newsArticle.imageUrl && (
                <CardMedia
                  component="img"
                  image={post.newsArticle.imageUrl}
                  sx={{ width: 80, height: 80, objectFit: "cover", borderRadius: 1, flexShrink: 0 }}
                />
              )}
              <Box sx={{ flex: 1 }}>
                <Typography fontWeight="bold" sx={{ mt: 0 }}>
                  {post.newsArticle.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {post.newsArticle.sourceName}
                </Typography>
                <Button
                  href={post.newsArticle.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  size="small"
                  variant="outlined"
                  sx={{ mt: 1 }}
                >
                  Read Original
                </Button>
              </Box>
            </MuiLink>
          </Card>
        )}
      </CardContent>
      <CardActions sx={{ display: 'flex', gap: 2, alignItems: 'center', px: 3, pb: 2 }}>
        <MuiLink component={Link} href={`/posts/${post.id}`} underline="none">
          <Button variant="outlined" size="small" color="primary" startIcon={<span role="img" aria-label="comment">💬</span>}>
            Drop a comment
          </Button>
        </MuiLink>
        <Button
          variant={liked ? "contained" : "outlined"}
          size="small"
          color="secondary"
          onClick={handleLike}
          startIcon={
            likeLoading ? (
              <CircularProgress size={18} />
            ) : liked ? (
              <FavoriteIcon
                color="error"
                sx={{
                  transition: 'transform 0.2s',
                  transform: pop ? 'scale(1.4)' : liked ? 'scale(1.2)' : 'scale(1)'
                }}
              />
            ) : (
              <FavoriteBorderIcon />
            )
          }
          disabled={likeLoading}
          sx={{ transition: 'background 0.2s' }}
        >
          {liked ? 'Liked!' : 'Like'} {likeCount > 0 && likeCount}
        </Button>
        <Button
          variant="outlined"
          size="small"
          color="info"
          startIcon={<span role="img" aria-label="reshare">🔁</span>}
          disabled
          title="Reshare coming soon!"
        >
          Reshare
        </Button>
        <Button
          component={Link}
          href={`/posts/${post.id}`}
          variant="text"
          size="small"
          color="info"
        >
          View Post
        </Button>
        {isAuthor && !post.isDeleted && (
          <>
            <IconButton onClick={e => setAnchorEl(e.currentTarget)}>
              <MoreVertIcon />
            </IconButton>
            <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={() => setAnchorEl(null)}>
              <MenuItem onClick={() => { setIsEditDialogOpen(true); setAnchorEl(null); }}>
                <EditIcon fontSize="small" sx={{ mr: 1 }} /> Edit
              </MenuItem>
              <MenuItem onClick={() => { setIsDeleteDialogOpen(true); setAnchorEl(null); }}>
                <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Delete
              </MenuItem>
            </Menu>
          </>
        )}
      </CardActions>
      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onClose={() => setIsEditDialogOpen(false)}>
        <DialogTitle>Edit Post</DialogTitle>
        <form onSubmit={handleSubmit((data) => editMutation.mutate(data))}>
          <DialogContent>
            <TextField
              label="Title"
              fullWidth
              margin="normal"
              defaultValue={post.title}
              {...register('title' as const)}
            />
            <TextField
              label="Content"
              fullWidth
              margin="normal"
              multiline
              minRows={4}
              defaultValue={post.content}
              {...register('content', { required: 'Content is required' })}
              error={!!errors.content}
              helperText={errors.content?.message}
            />
            {/* Optionally add mediaUrls and type fields here for editing */}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={editMutation.status === 'pending'}>
              {editMutation.status === 'pending' ? <CircularProgress size={20} /> : 'Save'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)}>
        <DialogTitle>Delete Post?</DialogTitle>
        <DialogContent>
          <Typography>Are you sure? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={() => deleteMutation.mutate()} color="error" variant="contained" disabled={deleteMutation.status === 'pending'}>
            {deleteMutation.status === 'pending' ? <CircularProgress size={20} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
      <CardContent sx={{ pt: 0 }}>
        {/* Threaded Comments Section (Facebook-style) */}
        <ThreadedComments postId={post.id} currentUserId={session?.user?.id || ""} />
        {/* Tipping Section */}
        <Box sx={{ display: 'flex', gap: 2, mt: 2, alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Support the creator by tipping! <span role="img" aria-label="money">💸</span>
          </Typography>
          <Button
            variant="contained"
            size="small"
            color="success"
            onClick={() => enqueueSnackbar('Tipping coming soon! Stay tuned for more ways to support your faves! 🚀', { variant: 'info' })}
          >
            Tip Creator
          </Button>
        </Box>
        {/* End of Tipping Section */}
      </CardContent>
    </Card>
  );
}
