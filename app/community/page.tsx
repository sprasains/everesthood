"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { Container, Typography, Box, Tabs, Tab, CircularProgress } from "@mui/material";
import PostCard from "@/components/posts/PostCard";
import PostCardSkeleton from "@/components/posts/PostCardSkeleton";

interface Post {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    name: string | null;
    image: string | null;
    profilePicture: string | null;
  };
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  mediaUrls: string[];
}

const fetchPosts = async ({ pageParam = 1, queryKey }: any) => {
  const [_key, filter] = queryKey;
  const res = await fetch(`/api/v1/community/posts?page=${pageParam}&limit=10&filter=${filter}`);
  if (!res.ok) throw new Error("Failed to fetch posts");
  return res.json();
};

export default function CommunityPage() {
  const [filter, setFilter] = useState("latest");
  const { ref, inView } = useInView();

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["communityPosts", filter],
    queryFn: fetchPosts,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.page + 1 : undefined;
    },
  });

  useEffect(() => {
    refetch();
  }, [filter, refetch]);

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  const handleFilterChange = (_: any, newValue: string) => {
    setFilter(newValue);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" fontWeight="bold" gutterBottom>
        Community Feed
      </Typography>
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs value={filter} onChange={handleFilterChange} aria-label="post filters">
          <Tab label="Latest" value="latest" />
          <Tab label="Popular" value="popular" />
          <Tab label="Following" value="following" />
        </Tabs>
      </Box>
      {status === "pending" ? (
        <Box>
          {Array.from(new Array(3)).map((_, i) => (
            <PostCardSkeleton key={i} />
          ))}
        </Box>
      ) : status === "error" ? (
        <Typography color="error">Error: {(error as Error).message}</Typography>
      ) : (
        <>
          {/* Check for empty state */}
          {data && data.pages.every((page) => page.posts.length === 0) ? (
            <Box textAlign="center" py={6}>
              <Typography variant="h6" color="text.secondary" gutterBottom>No posts found for this feed.</Typography>
              <Typography variant="body1">Be the first to post and start the conversation!</Typography>
            </Box>
          ) : (
            <>
              {data?.pages.map((page, i) => (
                <div key={i}>
                  {page.posts.map((post: any) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              ))}
              <Box sx={{ display: "flex", justifyContent: "center", mt: 4, height: '80px' }}>
                <div ref={ref} />
                {isFetchingNextPage && <CircularProgress />}
                {!hasNextPage && !isFetching && <Typography>No more posts to load.</Typography>}
              </Box>
            </>
          )}
        </>
      )}
    </Container>
  );
}
