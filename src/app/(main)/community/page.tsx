"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Skeleton from "@mui/material/Skeleton";
import UserCard from "@/components/ui/UserCard";
import { motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";

const FILTERS = [
  { label: "All", value: "all" },
  { label: "Following", value: "following" },
  { label: "Popular", value: "popular" },
];

export default function CommunityPage() {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["users", filter, search],
    queryFn: async () => {
      const params = new URLSearchParams({ filter, search });
      const res = await fetch(`/api/v1/users?${params}`);
      if (!res.ok) throw new Error("Failed to fetch users");
      return res.json();
    },
    refetchOnWindowFocus: false,
  });

  return (
    <>
      <Navbar />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 6, pt: 10 }}>
        <Typography variant="h3" fontWeight="bold" gutterBottom>
          Community Hub
        </Typography>
        <Tabs
          value={filter}
          onChange={(_, val) => setFilter(val)}
          indicatorColor="primary"
          textColor="primary"
          sx={{ mb: 2 }}
        >
          {FILTERS.map(f => (
            <Tab key={f.value} label={f.label} value={f.value} />
          ))}
        </Tabs>
        <TextField
          placeholder="Search users by name or bio..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          fullWidth
          sx={{ mb: 3 }}
        />
        <Grid container spacing={3}>
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
                  <Skeleton variant="circular" width={64} height={64} sx={{ mb: 2 }} />
                  <Skeleton variant="text" width="60%" />
                  <Skeleton variant="text" width="80%" />
                  <Skeleton variant="rectangular" width="100%" height={60} sx={{ mt: 1 }} />
                </Grid>
              ))
            : data?.users?.length === 0
            ? (
                <Grid item xs={12}>
                  <Typography align="center" color="text.secondary" sx={{ mt: 6 }}>
                    No users found. Try adjusting your search!
                  </Typography>
                </Grid>
              )
            : data?.users?.map((user, i) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={user.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                  >
                    <UserCard {...user} />
                  </motion.div>
                </Grid>
              ))}
        </Grid>
      </Container>
    </>
  );
}
