"use client";

import { Box, Container, Typography, Paper, Avatar, Button, CircularProgress, Chip, IconButton, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert, Divider, Tooltip } from "@mui/material";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from 'next/link';
import ThreadedComments from '@/components/posts/ThreadedComments';
import {
  ArrowBackIcon,
  MoreVertIcon,
  EditIcon,
  DeleteIcon,
  ShareIcon,
  BookmarkIcon,
  ThumbUpIcon,
  CommentIcon,
  VisibilityIcon,
  PublicIcon,
  LockIcon
} from "@mui/icons-material";

interface Post {
  id: string;
  title?: string;
  content: string;
  type: string;
  tags: string[];
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string;
    image?: string;
    level: number;
    xp: number;
  };
  comments: any[];
  _count: {
    comments: number;
  };
}

export default function PostPage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const postId = params?.id as string | undefined;
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (!postId) return;
    fetchPost();
  }, [postId]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/posts/${postId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Post not found');
        } else if (response.status === 403) {
          setError('You do not have permission to view this post');
        } else {
          setError('Failed to load post');
        }
        return;
      }
      
      const data = await response.json();
      setPost(data);
      setEditContent(data.content);
    } catch (err) {
      setError('An error occurred while loading the post');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditing(true);
    setAnchorEl(null);
  };

  const handleSaveEdit = async () => {
    if (!post || !editContent.trim()) return;

    try {
      const response = await fetch(`/api/posts/${post.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editContent })
      });

      if (!response.ok) {
        throw new Error('Failed to update post');
      }

      const updatedPost = await response.json();
      setPost(updatedPost);
      setEditing(false);
    } catch (err) {
      setError('Failed to update post');
    }
  };

  const handleDelete = async () => {
    if (!post) return;

    try {
      const response = await fetch(`/api/posts/${post.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete post');
      }

      router.push('/community');
    } catch (err) {
      setError('Failed to delete post');
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
            <CircularProgress sx={{ mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Loading Post...
            </Typography>
          </Paper>
        </motion.div>
      </Box>
    );
  }

  if (error || !post) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        pt: 8,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Paper sx={{ 
            p: 6, 
            textAlign: 'center', 
            borderRadius: 3,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            maxWidth: 500
          }}>
            <Typography variant="h4" sx={{ mb: 2, color: 'error.main' }}>
              Post Not Found
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
              {error || 'This post is not available or has been removed.'}
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<ArrowBackIcon />}
              component={Link} 
              href="/community"
              sx={{ borderRadius: 2 }}
            >
              Back to Community
            </Button>
          </Paper>
        </motion.div>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      pt: 8, // Account for navbar
    }}>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Back Button */}
          <Button
            startIcon={<ArrowBackIcon />}
            component={Link}
            href="/community"
            sx={{ 
              mb: 3, 
              color: 'white',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
            }}
          >
            Back to Community
          </Button>

          {/* Post Card */}
          <Paper sx={{ 
            mb: 4,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: 3,
            overflow: 'hidden'
          }}>
            {/* Post Header */}
            <Box sx={{ p: 3, borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar 
                    src={post.author.image} 
                    sx={{ width: 48, height: 48 }}
                  >
                    {post.author.name?.charAt(0) || 'U'}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      {post.author.name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Level {post.author.level} • {formatDate(post.createdAt)}
                      </Typography>
                      {post.isPublic ? (
                        <Tooltip title="Public">
                          <PublicIcon fontSize="small" color="action" />
                        </Tooltip>
                      ) : (
                        <Tooltip title="Private">
                          <LockIcon fontSize="small" color="action" />
                        </Tooltip>
                      )}
                    </Box>
                  </Box>
                </Box>
                
                {session?.user?.id === post.author.id && (
                  <IconButton onClick={handleMenuOpen}>
                    <MoreVertIcon />
                  </IconButton>
                )}
              </Box>

              {/* Post Title */}
              {post.title && (
                <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
                  {post.title}
                </Typography>
              )}

              {/* Post Content */}
              {editing ? (
                <Box>
                  <TextField
                    fullWidth
                    multiline
                    rows={6}
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    placeholder="What's on your mind?"
                    sx={{ mb: 2 }}
                  />
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="contained"
                      onClick={handleSaveEdit}
                      disabled={!editContent.trim()}
                    >
                      Save
                    </Button>
                    <Button
                      onClick={() => {
                        setEditing(false);
                        setEditContent(post.content);
                      }}
                    >
                      Cancel
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Typography 
                  variant="body1" 
                  sx={{ 
                    whiteSpace: 'pre-wrap', 
                    lineHeight: 1.6,
                    fontSize: '1.1rem'
                  }}
                >
                  {post.content}
                </Typography>
              )}

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
                  {post.tags.map((tag, index) => (
                    <Chip
                      key={index}
                      label={`#${tag}`}
                      size="small"
                      variant="outlined"
                      color="primary"
                    />
                  ))}
                </Box>
              )}
            </Box>

            {/* Post Actions */}
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button
                startIcon={<ThumbUpIcon />}
                sx={{ color: 'text.secondary' }}
              >
                Like
              </Button>
              <Button
                startIcon={<CommentIcon />}
                sx={{ color: 'text.secondary' }}
              >
                {post._count.comments} Comments
              </Button>
              <Button
                startIcon={<ShareIcon />}
                sx={{ color: 'text.secondary' }}
              >
                Share
              </Button>
              <Button
                startIcon={<BookmarkIcon />}
                sx={{ color: 'text.secondary' }}
              >
                Save
              </Button>
            </Box>
          </Paper>

          {/* Comments Section */}
          <Paper sx={{ 
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: 3,
            p: 3
          }}>
            <ThreadedComments postId={post.id} currentUserId={session?.user?.id || ''} />
          </Paper>

          {/* Context Menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleEdit}>
              <EditIcon sx={{ mr: 1 }} />
              Edit Post
            </MenuItem>
            <MenuItem onClick={() => setDeleteDialogOpen(true)}>
              <DeleteIcon sx={{ mr: 1 }} />
              Delete Post
            </MenuItem>
          </Menu>

          {/* Delete Confirmation Dialog */}
          <Dialog
            open={deleteDialogOpen}
            onClose={() => setDeleteDialogOpen(false)}
          >
            <DialogTitle>Delete Post</DialogTitle>
            <DialogContent>
              <Typography>
                Are you sure you want to delete this post? This action cannot be undone.
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                color="error"
                variant="contained"
                onClick={handleDelete}
              >
                Delete
              </Button>
            </DialogActions>
          </Dialog>
        </motion.div>
      </Container>
    </Box>
  );
}
