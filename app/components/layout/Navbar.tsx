"use client";
import { AppBar, Toolbar, Button, Typography, IconButton, Avatar, Box, Chip, Container } from "@mui/material";
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
import PsychologyIcon from '@mui/icons-material/Psychology';
import MenuBookIcon from '@mui/icons-material/MenuBook';
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
        { href: "/agents/instances", label: "My Agents", icon: <AssignmentTurnedInIcon />, desc: "View and manage your agent instances" },
        { href: "/agents/performance", label: "Performance", icon: <AnalyticsIcon />, desc: "Monitor agent performance and analytics" },
        { href: "/agents/analytics", label: "Marketplace Analytics", icon: <AnalyticsIcon />, desc: "View marketplace trends and insights" },
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
        { href: "/notifications", label: "Notifications", icon: <NotificationsIcon />, desc: "View and manage your notifications" },
        { href: "/settings/personas", label: "AI Personas", icon: <AutoAwesomeIcon />, desc: "Switch and customize AI personas" },
        { href: "/settings", label: "Settings", icon: <SettingsIcon />, desc: "Account and app settings" },
        { href: "/billing", label: "Subscription", icon: <MonetizationOnIcon />, desc: "Manage your plan and billing" },
      ],
    },
    {
      label: "Monetization",
      links: [
        { href: "/creator-dashboard", label: "Creator Dashboard", icon: <AnalyticsIcon />, desc: "Manage content, track performance, and earnings" },
        { href: "/profile/spotlight", label: "Profile Spotlight", icon: <StarIcon />, desc: "Boost your profile visibility" },
        { href: "/wallet", label: "Tipping Credits", icon: <MonetizationOnIcon />, desc: "Send and receive tips" },
        { href: "/ambassador", label: "Ambassador Hub", icon: <CampaignIcon />, desc: "Earn rewards and grow the community" },
        { href: "/settings/api", label: "Creator API", icon: <ApiIcon />, desc: "Access advanced API features" },
      ],
    },
    {
      label: "Wellness",
      links: [
        { href: '/digital-zen', label: 'Digital Zen', icon: <LocalHospitalIcon />, desc: 'Digital wellness and detox plans' },
      ],
    },
    {
      label: "AI",
      links: [
        { href: '/summaries', label: 'AI Summaries', icon: <AutoAwesomeIcon />, desc: 'Persona-driven content summaries' },
      ],
    },
    {
      label: "Community",
      links: [
        { href: "/circles", label: "Collaborative Circles", icon: <GroupIcon />, desc: "Join focused communities and collaborate" },
        { href: "/challenges", label: "Hackathons & Challenges", icon: <EmojiEventsIcon />, desc: "Compete in exciting challenges and win prizes" },
        { href: "/showcases", label: "Career Showcases", icon: <WorkIcon />, desc: "Showcase your projects and achievements" },
      ],
    },
    {
      label: "Info",
      links: [
        { href: '/help', label: 'Help Center', icon: <RocketLaunchIcon />, desc: 'Guides, walkthroughs, and resources' },
        { href: '/api-docs', label: 'API Docs', icon: <DescriptionOutlinedIcon />, desc: 'Developer documentation' },
        { href: '/contact', label: 'Contact', icon: <ContactMailIcon />, desc: 'Contact and support' },
        { href: '/privacy', label: 'Privacy', icon: <SecurityIcon />, desc: 'Privacy policy and controls' },
        { href: '/security', label: 'Security', icon: <SecurityIcon />, desc: 'Security best practices' },
        { href: '/terms', label: 'Terms', icon: <GavelIcon />, desc: 'Terms of service' },
      ],
    },
    {
      label: "Admin",
      links: [
        { href: "/admin", label: "Admin Dashboard", icon: <SupervisorAccountIcon />, desc: "Admin tools and moderation" },
        // Only show Moderation if user is admin/moderator
        // { href: '/moderation', label: 'Moderation', icon: <GavelIcon />, desc: 'Reports, blocks, and reviews' },
      ],
    },
  ];

  // Add Main links as icon buttons in the top nav
  const MAIN_LINKS = [
    { href: "/dashboard", label: "Dashboard", icon: <DashboardIcon /> },
    { href: "/news", label: "News & Articles", icon: <ArticleIcon /> },
    { href: "/community", label: "Community", icon: <GroupIcon /> },
    { href: "/careers", label: "Opportunities", icon: <WorkIcon /> },
    { href: "/achievements", label: "Achievements", icon: <EmojiEventsIcon /> },
    { href: "/personas", label: "Custom Personas", icon: <PsychologyIcon /> },
    { href: "/guides", label: "Guides & Tutorials", icon: <MenuBookIcon /> },
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

  // Determine navbar styling based on subscription tier
  const tier = user?.subscriptionTier || "FREE";
  let navbarBg = "linear-gradient(135deg, #1e293b 0%, #334155 100%)";
  let badgeColor = "default";
  let badgeLabel = "Free";
  let badgeStyle = {};
  
  if (tier === "PREMIUM") {
    navbarBg = "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)"; // amber gradient
    badgeColor = "warning";
    badgeLabel = "Premium";
    badgeStyle = { backgroundColor: '#f59e0b', color: '#1f2937', fontWeight: 600 };
  } else if (tier === "CREATOR") {
    navbarBg = "linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)"; // purple gradient
    badgeColor = "secondary";
    badgeLabel = "Creator";
    badgeStyle = { backgroundColor: '#8b5cf6', color: '#ffffff', fontWeight: 600 };
  }

  return (
    <AppBar
      data-testid="navbar"
      position="fixed"
      elevation={0}
      sx={{
        background: navbarBg,
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        zIndex: 1100,
      }}
    >
      <Container maxWidth="xl" disableGutters>
        <Toolbar sx={{ 
          display: "flex", 
          justifyContent: "space-between",
          alignItems: "center",
          px: { xs: 2, md: 3 },
          py: 1,
          minHeight: { xs: '64px', md: '72px' },
        }}>
          {/* Left section: Menu button, Logo, and Main links */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexGrow: 1 }}>
            <IconButton
              color="inherit"
              onClick={handleMenuOpen}
              sx={{ 
                mr: 1,
                bgcolor: 'rgba(255, 255, 255, 0.1)',
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.2)' },
              }}
              aria-label="open navigation menu"
            >
              <MenuIcon />
            </IconButton>
            
            {/* Logo */}
            <Link href="/" style={{ textDecoration: "none" }}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
                    }}
                  >
                    <Typography sx={{ color: 'white', fontWeight: 'bold', fontSize: '1.1rem' }}>
                      E
                    </Typography>
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: "bold",
                      color: "white",
                      fontSize: { xs: '1.1rem', md: '1.25rem' },
                    }}
                  >
                    Everesthood
                  </Typography>
                </Box>
              </motion.div>
            </Link>
            
            {/* Main navigation links */}
            <Box sx={{ 
              display: { xs: 'none', lg: 'flex' }, 
              alignItems: 'center', 
              gap: 0.5, 
              ml: 4 
            }}>
              {MAIN_LINKS.map((link) => (
                <Tooltip key={link.href} title={link.label} arrow>
                  <IconButton
                    color="inherit"
                    component={Link}
                    href={link.href}
                    sx={{ 
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: 'rgba(255, 255, 255, 0.05)',
                      '&:hover': { 
                        bgcolor: 'rgba(255, 255, 255, 0.15)',
                        transform: 'translateY(-1px)',
                      },
                      transition: 'all 0.2s ease-in-out',
                    }}
                    aria-label={link.label}
                  >
                    {link.icon}
                  </IconButton>
                </Tooltip>
              ))}
            </Box>
          </Box>

          {/* Center section: Welcome message */}
          {user?.name && (
            <Box sx={{ 
              display: { xs: 'none', md: 'flex' }, 
              alignItems: 'center', 
              gap: 2,
              mx: 2,
            }}>
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  color: "white", 
                  fontWeight: 500,
                  fontSize: '0.875rem',
                }}
              >
                Welcome, {user.name}!
              </Typography>
              <Chip 
                label={badgeLabel} 
                size="small" 
                sx={{ 
                  fontWeight: 600, 
                  fontSize: '0.75rem',
                  height: 24,
                }} 
                style={badgeStyle}
              />
            </Box>
          )}

          {/* Right section: Actions and user menu */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {/* Upgrade button for free users */}
            {user?.subscriptionTier === "FREE" && !isTestUser && (
              <Link href="/subscribe" style={{ textDecoration: "none" }}>
                <Button
                  variant="contained"
                  size="small"
                  sx={{
                    background: "linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)",
                    color: "white",
                    fontWeight: "600",
                    textTransform: "none",
                    borderRadius: 2,
                    px: 2,
                    py: 0.75,
                    boxShadow: "0 4px 12px rgba(139, 92, 246, 0.3)",
                    "&:hover": {
                      background: "linear-gradient(135deg, #7c3aed 0%, #0891b2 100%)",
                      transform: "translateY(-1px)",
                      boxShadow: "0 6px 16px rgba(139, 92, 246, 0.4)",
                    },
                    transition: "all 0.2s ease-in-out",
                  }}
                >
                  ⚡ Upgrade
                </Button>
              </Link>
            )}
            
            {/* Billing button for premium users */}
            {user?.subscriptionTier === "PREMIUM" && (
              <Link href="/billing" style={{ textDecoration: "none" }}>
                <Button
                  variant="text"
                  size="small"
                  sx={{ 
                    color: "white", 
                    fontWeight: "500", 
                    textTransform: "none",
                    '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' },
                  }}
                >
                  💳 Billing
                </Button>
              </Link>
            )}
            
            {/* Notifications */}
            <NotificationDropdown />
            
            {/* Messages */}
            <Tooltip title="Messages" arrow>
              <IconButton 
                color="inherit"
                sx={{ 
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.2)' },
                }}
              >
                <MailOutlineIcon />
              </IconButton>
            </Tooltip>
            
            {/* User avatar */}
            <Tooltip title="User menu" arrow>
              <Avatar 
                src={user?.image || undefined} 
                alt={user?.name || ""} 
                sx={{ 
                  width: 40, 
                  height: 40, 
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  cursor: 'pointer',
                  '&:hover': { 
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                    transform: 'scale(1.05)',
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              />
            </Tooltip>
            
            {/* Logout button */}
            <Tooltip title="Sign out" arrow>
              <IconButton
                onClick={() => signOut()}
                sx={{
                  color: "white",
                  bgcolor: "rgba(255,255,255,0.1)",
                  "&:hover": {
                    bgcolor: "rgba(255,255,255,0.2)",
                    transform: "scale(1.05)",
                  },
                  transition: "all 0.2s ease-in-out",
                }}
              >
                <ExitToAppIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </Container>

      {/* Navigation menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            minWidth: 280,
            background: 'rgba(30, 41, 59, 0.98)',
            color: 'white',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
            zIndex: 2000,
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 3,
            mt: 1,
          }
        }}
        transformOrigin={{ horizontal: 'left', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
      >
        {NAV_CATEGORIES.map((cat, idx) => (
          <div key={cat.label}>
            <ListItemButton 
              onClick={() => handleCategoryToggle(cat.label)}
              sx={{
                py: 1.5,
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.05)' },
              }}
            >
              <ListItemText 
                primary={cat.label} 
                sx={{ 
                  '& .MuiListItemText-primary': {
                    fontWeight: 600,
                    fontSize: '0.875rem',
                  }
                }}
              />
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
                    sx={{ 
                      pl: 4, 
                      alignItems: 'flex-start', 
                      py: 1.5,
                      '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.05)' },
                    }}
                  >
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      minWidth: 36, 
                      mr: 2, 
                      mt: 0.5,
                      color: 'rgba(255, 255, 255, 0.8)',
                    }}>
                      {link.icon}
                    </Box>
                    <Box>
                      <Typography 
                        fontWeight="600" 
                        sx={{ 
                          color: 'white', 
                          fontSize: '0.875rem',
                          mb: 0.5,
                        }}
                      >
                        {link.label}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: 'rgba(255,255,255,0.6)',
                          fontSize: '0.75rem',
                          lineHeight: 1.3,
                        }}
                      >
                        {link.desc}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </List>
            </Collapse>
            {idx < NAV_CATEGORIES.length - 1 && (
              <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
            )}
          </div>
        ))}
      </Menu>
    </AppBar>
  );
}
