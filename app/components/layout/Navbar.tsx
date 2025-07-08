"use client";
import { AppBar, Toolbar, Button, Typography, IconButton, Avatar, Box, Chip } from "@mui/material";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import { motion } from "framer-motion";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useUser } from "@/hooks/useUser";
import NotificationsIcon from "@mui/icons-material/Notifications";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import NotificationDropdown from '@/components/ui/NotificationDropdown';
import MoodTracker from "../ui/MoodTracker";
import MenuIcon from "@mui/icons-material/Menu";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { Menu, MenuItem, List, ListItemButton, ListItemText, Collapse, Divider } from "@mui/material";
import { useState } from "react";

export default function Navbar() {
  const { data: session } = useSession();
  const { user } = useUser();

  // List of test user emails
  const testUserEmails = [
    "admin@example.com",
    "demo@everesthood.com",
    "test0@example.com",
    "test1@example.com",
    "test2@example.com",
    "test3@example.com",
    "test4@example.com",
  ];
  const isTestUser = user && testUserEmails.includes(user.email || "");

  // Categorized navigation structure
  const NAV_CATEGORIES = [
    {
      label: "Social",
      links: [
        { href: "/friends", label: "Friends" },
        { href: "/community", label: "Community" },
        { href: "/favorites", label: "Favorites" },
        { href: "/news-feed", label: "News Feed" },
      ],
    },
    {
      label: "Content",
      links: [
        { href: "/genz", label: "GenZ Content" },
        { href: "/achievements", label: "Achievements" },
        { href: "/careers", label: "Careers" },
        { href: "/news", label: "News" },
        { href: "/summaries", label: "Summaries" },
        { href: "/tools", label: "Tools" },
      ],
    },
    {
      label: "Account",
      links: [
        { href: "/profile", label: "Profile" },
        { href: "/settings", label: "Settings" },
        { href: "/settings/analytics", label: "Analytics" },
        { href: "/billing", label: "Billing" },
        { href: "/subscribe", label: "Subscribe" },
      ],
    },
    {
      label: "Legal & Info",
      links: [
        { href: "/privacy", label: "Privacy" },
        { href: "/security", label: "Security" },
        { href: "/terms", label: "Terms" },
        { href: "/contact", label: "Contact" },
        { href: "/api-docs", label: "API Docs" },
      ],
    },
  ];

  // State for menu and category expansion
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openCategories, setOpenCategories] = useState<{ [key: string]: boolean }>({});
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  const handleCategoryToggle = (label: string) => {
    setOpenCategories((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  // Determine navbar color and badge style based on subscription tier
  const tier = user?.subscriptionTier || "FREE";
  let navbarBg = "linear-gradient(90deg, #6a11cb, #2575fc)";
  let badgeColor = "default";
  let badgeLabel = "Free";
  let badgeStyle = {};
  if (tier === "PREMIUM") {
    navbarBg = "linear-gradient(90deg, #FFD700, #FFB300)"; // gold
    badgeColor = "warning";
    badgeLabel = "Premium";
    badgeStyle = { backgroundColor: '#FFD700', color: '#333' };
  } else if (tier === "CREATOR") {
    navbarBg = "linear-gradient(90deg, #d4145a, #fbb03b)"; // purple-pink-orange
    badgeColor = "secondary";
    badgeLabel = "Creator";
    badgeStyle = { backgroundColor: '#d4145a', color: '#fff' };
  }

  return (
    <AppBar
      data-testid="navbar"
      position="fixed"
      sx={{
        background: navbarBg,
        boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        {/* Mood Tracker for authenticated users */}
        {user && (
          <Box sx={{ mr: 2, display: { xs: 'none', sm: 'block' } }}>
            <MoodTracker />
          </Box>
        )}
        {/* Logo and Dashboard Link */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {/* Menu button for navigation */}
          <IconButton
            color="inherit"
            onClick={handleMenuOpen}
            sx={{ mr: 1 }}
            aria-label="open navigation menu"
          >
            <MenuIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              sx: {
                minWidth: 220,
                background: 'rgba(30, 30, 40, 0.97)', // nearly opaque dark background
                color: 'white',
                boxShadow: 24,
                zIndex: 2000, // ensure it's above most overlays
                backdropFilter: 'blur(2px)',
              }
            }}
          >
            {NAV_CATEGORIES.map((cat, idx) => (
              <div key={cat.label}>
                <ListItemButton onClick={() => handleCategoryToggle(cat.label)}>
                  <ListItemText primary={cat.label} />
                  {openCategories[cat.label] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </ListItemButton>
                <Collapse in={openCategories[cat.label]} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {cat.links.map((link) => (
                      <MenuItem
                        key={link.href}
                        component={Link}
                        href={link.href}
                        onClick={handleMenuClose}
                        sx={{ pl: 4 }}
                      >
                        {link.label}
                      </MenuItem>
                    ))}
                  </List>
                </Collapse>
                {idx < NAV_CATEGORIES.length - 1 && <Divider />}
              </div>
            ))}
          </Menu>
          {/* Logo */}
          <Link href="/" style={{ textDecoration: "none" }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: "bold",
                color: "white",
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                style={{
                  width: 32,
                  height: 32,
                  background: "linear-gradient(to right, #6a11cb, #2575fc)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span style={{ color: "white", fontWeight: "bold" }}>E</span>
              </motion.div>
              Everesthood
            </Typography>
          </Link>
        </Box>
        {/* Welcome message for logged-in user */}
        {user?.name && (
          <Typography variant="subtitle1" sx={{ color: "white", fontWeight: 500, mx: 2, display: 'flex', alignItems: 'center' }}>
            Welcome, {user.name}!
            <Chip label={badgeLabel} size="small" sx={{ ml: 1, fontWeight: 600, fontSize: 12 }} style={badgeStyle} />
          </Typography>
        )}
        {/* Right-aligned icons, upgrade, avatar, logout */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {user?.subscriptionTier === "FREE" && !isTestUser && (
            <Link href="/subscribe" style={{ textDecoration: "none" }}>
              <Button
                variant="contained"
                sx={{
                  background: "linear-gradient(to right, #6a11cb, #2575fc)",
                  color: "white",
                  fontWeight: "medium",
                  textTransform: "none",
                  boxShadow: "0 4px 8px rgba(106, 17, 203, 0.3)",
                  "&:hover": {
                    background: "linear-gradient(to right, #2575fc, #6a11cb)",
                  },
                }}
              >
                ⚡ Upgrade
              </Button>
            </Link>
          )}
          {user?.subscriptionTier === "PREMIUM" && (
            <Link href="/billing" style={{ textDecoration: "none" }}>
              <Button
                variant="text"
                sx={{ color: "white", fontWeight: "medium", textTransform: "none" }}
              >
                💳 Billing
              </Button>
            </Link>
          )}
          <NotificationDropdown />
          <IconButton color="inherit">
            <MailOutlineIcon />
          </IconButton>
          <Avatar src={user?.image || undefined} alt={user?.name || ""} sx={{ width: 36, height: 36, ml: 1 }} />
          <IconButton
            onClick={() => signOut()}
            sx={{
              color: "white",
              background: "rgba(255,255,255,0.1)",
              "&:hover": {
                background: "rgba(255,255,255,0.2)",
              },
            }}
          >
            <ExitToAppIcon />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
