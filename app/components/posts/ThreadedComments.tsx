"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useSnackbar } from 'notistack';
import {
  Box,
  Typography,
  Button,
  IconButton,
  TextField,
  Collapse,
  Avatar,
  Stack,
  Card,
  CardContent,
  Tooltip,
  CircularProgress,
  Paper,
  Snackbar,
} from "@mui/material";
import ThumbUpAltOutlinedIcon from "@mui/icons-material/ThumbUpAltOutlined";
import ThumbDownAltOutlinedIcon from "@mui/icons-material/ThumbDownAltOutlined";
import ReplyIcon from "@mui/icons-material/Reply";
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CommentForm from './CommentForm';
import { v4 as uuidv4 } from 'uuid';
import { logger, newCorrelationId, getCorrelationId } from '@/services/logger';
import MuiButton from '@mui/material/Button';
import { motion, AnimatePresence } from 'framer-motion';

// Types
interface Comment {
  id: string;
  content: string;
  user: { id: string; name: string; avatarUrl?: string };
  createdAt: string;
  likeCount: number;
  dislikeCount: number;
  isLiked: boolean;
  isDisliked: boolean;
  replies: Comment[];
  parentId?: string;
  canEdit?: boolean;
  canDelete?: boolean;
  pending?: boolean;
  isDeleted?: boolean;
  mentionedUserIds?: string[];
}

interface ThreadedCommentsProps {
  postId: string;
  currentUserId: string;
  isAuthor?: boolean;
  initialComments?: any[];
}

const MAX_REPLY_DEPTH = 5;

function normalizeComment(raw: any): Comment {
  return {
    id: raw.id,
    content: raw.content,
    user: {
      id: raw.userId,
      name: raw.userName,
      avatarUrl: raw.userAvatar,
    },
    createdAt: raw.createdAt,
    likeCount: raw.likeCount ?? 0,
    dislikeCount: raw.dislikeCount ?? 0,
    isLiked: raw.isLiked ?? false,
    isDisliked: raw.isDisliked ?? false,
    replies: Array.isArray(raw.replies) ? raw.replies.map(normalizeComment) : [],
    parentId: raw.parentId,
    canEdit: raw.canEdit ?? false,
    canDelete: raw.canDelete ?? false,
    pending: raw.pending ?? false,
    isDeleted: raw.isDeleted ?? false,
    mentionedUserIds: raw.mentionedUserIds || [],
  };
}

const ThreadedComments: React.FC<ThreadedCommentsProps> = ({
  postId,
  currentUserId,
  isAuthor = false,
  initialComments,
}) => {
  const { data: session, status } = useSession();
  const isAuthenticated = !!session?.user?.id;
  const [comments, setComments] = useState<Comment[]>([]);
  const [pendingComments, setPendingComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({});
  const [editing, setEditing] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [correlationId, setCorrelationId] = useState<string | null>(null);
  const { enqueueSnackbar } = useSnackbar();
  const [recentlyDeleted, setRecentlyDeleted] = useState<{
    comment: Comment;
    parentId: string | null;
    timer: NodeJS.Timeout | null;
  } | null>(null);

  // When setting comments, always sort by createdAt descending (latest first)
  function setSortedComments(comments: Comment[]) {
    setComments([...comments].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  }

  useEffect(() => {
    if (initialComments) {
      setSortedComments(Array.isArray(initialComments) ? initialComments.map(normalizeComment) : []);
      setLoading(false);
    } else {
      // fallback to API fetch ONLY if not provided (e.g. post detail page)
      setLoading(true);
      fetch(`/api/v1/comments?postId=${postId}`)
        .then(res => res.ok ? res.json() : { comments: [] })
        .then(data => {
          setSortedComments(Array.isArray(data.comments) ? data.comments.map(normalizeComment) : []);
          setNextCursor(data.nextCursor);
        })
        .finally(() => setLoading(false));
    }
  }, [postId, initialComments]);

  const loadMoreComments = async () => {
    if (initialComments) return; // Don't load more if using initialComments (community feed)
    if (!nextCursor) return;
    setLoadingMore(true);
    try {
      const res = await fetch(`/api/v1/comments?postId=${postId}&limit=10&cursor=${nextCursor}`);
      if (res.ok) {
        const data = await res.json();
        setSortedComments([...(comments || []), ...(Array.isArray(data.comments) ? data.comments.map(normalizeComment) : [])]);
        setNextCursor(data.nextCursor);
      }
    } finally {
      setLoadingMore(false);
    }
  };

  const handleCommentSubmit = async (content: string, parentId?: string) => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/v1/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, parentId }),
      });
      if (res.ok) {
        const data = await res.json();
        setSortedComments(Array.isArray(data.commentsJson) ? data.commentsJson.map(normalizeComment) : []);
        enqueueSnackbar('Comment posted!', { variant: 'success' });
      } else {
        enqueueSnackbar('Failed to post comment.', { variant: 'error' });
      }
    } finally {
      setSubmitting(false);
      setReplyContent("");
      setReplyingTo(null);
    }
  };

  const handleExpand = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleReply = (parentId: string) => {
    setReplyingTo(parentId);
    setReplyContent("");
  };

  const handleEdit = (comment: Comment) => {
    setEditing(comment.id);
    setEditContent(comment.content);
  };

  // Submits the edited comment content
  const submitEdit = async (commentId: string) => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/v1/posts/${postId}/comments/${commentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editContent }),
      });
      if (res.ok) {
        const data = await res.json();
        setSortedComments(Array.isArray(data.commentsJson) ? data.commentsJson.map(normalizeComment) : []);
        setEditing(null);
        setEditContent("");
        enqueueSnackbar('Comment updated!', { variant: 'success' });
      } else {
        enqueueSnackbar('Failed to update comment.', { variant: 'error' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Helper to update a comment in the tree by id
  function updateCommentInTree(comments: Comment[], commentId: string, updater: (c: Comment) => Comment): Comment[] {
    return comments.map(comment => {
      if (comment.id === commentId) return updater(comment);
      if (comment.replies && comment.replies.length > 0) {
        return { ...comment, replies: updateCommentInTree(comment.replies, commentId, updater) };
      }
      return comment;
    });
  }

  const handleLike = async (comment: Comment) => {
    newCorrelationId();
    logger.info('Liking comment.', { commentId: comment.id });
    // Optimistically update UI
    setComments(prev => updateCommentInTree(prev, comment.id, c => ({
      ...c,
      isLiked: !c.isLiked,
      likeCount: c.isLiked ? Math.max(0, c.likeCount - 1) : c.likeCount + 1,
    })));
    try {
      await fetch(`/api/v1/comments/${comment.id}/like`, { method: "POST" });
      logger.info('Comment liked.');
    } catch (error: any) {
      logger.error('Failed to like comment.', { error: error.message, stack: error.stack });
      // Revert optimistic update on error
      setComments(prev => updateCommentInTree(prev, comment.id, c => ({
        ...c,
        isLiked: comment.isLiked,
        likeCount: comment.likeCount,
      })));
    }
  };

  const handleDislike = async (comment: Comment) => {
    newCorrelationId();
    logger.info('Disliking comment.', { commentId: comment.id });
    try {
      await fetch(`/api/v1/comments/${comment.id}/dislike`, { method: "POST" });
      logger.info('Comment disliked.');
    } catch (error: any) {
      logger.error('Failed to dislike comment.', { error: error.message, stack: error.stack });
    }
  };

  // Helper to find and remove a comment, but also return the removed comment
  function removeAndReturnComment(comments: Comment[], commentId: string): { comments: Comment[]; removed: Comment | null } {
    let removed: Comment | null = null;
    const filtered = comments.filter(comment => {
      if (comment.id === commentId) {
        removed = comment;
        return false;
      }
      return true;
    }).map(comment => ({
      ...comment,
      replies: comment.replies ? removeAndReturnComment(comment.replies, commentId).comments : [],
    }));
    return { comments: filtered, removed };
  }

  // Helper to re-insert a comment (and its replies) into the tree
  function insertComment(comments: Comment[], parentId: string | null, comment: Comment): Comment[] {
    if (!parentId) {
      return [comment, ...comments];
    }
    return comments.map(c => ({
      ...c,
      replies: c.id === parentId
        ? [comment, ...(c.replies || [])]
        : insertComment(c.replies || [], parentId, comment),
    }));
  }

  const handleDelete = async (comment: Comment) => {
    if (!window.confirm("Delete this comment?")) return;
    newCorrelationId();
    logger.info('Deleting comment.', { commentId: comment.id });
    // Remove from UI and keep a reference for undo
    setComments(prev => {
      const { comments: newComments, removed } = removeAndReturnComment(prev, comment.id);
      if (removed) {
        // Clear previous undo timer/state
        if (recentlyDeleted?.timer) clearTimeout(recentlyDeleted.timer);
        setRecentlyDeleted(null);
        // Start new undo timer
        const timer = setTimeout(() => setRecentlyDeleted(null), 5000);
        setRecentlyDeleted({ comment: removed, parentId: comment.parentId || null, timer });
      }
      return newComments;
    });
    try {
      const res = await fetch(`/api/v1/posts/${postId}/comments/${comment.id}`, { method: "DELETE" });
      logger.info('Comment deleted.');
      if (res.ok) {
        const data = await res.json();
        setComments(Array.isArray(data.commentsJson) ? data.commentsJson.map(normalizeComment) : []);
      }
    } catch (error: any) {
      logger.error('Failed to delete comment.', { error: error.message, stack: error.stack });
    }
  };

  // Undo handler
  const handleUndo = async () => {
    if (!recentlyDeleted) return;
    // Prevent duplicate undo
    setRecentlyDeleted(null);
    // Re-insert in UI only if not already present
    setComments(prev => {
      const exists = prev.some(c => c.id === recentlyDeleted.comment.id);
      if (exists) return prev;
      return insertComment(prev, recentlyDeleted.parentId, recentlyDeleted.comment);
    });
    // Re-post to backend (POST to /api/v1/posts/[postId]/comments with parentId and all fields)
    await fetch(`/api/v1/posts/${postId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: recentlyDeleted.comment.content,
        parentId: recentlyDeleted.parentId,
        mentionedUserIds: recentlyDeleted.comment.mentionedUserIds || [],
        // Add any other fields as needed
      }),
    });
    // Clear undo timer
    if (recentlyDeleted.timer) clearTimeout(recentlyDeleted.timer);
  };

  const getCommentBg = (depth: number, isCurrentUser: boolean) => {
    if (isCurrentUser) return 'rgba(24, 119, 242, 0.08)'; // Facebook blue tint for own comments
    if (depth === 0) return 'background.paper';
    return 'rgba(0,0,0,0.03)';
  };

  const renderComment = (comment: Comment, depth: number = 0) => {
    const canReply = depth < MAX_REPLY_DEPTH && comment.replies.length < 5;
    const isCurrentUser = comment.user.id === currentUserId;
    return (
      <Box key={comment.id} sx={{ ml: depth * 2, mt: depth === 0 ? 1 : 0.5 }}>
        <Card
          sx={{
            background: 'linear-gradient(135deg, #f8fafc 0%, #e3e8f0 100%)', // Soft blue/lavender gradient
            border: '1px solid #dbeafe',
            boxShadow: depth === 0 ? '0 2px 8px 0 rgba(60, 80, 180, 0.07)' : 'none',
            borderRadius: 3,
            mb: 0.5,
            opacity: comment.pending ? 0.5 : 1,
            p: 0,
          }}
        >
          <CardContent sx={{ p: 1, pb: 0.5 }}>
            <Stack direction="row" alignItems="center" spacing={1.2}>
              <Tooltip title={comment.user.name} arrow>
                <a href={`/profile/${comment.user.id}`} target="_blank" rel="noopener noreferrer">
                  <Avatar
                    src={comment.user.avatarUrl}
                    sx={{
                      width: 28,
                      height: 28,
                      border: isCurrentUser ? '2px solid #1877f2' : '2px solid transparent',
                      boxShadow: isCurrentUser ? '0 0 0 2px #e3f0ff' : undefined,
                      cursor: 'pointer',
                    }}
                  >
                    {comment.user.name[0]}
                  </Avatar>
                </a>
              </Tooltip>
              <Box flex={1}>
                <Typography fontSize="0.8rem" color="#65676b" sx={{ mt: 0.1 }}>
                  {new Date(comment.createdAt).toLocaleString()}
                </Typography>
              </Box>
              {isCurrentUser && !comment.isDeleted && (
                <Tooltip title="Edit">
                  <IconButton size="small" onClick={() => handleEdit(comment)} color="default" sx={{ color: '#444' }}>
                    <EditIcon fontSize="small" sx={{ color: '#444' }} />
                  </IconButton>
                </Tooltip>
              )}
              {isCurrentUser && !comment.isDeleted && (
                <Tooltip title="Delete">
                  <IconButton size="small" onClick={() => handleDelete(comment)} color="error" sx={{ color: '#e53935' }}>
                    <DeleteIcon fontSize="small" sx={{ color: '#e53935' }} />
                  </IconButton>
                </Tooltip>
              )}
            </Stack>
            {editing === comment.id ? (
              <Box mt={2}>
                <TextField
                  fullWidth
                  multiline
                  minRows={2}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  sx={{ mb: 1 }}
                />
                <Stack direction="row" spacing={1}>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => submitEdit(comment.id)}
                    disabled={submitting}
                  >
                    Save
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => setEditing(null)}
                  >
                    Cancel
                  </Button>
                </Stack>
              </Box>
            ) : (
              <Box display="flex" alignItems="center" mt={1}>
                <Typography fontSize="0.92rem" sx={{ flex: 1, lineHeight: 1.3, color: '#050505' }}>
                  {comment.isDeleted ? (
                    <span style={{ color: '#65676b', fontStyle: 'italic' }}>[deleted]</span>
                  ) : (
                    comment.content
                  )}
                </Typography>
                {comment.pending && (
                  <CircularProgress size={16} sx={{ ml: 1 }} />
                )}
              </Box>
            )}
            <Stack direction="row" spacing={0.7} alignItems="center" mt={1}>
              <Tooltip title="Like">
                <IconButton
                  size="small"
                  color={comment.isLiked ? "primary" : "default"}
                  onClick={() => handleLike(comment)}
                  sx={{ color: comment.isLiked ? '#1877f2' : '#65676b' }}
                >
                  <ThumbUpAltOutlinedIcon fontSize="small" sx={{ color: comment.isLiked ? '#1877f2' : '#65676b' }} />
                </IconButton>
              </Tooltip>
              <Typography fontSize="0.85rem">{comment.likeCount}</Typography>
              <Tooltip title="Dislike">
                <IconButton
                  size="small"
                  color={comment.isDisliked ? "error" : "default"}
                  onClick={() => handleDislike(comment)}
                  sx={{ color: comment.isDisliked ? '#e53935' : '#65676b' }}
                >
                  <ThumbDownAltOutlinedIcon fontSize="small" sx={{ color: comment.isDisliked ? '#e53935' : '#65676b' }} />
                </IconButton>
              </Tooltip>
              <Typography fontSize="0.85rem">{comment.dislikeCount}</Typography>
              {canReply && (
                <Tooltip title="Reply">
                  <Button
                    size="small"
                    startIcon={<ReplyIcon />}
                    onClick={() => handleReply(comment.id)}
                    sx={{ ml: 1, textTransform: 'none' }}
                  >
                    Reply
                  </Button>
                </Tooltip>
              )}
              {comment.replies.length > 0 && (
                <Tooltip title={expanded[comment.id] ? "Hide Replies" : `View Replies (${comment.replies.length})`}>
                  <Button
                    size="small"
                    startIcon={
                      <ChevronRightIcon
                        sx={{
                          transform: expanded[comment.id] ? 'rotate(90deg)' : 'rotate(0deg)',
                          transition: 'transform 0.2s',
                        }}
                      />
                    }
                    onClick={() => handleExpand(comment.id)}
                    sx={{ ml: 1, textTransform: 'none' }}
                  >
                    {expanded[comment.id]
                      ? "Hide Replies"
                      : `View Replies (${comment.replies.length})`}
                  </Button>
                </Tooltip>
              )}
            </Stack>
            {replyingTo === comment.id && (
              <Box component="form" onSubmit={e => { e.preventDefault(); if (replyContent.trim()) { handleCommentSubmit(replyContent, comment.id); } }} sx={{ display: 'flex', gap: 0.7, alignItems: 'flex-end', mt: 1, ml: 3 }}>
                <TextField
                  value={replyContent}
                  onChange={e => setReplyContent(e.target.value)}
                  placeholder="Write a reply..."
                  multiline
                  minRows={1}
                  maxRows={4}
                  fullWidth
                  sx={{ flex: 1 }}
                />
                <Button type="submit" variant="contained" size="small" disabled={!replyContent.trim() || submitting} sx={{ mb: 0.5 }}>
                  {submitting ? <CircularProgress size={16} /> : 'Submit'}
                </Button>
              </Box>
            )}
            {comment.replies.length > 0 && (
              <Collapse in={expanded[comment.id]} timeout="auto" unmountOnExit>
                <Box mt={0.5}>
                  {comment.replies.map((reply) =>
                    renderComment(reply, depth + 1)
                  )}
                </Box>
              </Collapse>
            )}
          </CardContent>
        </Card>
      </Box>
    );
  };

  return (
    <div data-testid="threaded-comments">
      <Box>
        <Typography variant="h6" fontWeight="bold" mb={2}>
          💬 Comments
        </Typography>
        <Box mb={2}>
          {isAuthenticated ? (
            <Box component="form" onSubmit={e => { e.preventDefault(); if (replyContent.trim()) { handleCommentSubmit(replyContent); } }} sx={{ display: 'flex', gap: 1, alignItems: 'flex-end', mt: 2 }}>
              <TextField
                value={replyContent}
                onChange={e => setReplyContent(e.target.value)}
                placeholder="Write a comment..."
                multiline
                minRows={1}
                maxRows={4}
                fullWidth
                sx={{ flex: 1 }}
              />
              <Button type="submit" variant="contained" size="small" disabled={!replyContent.trim() || submitting} sx={{ mb: 0.5 }}>
                {submitting ? <CircularProgress size={16} /> : 'Submit'}
              </Button>
            </Box>
          ) : (
            <Box sx={{ p: 2, border: '1px solid #eee', borderRadius: 2, bgcolor: 'rgba(255,255,255,0.04)', textAlign: 'center' }}>
              <Typography color="text.secondary">Sign in to add a comment.</Typography>
            </Box>
          )}
        </Box>
        {loading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight={120}
          >
            <CircularProgress color="primary" />
          </Box>
        ) : getTotalCommentCount(comments) === 0 ? (
          <Typography color="#bdbdbd" sx={{ textAlign: 'center', mt: 4, fontSize: '1.1rem' }}>
            {isAuthor ? 'No comments yet.' : 'No comments yet. Be the first!'}
          </Typography>
        ) : (
          <Paper elevation={2} sx={{ p: 2, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.03)' }}>
            <AnimatePresence initial={false}>
              {comments.map((comment) => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20, transition: { duration: 0.25 } }}
                  transition={{ duration: 0.25 }}
                >
                  {renderComment(comment)}
                </motion.div>
              ))}
            </AnimatePresence>
            {nextCursor && (
              <Box display="flex" justifyContent="center" mt={2}>
                <Button onClick={loadMoreComments} disabled={loadingMore} variant="outlined">
                  {loadingMore ? <CircularProgress size={20} /> : "Show More Comments"}
                </Button>
              </Box>
            )}
          </Paper>
        )}
        <Snackbar
          open={!!recentlyDeleted}
          message="Comment deleted"
          action={
            <MuiButton color="secondary" size="small" onClick={handleUndo}>
              UNDO
            </MuiButton>
          }
          onClose={() => setRecentlyDeleted(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        />
      </Box>
    </div>
  );
};

// Helper to count all comments and replies recursively
function getTotalCommentCount(comments: any[]): number {
  let count = 0;
  for (const comment of comments) {
    count += 1;
    if (comment.replies && comment.replies.length > 0) {
      count += getTotalCommentCount(comment.replies);
    }
  }
  return count;
}

export default ThreadedComments;
