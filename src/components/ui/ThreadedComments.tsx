import React, { useEffect, useState } from "react";
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
} from "@mui/material";
import ThumbUpAltOutlinedIcon from "@mui/icons-material/ThumbUpAltOutlined";
import ThumbDownAltOutlinedIcon from "@mui/icons-material/ThumbDownAltOutlined";
import ReplyIcon from "@mui/icons-material/Reply";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

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
}

interface ThreadedCommentsProps {
  postId: string;
  currentUserId: string;
}

const MAX_REPLY_DEPTH = 5;

const ThreadedComments: React.FC<ThreadedCommentsProps> = ({
  postId,
  currentUserId,
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({});
  const [editing, setEditing] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/comments?postId=${postId}`);
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } finally {
      setLoading(false);
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

  const handleLike = async (comment: Comment) => {
    await fetch(`/api/v1/comments/${comment.id}/like`, { method: "POST" });
    fetchComments();
  };

  const handleDislike = async (comment: Comment) => {
    await fetch(`/api/v1/comments/${comment.id}/dislike`, { method: "POST" });
    fetchComments();
  };

  const handleDelete = async (comment: Comment) => {
    if (!window.confirm("Delete this comment?")) return;
    await fetch(`/api/v1/comments/${comment.id}`, { method: "DELETE" });
    fetchComments();
  };

  const submitReply = async (parentId: string) => {
    if (!replyContent.trim()) return;
    setSubmitting(true);
    await fetch(`/api/v1/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId, parentId, content: replyContent }),
    });
    setReplyingTo(null);
    setReplyContent("");
    setSubmitting(false);
    fetchComments();
  };

  const submitEdit = async (commentId: string) => {
    if (!editContent.trim()) return;
    setSubmitting(true);
    await fetch(`/api/v1/comments/${commentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: editContent }),
    });
    setEditing(null);
    setEditContent("");
    setSubmitting(false);
    fetchComments();
  };

  const renderComment = (comment: Comment, depth: number = 0) => {
    const canReply = depth < MAX_REPLY_DEPTH && comment.replies.length < 5;
    return (
      <Box key={comment.id} sx={{ ml: depth * 3, mt: 2 }}>
        <Card
          sx={{
            background: "rgba(255,255,255,0.07)",
            borderRadius: 2,
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            mb: 1,
          }}
        >
          <CardContent sx={{ p: 2 }}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Avatar
                src={comment.user.avatarUrl}
                sx={{ width: 32, height: 32 }}
              >
                {comment.user.name[0]}
              </Avatar>
              <Box flex={1}>
                <Typography fontWeight="bold" fontSize="1rem">
                  {comment.user.name}
                </Typography>
                <Typography fontSize="0.85rem" color="#bdbdbd">
                  {new Date(comment.createdAt).toLocaleString()}
                </Typography>
              </Box>
              {comment.canEdit && (
                <Tooltip title="Edit">
                  <IconButton size="small" onClick={() => handleEdit(comment)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              {comment.canDelete && (
                <Tooltip title="Delete">
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(comment)}
                  >
                    <DeleteIcon fontSize="small" />
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
              <Typography mt={2} fontSize="1.05rem">
                {comment.content}
              </Typography>
            )}
            <Stack direction="row" spacing={1} alignItems="center" mt={2}>
              <Tooltip title="Like">
                <IconButton
                  size="small"
                  color={comment.isLiked ? "primary" : "default"}
                  onClick={() => handleLike(comment)}
                >
                  <ThumbUpAltOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Typography fontSize="0.95rem">{comment.likeCount}</Typography>
              <Tooltip title="Dislike">
                <IconButton
                  size="small"
                  color={comment.isDisliked ? "error" : "default"}
                  onClick={() => handleDislike(comment)}
                >
                  <ThumbDownAltOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Typography fontSize="0.95rem">{comment.dislikeCount}</Typography>
              {canReply && (
                <Button
                  size="small"
                  startIcon={<ReplyIcon />}
                  onClick={() => handleReply(comment.id)}
                  sx={{ ml: 1 }}
                >
                  Reply
                </Button>
              )}
              {comment.replies.length > 0 && (
                <Button
                  size="small"
                  startIcon={
                    expanded[comment.id] ? (
                      <ExpandLessIcon />
                    ) : (
                      <ExpandMoreIcon />
                    )
                  }
                  onClick={() => handleExpand(comment.id)}
                  sx={{ ml: 1 }}
                >
                  {expanded[comment.id]
                    ? "Hide Replies"
                    : `View Replies (${comment.replies.length})`}
                </Button>
              )}
            </Stack>
            {replyingTo === comment.id && (
              <Box mt={2}>
                <TextField
                  fullWidth
                  multiline
                  minRows={2}
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write your reply..."
                  sx={{ mb: 1 }}
                />
                <Stack direction="row" spacing={1}>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => submitReply(comment.id)}
                    disabled={submitting}
                  >
                    Reply
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => setReplyingTo(null)}
                  >
                    Cancel
                  </Button>
                </Stack>
              </Box>
            )}
            {comment.replies.length > 0 && (
              <Collapse in={expanded[comment.id]} timeout="auto" unmountOnExit>
                <Box mt={2}>
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

  // Top-level comment form
  const [newComment, setNewComment] = useState("");
  const submitNewComment = async () => {
    if (!newComment.trim()) return;
    setSubmitting(true);
    await fetch(`/api/v1/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId, content: newComment }),
    });
    setNewComment("");
    setSubmitting(false);
    fetchComments();
  };

  return (
    <div data-testid="threaded-comments">
      <Box>
        <Typography variant="h6" fontWeight="bold" mb={2}>
          💬 Comments
        </Typography>
        <Box mb={2}>
          <TextField
            fullWidth
            multiline
            minRows={2}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            sx={{ mb: 1 }}
          />
          <Button
            variant="contained"
            onClick={submitNewComment}
            disabled={submitting}
          >
            Post
          </Button>
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
        ) : comments.length === 0 ? (
          <Typography color="#bdbdbd">No comments yet. Be the first!</Typography>
        ) : (
          comments.map((comment) => renderComment(comment))
        )}
      </Box>
    </div>
  );
};

export default ThreadedComments;
