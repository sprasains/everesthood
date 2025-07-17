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
import DashboardIcon from '@mui/icons-material/Dashboard';
import ArticleIcon from '@mui/icons-material/Article';
import GroupIcon from '@mui/icons-material/Group';
import WorkIcon from '@mui/icons-material/Work';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SummarizeIcon from '@mui/icons-material/Summarize';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import DescriptionIcon from '@mui/icons-material/Description';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PersonIcon from '@mui/icons-material/Person';
import StarIcon from '@mui/icons-material/Star';
import SettingsIcon from '@mui/icons-material/Settings';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import CampaignIcon from '@mui/icons-material/Campaign';
import ApiIcon from '@mui/icons-material/Api';
import SecurityIcon from '@mui/icons-material/Security';
import GavelIcon from '@mui/icons-material/Gavel';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import HighlightIcon from '@mui/icons-material/Highlight';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import Tooltip from '@mui/material/Tooltip';

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

  // Enhanced NAV_CATEGORIES with icons and descriptions
  const NAV_CATEGORIES = [
    {
      label: "Agentic AI",
      links: [
        { href: "/agents", label: "Agents", icon: <AutoAwesomeIcon />, desc: "Create, schedule, and run smart agents" },
        { href: "/agents/templates", label: "Agent Templates", icon: <SummarizeIcon />, desc: "Browse and manage agent templates" },
        { href: "/agents/runs", label: "Agent Runs", icon: <AssignmentTurnedInIcon />, desc: "View and manage agent executions" },
        { href: "/summaries", label: "AI Summaries", icon: <HighlightIcon />, desc: "Persona-driven content summaries" },
        { href: "/tools/resume-checker", label: "Resume Vibe Check", icon: <WorkIcon />, desc: "AI-powered resume analysis" },
        { href: "/dashboard/analytics", label: "Analytics Dashboard", icon: <AnalyticsIcon />, desc: "Track your growth and agent performance" },
      ],
    },
    {
      label: "Modules",
      links: [
        { href: "/money", label: "Money", icon: <AccountBalanceWalletIcon />, desc: "Budgeting, bills, and financial tools" },
        { href: "/schedule", label: "Schedule", icon: <CalendarMonthIcon />, desc: "Events, reminders, and planning" },
        { href: "/family", label: "Family", icon: <FamilyRestroomIcon />, desc: "Family management and shared events" },
        { href: "/docs", label: "Docs & Vault", icon: <DescriptionIcon />, desc: "Secure document storage and notes" },
        { href: "/health", label: "Health & Wellness", icon: <LocalHospitalIcon />, desc: "Wellness, mood tracking, and digital detox" },
        { href: "/shopping", label: "Shopping", icon: <ShoppingCartIcon />, desc: "Shopping lists and deals" },
        { href: "/hub", label: "Productivity Hub", icon: <RocketLaunchIcon />, desc: "Tasks, journaling, and focus tools" },
      ],
    },
    {
      label: "User",
      links: [
        { href: "/profile", label: "My Profile", icon: <PersonIcon />, desc: "View and edit your profile" },
        { href: "/friends", label: "My Friends", icon: <GroupAddIcon />, desc: "Manage your friends and circles" },
        { href: "/settings/personas", label: "AI Personas", icon: <AutoAwesomeIcon />, desc: "Switch and customize AI personas" },
        { href: "/settings", label: "Settings", icon: <SettingsIcon />, desc: "Account and app settings" },
        { href: "/billing", label: "Subscription", icon: <MonetizationOnIcon />, desc: "Manage your plan and billing" },
      ],
    },
    {
      label: "Monetization",
      links: [
        { href: "/profile/spotlight", label: "Profile Spotlight", icon: <StarIcon />, desc: "Boost your profile visibility" },
        { href: "/wallet", label: "Tipping Credits", icon: <MonetizationOnIcon />, desc: "Send and receive tips" },
        { href: "/ambassador", label: "Ambassador Hub", icon: <CampaignIcon />, desc: "Earn rewards and grow the community" },
        { href: "/settings/api", label: "Creator API", icon: <ApiIcon />, desc: "Access advanced API features" },
      ],
    },
    {
      label: "Admin",
      links: [
        { href: "/admin", label: "Admin Dashboard", icon: <SupervisorAccountIcon />, desc: "Admin tools and moderation" },
        { href: "/moderation", label: "Moderation", icon: <GavelIcon />, desc: "Reports, blocks, and reviews" },
      ],
    },
    {
      label: "Legal & Info",
      links: [
        { href: "/privacy", label: "Privacy", icon: <SecurityIcon />, desc: "Privacy policy and controls" },
        { href: "/security", label: "Security", icon: <SecurityIcon />, desc: "Security best practices" },
        { href: "/terms", label: "Terms", icon: <GavelIcon />, desc: "Terms of service" },
        { href: "/contact", label: "Contact", icon: <ContactMailIcon />, desc: "Contact and support" },
        { href: "/api-docs", label: "API Docs", icon: <DescriptionOutlinedIcon />, desc: "Developer documentation" },
      ],
    },
  ];

  // Add Main links as icon buttons in the top nav
  const MAIN_LINKS = [
    { href: "/dashboard", label: "Dashboard", icon: <DashboardIcon /> },
    { href: "/news", label: "News Feed", icon: <ArticleIcon /> },
    { href: "/community", label: "Community", icon: <GroupIcon /> },
    { href: "/careers", label: "Opportunities", icon: <WorkIcon /> },
    { href: "/achievements", label: "Achievements", icon: <EmojiEventsIcon /> },
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
      <Toolbar sx={{ display: "flex", justifyContent: "flex-start" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexGrow: 1 }}>
          <IconButton
            color="inherit"
            onClick={handleMenuOpen}
            sx={{ mr: 1 }}
            aria-label="open navigation menu"
          >
            <MenuIcon />
          </IconButton>
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
          {/* Main links as icon buttons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2 }}>
            {MAIN_LINKS.map((link) => (
              <Tooltip key={link.href} title={link.label} arrow>
                <IconButton
                  color="inherit"
                  component={Link}
                  href={link.href}
                  sx={{ p: 1.2 }}
                  aria-label={link.label}
                >
                  {link.icon}
                </IconButton>
              </Tooltip>
            ))}
          </Box>
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
                    sx={{ pl: 4, alignItems: 'flex-start', py: 1.5 }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 36, mr: 2, mt: 0.5 }}>{link.icon}</Box>
                    <Box>
                      <Typography fontWeight="bold" sx={{ color: 'white', fontSize: 15 }}>{link.label}</Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>{link.desc}</Typography>
                    </Box>
                  </MenuItem>
                ))}
              </List>
            </Collapse>
            {idx < NAV_CATEGORIES.length - 1 && <Divider />}
          </div>
        ))}
      </Menu>
    </AppBar>
  );
}
