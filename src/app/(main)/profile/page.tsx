"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useUser } from "@/hooks/useUser"; // Assuming this hook is correctly set up
import PersonaSelector from "@/components/ui/PersonaSelector";
import StreakDisplay from "@/components/ui/StreakDisplay";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import BarChartIcon from "@mui/icons-material/BarChart";
import { CircularProgress, Box, Container, Paper, Tabs, Tab, Typography } from "@mui/material";

// Skeleton Loader Component
const SkeletonLoader = () => (
  <div className="max-w-4xl mx-auto animate-pulse">
    <div className="bg-gray-800/50 rounded-2xl p-8 mb-8 flex items-center space-x-6">
      <div className="w-24 h-24 bg-gray-700 rounded-full"></div>
      <div className="flex-1 space-y-4">
        <div className="h-8 bg-gray-700 rounded w-3/4"></div>
        <div className="h-4 bg-gray-700 rounded w-1/2"></div>
        <div className="flex space-x-6 pt-2">
          <div className="h-10 bg-gray-700 rounded w-20"></div>
          <div className="h-10 bg-gray-700 rounded w-20"></div>
          <div className="h-10 bg-gray-700 rounded w-20"></div>
        </div>
      </div>
    </div>
    <div className="h-16 bg-gray-800/50 rounded-lg mb-8"></div>
    <div className="h-64 bg-gray-800/50 rounded-lg"></div>
  </div>
);

export default function ProfilePage() {
  const { user, updateUser, loading } = useUser();
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    weeklyGoal: 5,
  });
  // Billing: Manage Subscription Button
  const [billingLoading, setBillingLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        weeklyGoal: user.weeklyGoal || 5,
      });
    }
  }, [user]);

  const handleSave = async () => {
    await updateUser(formData);
    setIsEditing(false);
  };

  const handleManageBilling = async () => {
    setBillingLoading(true);
    try {
      const res = await fetch("/api/v1/stripe/create-portal-session", {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        window.location.href = data.url;
      } else {
        alert("Failed to open billing portal.");
      }
    } finally {
      setBillingLoading(false);
    }
  };

  const tabs = [
    { id: "overview", name: "Overview", icon: <BarChartIcon /> },
    { id: "persona", name: "AI Persona", icon: <PersonIcon /> },
    { id: "achievements", name: "Achievements", icon: <EmojiEventsIcon /> },
    { id: "settings", name: "Settings", icon: <SettingsIcon /> },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="pt-20 px-6 pb-6">
          <SkeletonLoader />
        </div>
      </div>
    );
  }

  // Fix: define getPersonaIcon and memberSince above return
  const getPersonaIcon = (persona: string | undefined) => {
    switch (persona) {
      case "ZenGPT":
        return "🧘‍♀️";
      case "HustleBot":
        return "🔥";
      case "DataDaddy":
        return "📊";
      default:
        return "💪";
    }
  };
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).getFullYear()
    : new Date().getFullYear();

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#0f2027", color: "white" }}>
      <Container maxWidth="md" sx={{ pt: 12 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <Paper
            elevation={4}
            sx={{
              p: { xs: 2, md: 4 },
              mb: 4,
              bgcolor: "background.paper",
              borderRadius: 4,
            }}
          >
            {/* Profile Header */}
            <Box display="flex" alignItems="center" gap={4} mb={4}>
              <Box
                sx={{
                  width: 96,
                  height: 96,
                  bgcolor: "white",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 48,
                }}
              >
                {/* Avatar or Persona Icon */}
                {getPersonaIcon(user?.persona)}
              </Box>
              <Box>
                <Typography
                  variant="h4"
                  fontWeight="bold"
                  sx={{ color: "primary.main" }}
                >
                  {user?.name || "Your Name"}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Level {user?.level ?? 1}
                </Typography>
                <StreakDisplay />
              </Box>
            </Box>
            {/* Tabs */}
            <Tabs
              value={activeTab}
              onChange={(_, v) => setActiveTab(v)}
              centered
              sx={{ mb: 3 }}
            >
              <Tab label="Overview" />
              <Tab label="AI Persona" />
              <Tab label="Achievements" />
              <Tab label="Settings" />
            </Tabs>
            {/* Tab Content */}
            <Paper
              elevation={2}
              sx={{
                p: 3,
                bgcolor: "background.default",
                borderRadius: 3,
              }}
            >
              {/* Example: Overview Tab */}
              {activeTab === "overview" && (
                <Box>
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    mb={2}
                  ></Typography>
                  {/* Add overview content here */}
                </Box>
              )}
              {activeTab === "persona" && (
                <Box>
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    mb={2}
                  ></Typography>
                  <PersonaSelector />
                </Box>
              )}
              {activeTab === "achievements" && (
                <Box>
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    mb={2}
                  ></Typography>
                  {/* Add achievements content here */}
                </Box>
              )}
              {activeTab === "settings" && (
                <Box>
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    mb={2}
                  ></Typography>
                  {/* Add settings content here */}
                </Box>
              )}
            </Paper>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
}
