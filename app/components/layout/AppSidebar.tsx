"use client";
import * as React from 'react';
import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider, Typography, Tooltip, Avatar, Chip, LinearProgress } from '@mui/material';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

// Import all necessary icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import ArticleIcon from '@mui/icons-material/Article';
import GroupIcon from '@mui/icons-material/Group';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import WorkIcon from '@mui/icons-material/Work';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SettingsIcon from '@mui/icons-material/Settings';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import PersonIcon from '@mui/icons-material/Person';
import StarIcon from '@mui/icons-material/Star';
import OpportunityColumn from './OpportunityColumn';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import DescriptionIcon from '@mui/icons-material/Description';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import CampaignIcon from '@mui/icons-material/Campaign';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import { useUser } from '@/hooks/useUser';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import PsychologyIcon from '@mui/icons-material/Psychology';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AnalyticsIcon from '@mui/icons-material/Analytics';

// Add logical section headers and new features
type NavSection = { header?: string; items: { text: string; icon: React.ReactElement; href: string; badge?: string; }[] };

const navSections: NavSection[] = [
  {
    header: 'Main',
    items: [
      { text: 'Dashboard', icon: <DashboardIcon />, href: '/dashboard' },
      { text: 'News Feed', icon: <ArticleIcon />, href: '/news' },
      { text: 'Community', icon: <GroupIcon />, href: '/community' },
      { text: 'Opportunities', icon: <WorkIcon />, href: '/careers' },
      { text: 'Exclusive Content', icon: <StarIcon />, href: '/exclusive' },
    ],
  },
  {
    header: 'Modules',
    items: [
      { text: 'Money', icon: <AccountBalanceWalletIcon />, href: '/money' },
      { text: 'Schedule', icon: <CalendarMonthIcon />, href: '/schedule' },
      { text: 'Family', icon: <FamilyRestroomIcon />, href: '/family' },
      { text: 'Docs & Vault', icon: <DescriptionIcon />, href: '/docs' },
      { text: 'Health & Wellness', icon: <LocalHospitalIcon />, href: '/health' },
      { text: 'Shopping', icon: <ShoppingCartIcon />, href: '/shopping' },
      { text: 'Productivity Hub', icon: <AssignmentTurnedInIcon />, href: '/hub' },
    ],
  },
  {
    header: 'User',
    items: [
      { text: 'My Profile', icon: <PersonIcon />, href: '/profile' },
      { text: 'My Friends', icon: <GroupIcon />, href: '/friends' },
      { text: 'Achievements', icon: <EmojiEventsIcon />, href: '/achievements' },
      { text: 'AI Personas', icon: <AutoAwesomeIcon />, href: '/settings/personas' },
      { text: 'Settings', icon: <SettingsIcon />, href: '/settings' },
      { text: 'Subscription', icon: <MonetizationOnIcon />, href: '/billing' },
      { text: 'Billing & Usage', icon: <MonetizationOnIcon />, href: '/settings/billing' },
    ],
  },
  {
    header: 'Tools',
    items: [
      { text: 'Analytics Dashboard', icon: <EmojiEventsIcon />, href: '/dashboard/analytics' },
      // Add Marketplace Analytics to sidebar navigation
      { text: 'Marketplace Analytics', icon: <AutoAwesomeIcon />, href: '/agents/analytics' },
      { text: 'Resume Vibe Check', icon: <WorkIcon />, href: '/tools/resume-checker' },
      { text: 'Creator API', icon: <SettingsIcon />, href: '/settings/api' },
    ],
  },
  {
    header: 'Monetization',
    items: [
      { text: 'Creator Dashboard', icon: <AnalyticsIcon />, href: '/creator-dashboard' },
      { text: 'Profile Spotlight', icon: <StarIcon />, href: '/profile/spotlight' },
      { text: 'Tipping Credits', icon: <MonetizationOnIcon />, href: '/wallet' },
      { text: 'Ambassador Hub', icon: <CampaignIcon />, href: '/ambassador' },
    ],
  },
  {
    header: 'Wellness',
    items: [
      { text: 'Digital Zen', icon: <LocalHospitalIcon />, href: '/digital-zen' },
    ],
  },
  {
    header: 'AI',
    items: [
      { text: 'AI Summaries', icon: <AutoAwesomeIcon />, href: '/summaries' },
      { text: 'Custom Personas', icon: <PsychologyIcon />, href: '/personas' },
    ],
  },
  {
    header: 'Learning',
    items: [
      { text: 'Guides & Tutorials', icon: <MenuBookIcon />, href: '/guides' },
    ],
  },
  {
    header: 'Content',
    items: [
      { text: 'News & Articles', icon: <ArticleIcon />, href: '/news' },
    ],
  },
  {
    header: 'Info',
    items: [
      { text: 'API Docs', icon: <DescriptionIcon />, href: '/api-docs' },
      { text: 'Contact', icon: <ContactMailIcon />, href: '/contact' },
      { text: 'Privacy', icon: <SettingsIcon />, href: '/privacy' },
      { text: 'Security', icon: <SettingsIcon />, href: '/security' },
      { text: 'Terms', icon: <SettingsIcon />, href: '/terms' },
    ],
  },
  {
    header: 'Admin',
    items: [
      { text: 'Admin Dashboard', icon: <SupervisorAccountIcon />, href: '/admin' },
      // Only show Moderation if user is admin/moderator
      // { text: 'Moderation', icon: <SupervisorAccountIcon />, href: '/moderation' },
      // Only show Queues if user is admin
      ...(user?.role === 'admin' ? [
        { text: 'Queues', icon: <SettingsIcon />, href: '/admin/queues' }
      ] : [])
    ],
  },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const { user } = useUser();

  const renderListItem = (item: { text: string; icon: React.ReactElement; href: string; badge?: string; }) => {
    const isActive = (pathname ?? '').startsWith(item.href);
    return (
      <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
        <Tooltip title={item.text} placement="right" arrow>
          <ListItemButton
            component={Link}
            href={item.href}
            aria-current={isActive ? 'page' : undefined}
            sx={{
              borderRadius: 2,
              mx: 1,
              py: 1.5,
              px: 2,
              bgcolor: isActive ? 'primary.main' : 'transparent',
              color: isActive ? 'primary.contrastText' : 'text.primary',
              border: isActive ? '1px solid' : '1px solid transparent',
              borderColor: isActive ? 'primary.main' : 'transparent',
              boxShadow: isActive ? '0 4px 12px rgba(139, 92, 246, 0.25)' : 'none',
              '&:hover': { 
                bgcolor: isActive ? 'primary.dark' : 'action.hover',
                transform: 'translateY(-1px)',
                boxShadow: isActive ? '0 6px 16px rgba(139, 92, 246, 0.35)' : '0 2px 8px rgba(0, 0, 0, 0.1)',
              },
              transition: 'all 0.2s ease-in-out',
              minHeight: 48,
              position: 'relative',
              overflow: 'hidden',
              '&::before': isActive ? {
                content: '""',
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: 3,
                bgcolor: 'primary.main',
                borderRadius: '0 2px 2px 0',
              } : {},
            }}
          >
            <ListItemIcon 
              sx={{ 
                color: 'inherit', 
                minWidth: '40px', 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                opacity: isActive ? 1 : 0.8,
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.text} 
              sx={{ 
                '& .MuiListItemText-primary': {
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.875rem',
                }
              }}
            />
            {item.badge && (
              <Chip 
                label={item.badge} 
                size="small" 
                sx={{ 
                  ml: 1, 
                  height: 20, 
                  fontSize: '0.75rem',
                  bgcolor: 'error.main',
                  color: 'error.contrastText',
                }} 
              />
            )}
          </ListItemButton>
        </Tooltip>
      </ListItem>
    );
  };

  return (
    <Box
      component="aside"
      sx={{
        width: 280,
        height: '100vh',
        position: 'fixed',
        bgcolor: 'background.paper',
        borderRight: '1px solid',
        borderColor: 'divider',
        display: { xs: 'none', md: 'flex' },
        flexDirection: 'column',
        zIndex: 1200,
        boxShadow: '2px 0 8px rgba(0, 0, 0, 0.1)',
      }}
    >
      {/* Header with logo and user info */}
      <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
              }}
            >
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                E
              </Typography>
            </Box>
            <Typography variant="h5" fontWeight="bold" sx={{ 
              background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Everesthood
            </Typography>
          </Box>
        </motion.div>

        {/* User profile section */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Box sx={{ 
              p: 2, 
              borderRadius: 3, 
              bgcolor: 'action.hover',
              border: '1px solid',
              borderColor: 'divider',
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Avatar 
                  src={user.image || undefined} 
                  alt={user.name || ""} 
                  sx={{ width: 48, height: 48, bgcolor: 'primary.main' }}
                >
                  {user.name?.charAt(0) || 'U'}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="subtitle2" fontWeight="bold" noWrap>
                    {user.name || 'User'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap>
                    Level {user.level || 1}
                  </Typography>
                </Box>
                <Chip 
                  label={user.subscriptionTier || 'FREE'} 
                  size="small" 
                  sx={{ 
                    bgcolor: user.subscriptionTier === 'PREMIUM' ? 'warning.main' : 
                           user.subscriptionTier === 'CREATOR' ? 'secondary.main' : 'grey.500',
                    color: 'white',
                    fontSize: '0.75rem',
                  }}
                />
              </Box>
              
              {/* XP Progress */}
              <Box sx={{ mb: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" color="text.secondary">
                    {user.xp || 0} XP
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {(user.level || 1) * 100} XP
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={(((user.xp || 0) % 100) / 100) * 100} 
                  sx={{ 
                    height: 6, 
                    borderRadius: 3,
                    bgcolor: 'action.disabledBackground',
                    '& .MuiLinearProgress-bar': { 
                      bgcolor: 'primary.main',
                      borderRadius: 3,
                    } 
                  }} 
                />
              </Box>
            </Box>
          </motion.div>
        )}
      </Box>

      {/* Navigation sections */}
      <Box sx={{ flex: 1, overflow: 'auto', py: 2 }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {navSections.map((section, idx) => (
            <React.Fragment key={section.header || idx}>
              {section.header && (
                <Typography 
                  variant="overline" 
                  sx={{ 
                    color: 'text.secondary', 
                    pl: 3, 
                    pt: idx === 0 ? 0 : 3, 
                    pb: 1, 
                    textTransform: 'uppercase', 
                    letterSpacing: 1,
                    fontSize: '0.75rem',
                    fontWeight: 600,
                  }}
                >
                  {section.header}
                </Typography>
              )}
              <List sx={{ py: 0 }}>
                {section.items.map(renderListItem)}
              </List>
              {idx < navSections.length - 1 && (
                <Divider sx={{ my: 2, mx: 2, borderColor: 'divider' }} />
              )}
            </React.Fragment>
          ))}
        </motion.div>
      </Box>

      {/* Bottom section with opportunities */}
      <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <OpportunityColumn />
      </Box>
    </Box>
  );
}
