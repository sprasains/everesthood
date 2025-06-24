"use client";

import { useState, useEffect, useRef } from "react";
import Navbar from "@/components/layout/Navbar";
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
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

export default function FriendsPage() {
  const [tab, setTab] = useState(0);
  const [requests, setRequests] = useState([]); // Incoming friend requests
  const [friends, setFriends] = useState([]); // Accepted friends
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (tab === 0) fetchFriends();
    if (tab === 1) fetchRequests();
  }, [tab]);

  const fetchFriends = async () => {
    const res = await fetch("/api/v1/friends");
    if (res.ok) setFriends(await res.json());
  };
  const fetchRequests = async () => {
    const res = await fetch("/api/v1/friends/requests");
    if (res.ok) setRequests(await res.json());
  };

  // --- SEARCH IMPLEMENTATION ---
  const handleSearch = async (query?: string) => {
    setSearchLoading(true);
    setSearchError("");
    try {
      const res = await fetch(
        `/api/v1/users/search?q=${encodeURIComponent(query ?? search)}`
      );
      if (!res.ok) throw new Error("Search failed");
      setSearchResults(await res.json());
    } catch (e) {
      setSearchError("No users found or error occurred.");
    } finally {
      setSearchLoading(false);
    }
  };

  // Debounce search input
  useEffect(() => {
    if (search.trim() === "") {
      setSearchResults([]);
      setSearchError("");
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      handleSearch(search);
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // --- SEND FRIEND REQUEST ---
  const sendFriendRequest = async (userId: string) => {
    await fetch("/api/v1/friends/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ receiverId: userId }),
    });
    handleSearch(); // Refresh search results
  };

  // --- ACCEPT/DECLINE FRIEND REQUEST ---
  const respondToRequest = async (
    requesterId: string,
    status: "ACCEPTED" | "DECLINED"
  ) => {
    await fetch(`/api/v1/friends/requests/${requesterId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchRequests();
    fetchFriends();
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#0f2027", color: "white" }}>
      <Navbar />
      <Container sx={{ pt: 12 }}>
        <Typography variant="h4" fontWeight="bold">
          Friends & Connections
        </Typography>
        <Paper sx={{ mt: 4, bgcolor: "rgba(255, 255, 255, 0.05)" }}>
          <Tabs value={tab} onChange={handleTabChange} centered>
            <Tab label="My Friends" />
            <Tab label="Friend Requests" />
            <Tab label="Find People" />
          </Tabs>
          <Box p={3}>
            {tab === 0 && (
              <List>
                {friends.length === 0 && (
                  <Typography color="#bdbdbd">No friends yet.</Typography>
                )}
                {friends.map((f: any) => (
                  <ListItem key={f.id}>
                    <ListItemAvatar>
                      <Avatar src={f.image} />
                    </ListItemAvatar>
                    <ListItemText primary={f.name} />
                  </ListItem>
                ))}
              </List>
            )}
            {tab === 1 && (
              <List>
                {requests.length === 0 && (
                  <Typography color="#bdbdbd">No incoming requests.</Typography>
                )}
                {requests.map((r: any) => (
                  <ListItem key={r.requester.id}>
                    <ListItemAvatar>
                      <Avatar src={r.requester.image} />
                    </ListItemAvatar>
                    <ListItemText primary={r.requester.name} />
                    <Button
                      variant="contained"
                      color="success"
                      sx={{ mr: 1 }}
                      onClick={() =>
                        respondToRequest(r.requester.id, "ACCEPTED")
                      }
                    >
                      Accept
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() =>
                        respondToRequest(r.requester.id, "DECLINED")
                      }
                    >
                      Decline
                    </Button>
                  </ListItem>
                ))}
              </List>
            )}
            {tab === 2 && (
              <Box>
                <Box display="flex" gap={2} mb={2}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Search users by name or email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSearch();
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ bgcolor: "rgba(255,255,255,0.08)", borderRadius: 2 }}
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleSearch()}
                    disabled={searchLoading || !search.trim()}
                    sx={{ minWidth: 120 }}
                    startIcon={<SearchIcon />}
                  >
                    {searchLoading ? "Searching..." : "Search"}
                  </Button>
                </Box>
                {searchError && (
                  <Typography color="error">{searchError}</Typography>
                )}
                <List>
                  {searchResults.map((u: any) => (
                    <ListItem key={u.id}>
                      <ListItemAvatar>
                        <Avatar src={u.image} />
                      </ListItemAvatar>
                      <ListItemText primary={u.name} secondary={u.email} />
                      <Button
                        variant="contained"
                        onClick={() => sendFriendRequest(u.id)}
                      >
                        Add Friend
                      </Button>
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
