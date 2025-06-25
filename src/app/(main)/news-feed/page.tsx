"use client";
import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import CircularProgress from "@mui/material/CircularProgress";
import Button from "@mui/material/Button";
import PostCard from "@/components/ui/PostCard";
import { useInfiniteQuery } from "@tanstack/react-query";

const PAGE_SIZE = 10;

// Type for paginated API response
interface PostPage {
  posts: any[];
  hasMore: boolean;
}

export default function NewsFeedPage() {
  const { data: session } = useSession();
  const userName = session?.user?.name || "fam";
  const router = useRouter();
  const [filter, setFilter] = useState("latest");
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
  } = useInfiniteQuery<PostPage, Error>({
    queryKey: ["news-feed", filter],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await fetch(`/api/v1/community/posts?page=${pageParam}&limit=${PAGE_SIZE}&filter=${filter}`);
      if (!res.ok) throw new Error("Failed to fetch posts");
      return res.json();
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.hasMore) return allPages.length + 1;
      return undefined;
    },
    refetchOnWindowFocus: false,
  });

  // Refetch when filter changes
  const handleTabChange = (_: any, val: string) => {
    setFilter(val);
    refetch();
  };

  // Infinite scroll: observe the sentinel div
  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    const observer = new window.IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { root: null, rootMargin: "0px", threshold: 1.0 }
    );
    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => {
      if (loadMoreRef.current) observer.unobserve(loadMoreRef.current);
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold" sx={{ letterSpacing: 1 }}>
        What's New in the Hood?
      </Typography>
      <Tabs
        value={filter}
        onChange={handleTabChange}
        indicatorColor="primary"
        textColor="primary"
        sx={{ mb: 2 }}
      >
        <Tab label="Latest" value="latest" />
        <Tab label="Popular" value="popular" />
        <Tab label="Following" value="following" />
      </Tabs>
      <Paper
        elevation={2}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          p: 2,
          mb: 3,
          borderRadius: 2,
          cursor: "pointer",
          bgcolor: "rgba(255,255,255,0.07)",
          transition: "box-shadow 0.2s",
          ':hover': { boxShadow: 6, bgcolor: "rgba(255,255,255,0.13)" },
        }}
        onClick={() => router.push("/posts/create")}
      >
        <Avatar src={session?.user?.image || "https://i.pravatar.cc/150?u=everhood"} />
        <Box sx={{ flex: 1 }}>
          <Typography color="text.secondary">
            Have something to share, {userName}? <span style={{ color: '#1976d2', fontWeight: 500 }}>Drop a post!</span>
          </Typography>
        </Box>
      </Paper>
      {/* Feed List */}
      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {data?.pages?.flatMap((page: PostPage) => page.posts).length === 0 ? (
            <Typography color="text.secondary" align="center" sx={{ mt: 6 }}>
              No posts found. Be the first to drop some Gen-Z wisdom!
            </Typography>
          ) : (
            data?.pages?.flatMap((page: PostPage) => page.posts).map((post: any) => (
              <PostCard key={post.id} post={post} />
            ))
          )}
          {/* Infinite scroll sentinel */}
          <div ref={loadMoreRef} />
          {hasNextPage && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
              <Button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                variant="contained"
                color="primary"
              >
                {isFetchingNextPage ? <CircularProgress size={22} /> : "Load More"}
              </Button>
            </Box>
          )}
        </>
      )}
    </Container>
  );
}
