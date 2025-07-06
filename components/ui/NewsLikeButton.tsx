import { useMutation, useQueryClient } from '@tanstack/react-query';
import { IconButton, Tooltip, Badge } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useState } from 'react';
import axios from 'axios';

interface NewsLikeButtonProps {
  articleId: string;
  isLiked: boolean;
  likeCount: number;
  onLikeChange?: (liked: boolean, count: number) => void;
}

export default function NewsLikeButton({ articleId, isLiked, likeCount, onLikeChange }: NewsLikeButtonProps) {
  const queryClient = useQueryClient();
  const [optimisticLiked, setOptimisticLiked] = useState(isLiked);
  const [optimisticCount, setOptimisticCount] = useState(likeCount);

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await axios.post(`/api/v1/news/${articleId}/like`);
      return res.data;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['news', articleId] });
      const prevLiked = optimisticLiked;
      const prevCount = optimisticCount;
      setOptimisticLiked(!prevLiked);
      setOptimisticCount(prevLiked ? prevCount - 1 : prevCount + 1);
      if (onLikeChange) onLikeChange(!prevLiked, prevLiked ? prevCount - 1 : prevCount + 1);
      return { prevLiked, prevCount };
    },
    onError: (err, _vars, context) => {
      setOptimisticLiked(context?.prevLiked ?? isLiked);
      setOptimisticCount(context?.prevCount ?? likeCount);
      if (onLikeChange) onLikeChange(context?.prevLiked ?? isLiked, context?.prevCount ?? likeCount);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['news', articleId] });
    },
  });

  return (
    <Tooltip title={optimisticLiked ? 'Unlike' : 'Like'}>
      <span>
        <IconButton
          color={optimisticLiked ? 'error' : 'default'}
          onClick={() => mutation.mutate()}
          disabled={mutation.status === 'pending'}
          aria-label={optimisticLiked ? 'Unlike' : 'Like'}
        >
          <Badge badgeContent={optimisticCount} color="error" max={999}>
            {optimisticLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
          </Badge>
        </IconButton>
      </span>
    </Tooltip>
  );
} 