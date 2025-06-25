"use client";

import { useState, useRef } from "react";
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Paper,
  Tabs,
  Tab,
  Button,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  TextField,
  InputAdornment,
  Stack,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";

const fetchFriends = async () => {
  const res = await fetch("/api/v1/friends");
  if (!res.ok) throw new Error("Failed to fetch friends");
  return res.json();
};
const fetchRequests = async () => {
  const res = await fetch("/api/v1/friends/requests");
  if (!res.ok) throw new Error("Failed to fetch requests");
  return res.json();
};
const searchUsers = async (query: string) => {
  const res = await fetch(`/api/v1/users/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error("Search failed");
  return res.json();
};

export default function FriendsPage() {
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState("");
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const { data: friends, isLoading: friendsLoading } = useQuery({
    queryKey: ["friends"],
    queryFn: fetchFriends,
    enabled: tab === 0,
  });
  const { data: requests, isLoading: requestsLoading } = useQuery({
    queryKey: ["friend-requests"],
    queryFn: fetchRequests,
    enabled: tab === 1,
  });
  const { data: searchResults, isLoading: searchLoading, isError: searchError, refetch: refetchSearch } = useQuery({
    queryKey: ["user-search", search],
    queryFn: () => searchUsers(search),
    enabled: !!search.trim() && tab === 2,
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      refetchSearch();
    }, 400);
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#0f2027", color: "white" }}>
      <Container maxWidth="md" sx={{ pt: 12 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <Paper elevation={4} sx={{ p: { xs: 2, md: 4 }, mb: 4, bgcolor: 'background.paper', borderRadius: 4 }}>
            <Typography variant="h3" fontWeight="bold" gutterBottom sx={{ color: 'primary.main', textAlign: 'center' }}>
              Friends & Community
            </Typography>
            <Tabs value={tab} onChange={(_, v) => setTab(v)} centered sx={{ mb: 3 }}>
              <Tab label="My Friends" />
              <Tab label="Requests" />
              <Tab label="Find Users" />
            </Tabs>
            {tab === 0 && (
              <Paper elevation={2} sx={{ p: 2, mb: 2, bgcolor: 'background.default', borderRadius: 3 }}>
                {friendsLoading ? (
                  <Box display="flex" justifyContent="center" alignItems="center" minHeight={120}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <List>
                    {friends?.map((friend: any) => (
                      <ListItem key={friend.id} divider>
                        <ListItemAvatar>
                          <Avatar src={friend.avatarUrl} />
                        </ListItemAvatar>
                        <ListItemText primary={friend.name} secondary={friend.email} />
                      </ListItem>
                    ))}
                  </List>
                )}
              </Paper>
            )}
            {tab === 1 && (
              <Paper elevation={2} sx={{ p: 2, mb: 2, bgcolor: 'background.default', borderRadius: 3 }}>
                {requestsLoading ? (
                  <Box display="flex" justifyContent="center" alignItems="center" minHeight={120}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <List>
                    {requests?.map((req: any) => (
                      <ListItem key={req.id} divider>
                        <ListItemAvatar>
                          <Avatar src={req.avatarUrl} />
                        </ListItemAvatar>
                        <ListItemText primary={req.name} secondary={req.email} />
                        <Button variant="contained" color="primary" sx={{ borderRadius: 3 }}>
                          Accept
                        </Button>
                      </ListItem>
                    ))}
                  </List>
                )}
              </Paper>
            )}
            {tab === 2 && (
              <Paper elevation={2} sx={{ p: 2, mb: 2, bgcolor: 'background.default', borderRadius: 3 }}>
                <TextField
                  variant="outlined"
                  placeholder="Search users..."
                  value={search}
                  onChange={handleSearchChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ width: { xs: '100%', sm: 400 }, mb: 2 }}
                />
                {searchLoading ? (
                  <Box display="flex" justifyContent="center" alignItems="center" minHeight={120}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <List>
                    {searchResults?.map((user: any) => (
                      <ListItem key={user.id} divider>
                        <ListItemAvatar>
                          <Avatar src={user.avatarUrl} />
                        </ListItemAvatar>
                        <ListItemText primary={user.name} secondary={user.email} />
                        <Button variant="contained" color="primary" sx={{ borderRadius: 3 }}>
                          Add Friend
                        </Button>
                      </ListItem>
                    ))}
                  </List>
                )}
              </Paper>
            )}
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
}
