"use client";
import { useState, useEffect } from 'react';
import { Box, Typography, Rating, Avatar, Card, CardContent, Stack, Chip, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Divider, LinearProgress } from '@mui/material';
import { useSession } from 'next-auth/react';
import StarIcon from '@mui/icons-material/Star';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import ReplyIcon from '@mui/icons-material/Reply';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { toast } from 'react-hot-toast';

interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title: string;
  content: string;
  helpful: number;
  notHelpful: number;
  createdAt: string;
  updatedAt: string;
  isVerified: boolean;
  replies?: Reply[];
}

interface Reply {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
  isOfficial: boolean;
}

interface AgentReviewsProps {
  agentId: string;
  agentName: string;
  onRatingChange?: (newRating: number) => void;
}

export default function AgentReviews({ agentId, agentName, onRatingChange }: AgentReviewsProps) {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [showReplyDialog, setShowReplyDialog] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Review | null>(null);
  
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: '',
    content: ''
  });

  const [replyForm, setReplyForm] = useState({
    content: ''
  });

  useEffect(() => {
    fetchReviews();
  }, [agentId]);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/agents/${agentId}/reviews`);
      if (!response.ok) throw new Error('Failed to fetch reviews');
      const data = await response.json();
      setReviews(data.reviews || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!session?.user?.id) {
      toast.error('Please sign in to leave a review');
      return;
    }

    if (!reviewForm.title.trim() || !reviewForm.content.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`/api/agents/${agentId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: reviewForm.rating,
          title: reviewForm.title,
          content: reviewForm.content
        })
      });

      if (!response.ok) throw new Error('Failed to submit review');
      
      toast.success('Review submitted successfully!');
      setShowReviewDialog(false);
      setReviewForm({ rating: 5, title: '', content: '' });
      fetchReviews();
      
      // Update overall rating
      if (onRatingChange) {
        const newAvgRating = reviews.length > 0 
          ? (reviews.reduce((sum, r) => sum + r.rating, 0) + reviewForm.rating) / (reviews.length + 1)
          : reviewForm.rating;
        onRatingChange(newAvgRating);
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = async () => {
    if (!session?.user?.id || !replyingTo) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/agents/${agentId}/reviews/${replyingTo.id}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: replyForm.content
        })
      });

      if (!response.ok) throw new Error('Failed to submit reply');
      
      toast.success('Reply submitted successfully!');
      setShowReplyDialog(false);
      setReplyForm({ content: '' });
      setReplyingTo(null);
      fetchReviews();
    } catch (error) {
      console.error('Error submitting reply:', error);
      toast.error('Failed to submit reply');
    } finally {
      setSubmitting(false);
    }
  };

  const handleHelpfulVote = async (reviewId: string, isHelpful: boolean) => {
    if (!session?.user?.id) {
      toast.error('Please sign in to vote');
      return;
    }

    try {
      const response = await fetch(`/api/agents/${agentId}/reviews/${reviewId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isHelpful })
      });

      if (!response.ok) throw new Error('Failed to vote');
      
      fetchReviews();
    } catch (error) {
      console.error('Error voting:', error);
      toast.error('Failed to vote');
    }
  };

  const handleEditReview = (review: Review) => {
    setEditingReview(review);
    setReviewForm({
      rating: review.rating,
      title: review.title,
      content: review.content
    });
    setShowReviewDialog(true);
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;

    try {
      const response = await fetch(`/api/agents/${agentId}/reviews/${reviewId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete review');
      
      toast.success('Review deleted successfully!');
      fetchReviews();
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Failed to delete review');
    }
  };

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    percentage: reviews.length > 0 ? (reviews.filter(r => r.rating === star).length / reviews.length) * 100 : 0
  }));

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>Reviews</Typography>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Reviews & Ratings</Typography>
        {session?.user?.id && (
          <Button
            variant="contained"
            onClick={() => setShowReviewDialog(true)}
            startIcon={<StarIcon />}
          >
            Write Review
          </Button>
        )}
      </Box>

      {/* Rating Summary */}
      <Card sx={{ mb: 3, p: 3 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
          <Box sx={{ textAlign: 'center', minWidth: 200 }}>
            <Typography variant="h2" fontWeight="bold" color="primary">
              {averageRating.toFixed(1)}
            </Typography>
            <Rating value={averageRating} readOnly precision={0.1} size="large" />
            <Typography variant="body2" color="text.secondary">
              Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}
            </Typography>
          </Box>

          <Box sx={{ flex: 1 }}>
            {ratingDistribution.map(({ star, count, percentage }) => (
              <Box key={star} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" sx={{ minWidth: 20 }}>
                  {star}
                </Typography>
                <StarIcon sx={{ fontSize: 16, color: 'gold', mx: 1 }} />
                <LinearProgress
                  variant="determinate"
                  value={percentage}
                  sx={{ flex: 1, height: 8, borderRadius: 4, mr: 2 }}
                />
                <Typography variant="body2" color="text.secondary" sx={{ minWidth: 40 }}>
                  {count}
                </Typography>
              </Box>
            ))}
          </Box>
        </Stack>
      </Card>

      {/* Reviews List */}
      <Stack spacing={2}>
        {reviews.map((review) => (
          <Card key={review.id} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
              <Avatar src={review.userAvatar} sx={{ width: 48, height: 48 }}>
                {review.userName.charAt(0).toUpperCase()}
              </Avatar>
              
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {review.userName}
                  </Typography>
                  {review.isVerified && (
                    <Chip label="Verified" size="small" color="success" />
                  )}
                  <Rating value={review.rating} readOnly size="small" />
                  <Typography variant="body2" color="text.secondary">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>

                <Typography variant="h6" gutterBottom>
                  {review.title}
                </Typography>

                <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
                  {review.content}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Button
                    size="small"
                    startIcon={<ThumbUpIcon />}
                    onClick={() => handleHelpfulVote(review.id, true)}
                  >
                    Helpful ({review.helpful})
                  </Button>
                  
                  <Button
                    size="small"
                    startIcon={<ThumbDownIcon />}
                    onClick={() => handleHelpfulVote(review.id, false)}
                  >
                    Not Helpful ({review.notHelpful})
                  </Button>

                  <Button
                    size="small"
                    startIcon={<ReplyIcon />}
                    onClick={() => {
                      setReplyingTo(review);
                      setShowReplyDialog(true);
                    }}
                  >
                    Reply
                  </Button>

                  {session?.user?.id === review.userId && (
                    <>
                      <Button
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => handleEditReview(review)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDeleteReview(review.id)}
                        color="error"
                      >
                        Delete
                      </Button>
                    </>
                  )}
                </Box>

                {/* Replies */}
                {review.replies && review.replies.length > 0 && (
                  <Box sx={{ mt: 2, ml: 4 }}>
                    <Divider sx={{ mb: 2 }} />
                    {review.replies.map((reply) => (
                      <Box key={reply.id} sx={{ display: 'flex', gap: 2, mb: 2 }}>
                        <Avatar src={reply.userAvatar} sx={{ width: 32, height: 32 }}>
                          {reply.userName.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Typography variant="subtitle2" fontWeight="bold">
                              {reply.userName}
                            </Typography>
                            {reply.isOfficial && (
                              <Chip label="Official" size="small" color="primary" />
                            )}
                            <Typography variant="caption" color="text.secondary">
                              {new Date(reply.createdAt).toLocaleDateString()}
                            </Typography>
                          </Box>
                          <Typography variant="body2">
                            {reply.content}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            </Box>
          </Card>
        ))}
      </Stack>

      {reviews.length === 0 && (
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No reviews yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Be the first to review this agent!
          </Typography>
          {session?.user?.id && (
            <Button
              variant="contained"
              onClick={() => setShowReviewDialog(true)}
              startIcon={<StarIcon />}
            >
              Write First Review
            </Button>
          )}
        </Card>
      )}

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onClose={() => setShowReviewDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingReview ? 'Edit Review' : `Review ${agentName}`}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Rating *
            </Typography>
            <Rating
              value={reviewForm.rating}
              onChange={(_, value) => setReviewForm(prev => ({ ...prev, rating: value || 5 }))}
              size="large"
            />
          </Box>

          <TextField
            fullWidth
            label="Review Title"
            value={reviewForm.title}
            onChange={(e) => setReviewForm(prev => ({ ...prev, title: e.target.value }))}
            sx={{ mt: 3 }}
            required
          />

          <TextField
            fullWidth
            label="Your Review"
            multiline
            rows={4}
            value={reviewForm.content}
            onChange={(e) => setReviewForm(prev => ({ ...prev, content: e.target.value }))}
            sx={{ mt: 3 }}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowReviewDialog(false)}>Cancel</Button>
          <Button
            onClick={handleSubmitReview}
            variant="contained"
            disabled={submitting || !reviewForm.title.trim() || !reviewForm.content.trim()}
          >
            {submitting ? 'Submitting...' : editingReview ? 'Update Review' : 'Submit Review'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reply Dialog */}
      <Dialog open={showReplyDialog} onClose={() => setShowReplyDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reply to Review</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Your Reply"
            multiline
            rows={3}
            value={replyForm.content}
            onChange={(e) => setReplyForm(prev => ({ ...prev, content: e.target.value }))}
            sx={{ mt: 2 }}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowReplyDialog(false)}>Cancel</Button>
          <Button
            onClick={handleSubmitReply}
            variant="contained"
            disabled={submitting || !replyForm.content.trim()}
          >
            {submitting ? 'Submitting...' : 'Submit Reply'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

