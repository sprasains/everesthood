"use client"
import { motion } from "framer-motion"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useUser } from "app/hooks/useUser"
import { Drawer, List, ListItemButton, ListItemIcon, ListItemText, Box, Typography, LinearProgress } from "@mui/material";

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useUser();

  const menuItems = [
    { 
      icon: "🏠", 
      label: "Dashboard", 
      href: "/dashboard",
      description: "Your AI journey overview"
    },
    { 
      icon: "📰", 
      label: "News Feed", 
      href: "/news",
      description: "Latest AI & tech updates"
    },
    { 
      icon: "🤖", 
      label: "AI Summaries", 
      href: "/summaries",
      description: "Your personalized insights"
    },
    { 
      icon: "🧠", 
      label: "Custom Personas", 
      href: "/personas",
      description: "Create AI assistants with unique personalities"
    },
    { 
      icon: "📚", 
      label: "Guides & Tutorials", 
      href: "/guides",
      description: "Learn and share knowledge with the community"
    },
    { 
      icon: "📰", 
      label: "News & Articles", 
      href: "/news",
      description: "Stay updated with personalized news and content"
    },
    { 
      icon: "🏆", 
      label: "Achievements", 
      href: "/achievements",
      description: "Track your progress"
    },
    { 
      icon: "👥", 
      label: "Community", 
      href: "/community",
      description: "Connect with other learners"
    },
    { 
      icon: "⚙️", 
      label: "Settings", 
      href: "/settings",
      description: "Customize your experience"
    },
    { 
      icon: "🔑", 
      label: "Creator API", 
      href: "/settings/api",
      description: "Manage your API keys"
    },
    {
      icon: "📄",
      label: "Resume Vibe Check",
      href: "/tools/resume-checker",
      description: "AI-powered resume feedback"
    },
    {
      icon: "✍️",
      label: "Create Post",
      href: "/posts/create",
      description: "Share your thoughts with the community"
    },
    {
      icon: "📊", // Marketplace Analytics icon
      label: "Marketplace Analytics",
      href: "/agents/analytics",
      description: "Marketplace trends and insights"
    },
    {
      icon: "🎨", // Creator Dashboard icon
      label: "Creator Dashboard",
      href: "/creator-dashboard",
      description: "Manage content, track performance, and earnings"
    }
  ]

  return (
    <Drawer
      variant="permanent"
      anchor="left"
      PaperProps={{
        sx: {
          width: 260,
          bgcolor: "background.default",
          color: "text.primary",
          borderRight: "1px solid rgba(255,255,255,0.08)",
          pt: 8,
        },
      }}
      sx={{ zIndex: 1200 }}
    >
      <Box sx={{ p: 2 }}>
        {user && (
          <Box sx={{ mb: 3, p: 2, borderRadius: 2, bgcolor: 'linear-gradient(90deg, #8b5cf6 0%, #ec4899 100%)', color: 'white' }}>
            <Box display="flex" alignItems="center" gap={2}>
              <Box sx={{ width: 48, height: 48, bgcolor: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>
                {/* TODO: Support custom persona icons if/when available on user object */}
                {"🤖"}
              </Box>
              <Box>
                <Typography fontWeight="bold">{user.name || "AI Explorer"}</Typography>
                <Typography variant="body2">Level {user.level ?? 1}</Typography>
              </Box>
            </Box>
            <Box mt={2}>
              <Box display="flex" justifyContent="space-between" fontSize={12}>
                <span>{user.xp ?? 0} XP</span>
                <span>{(user.level ?? 1) * 100} XP</span>
              </Box>
              <LinearProgress variant="determinate" value={(((user.xp ?? 0) % 100) / 100) * 100} sx={{ height: 8, borderRadius: 4, mt: 0.5, bgcolor: 'white', '& .MuiLinearProgress-bar': { bgcolor: 'secondary.main' } }} />
            </Box>
          </Box>
        )}
        <List>
          {menuItems.map((item, idx) => (
            <ListItemButton
              key={item.href}
              component={Link}
              href={item.href}
              selected={pathname === item.href}
              sx={{ borderRadius: 2, mb: 1, py: 1.5 }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: 'inherit', fontSize: 22 }}>{item.icon}</ListItemIcon>
              <ListItemText
                primary={<Typography fontWeight="medium">{item.label}</Typography>}
                secondary={<Typography variant="caption" color="text.secondary">{item.description}</Typography>}
              />
            </ListItemButton>
          ))}
        </List>
        {user?.subscriptionTier === "FREE" && (
          <Box mt={4} p={2} borderRadius={2} bgcolor="linear-gradient(90deg, #ec4899 0%, #8b5cf6 100%)" color="white">
            <Typography fontWeight="bold" mb={1}>🚀 Unlock Premium</Typography>
            <Typography variant="body2" mb={2}>Get unlimited AI summaries, exclusive personas, and advanced features</Typography>
            <ListItemButton component={Link} href="/subscribe" sx={{ bgcolor: 'white', color: 'primary.main', borderRadius: 2, fontWeight: 'bold', '&:hover': { bgcolor: 'grey.100' } }}>
              Upgrade Now
            </ListItemButton>
          </Box>
        )}
      </Box>
    </Drawer>
  );
}