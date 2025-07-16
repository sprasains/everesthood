"use client";
export const dynamic = "force-dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import PersonaSelector from "app/components/ui/PersonaSelector";
import StreakDisplay from "app/components/ui/StreakDisplay";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import BarChartIcon from "@mui/icons-material/BarChart";
import { CircularProgress, Box, Container, Paper, Tabs, Tab, Typography, Avatar } from "@mui/material";
import { BadgeList, Badge } from "app/components/ui/BadgeList";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useUser } from '@/hooks/useUser';

export default function ProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    weeklyGoal: 5,
  });
  // Billing: Manage Subscription Button
  const [billingLoading, setBillingLoading] = useState(false);
  const [badges, setBadges] = useState<Badge[]>([]);
  const { data: session } = useSession();

  const { user, updateUser, loading } = useUser();

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        weeklyGoal: user.weeklyGoal || 5,
      });
    }
  }, [user]);

  useEffect(() => {
    if (session?.user?.id) {
      fetch(`/api/v1/users/${session.user.id}/badges`).then(r => r.json()).then(d => setBadges(d.badges || []));
    }
  }, [session?.user?.id]);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth/signin");
    }
  }, [user, loading, router]);

  const handleSave = async () => {
    await updateUser(formData as any);
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

  if (loading || !user) {
    return <CircularProgress />;
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
                {user?.image ? (
                  <Avatar src={user.image} alt={user.name || ""} sx={{ width: 96, height: 96 }} />
                ) : (
                  getPersonaIcon(user?.persona)
                )}
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
                  <BadgeList badges={badges} />
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
                  <BadgeList badges={badges} />
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
