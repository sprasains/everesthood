"use client";
import * as React from 'react';
import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider, Typography, Tooltip } from '@mui/material';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

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

// Add logical section headers and new features
type NavSection = { header?: string; items: { text: string; icon: React.ReactElement; href: string; }[] };

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
    header: 'User',
    items: [
      { text: 'My Profile', icon: <PersonIcon />, href: '/profile' },
      { text: 'My Friends', icon: <GroupIcon />, href: '/friends' },
      { text: 'Achievements', icon: <EmojiEventsIcon />, href: '/achievements' },
      { text: 'AI Personas', icon: <AutoAwesomeIcon />, href: '/settings/personas' },
      { text: 'Settings', icon: <SettingsIcon />, href: '/settings' },
      { text: 'Subscription', icon: <MonetizationOnIcon />, href: '/billing' },
    ],
  },
  {
    header: 'Tools',
    items: [
      { text: 'Analytics Dashboard', icon: <EmojiEventsIcon />, href: '/dashboard/analytics' },
      { text: 'Resume Vibe Check', icon: <WorkIcon />, href: '/tools/resume-checker' },
      { text: 'Creator API', icon: <SettingsIcon />, href: '/settings/api' },
    ],
  },
  {
    header: 'Monetization',
    items: [
      { text: 'Profile Spotlight', icon: <StarIcon />, href: '/profile/spotlight' },
      { text: 'Tipping Credits', icon: <MonetizationOnIcon />, href: '/wallet' },
    ],
  },
];

export default function AppSidebar() {
  const pathname = usePathname();

  const renderListItem = (item: { text: string; icon: React.ReactElement; href: string; }) => {
    const isActive = pathname.startsWith(item.href);
    return (
      <ListItem key={item.text} disablePadding>
        <Tooltip title={item.text} placement="right" arrow>
          <ListItemButton
            component={Link}
            href={item.href}
            sx={{
              borderRadius: 2,
              mb: 1,
              bgcolor: isActive ? 'rgba(139, 92, 246, 0.2)' : 'transparent',
              borderRight: isActive ? '3px solid #8B5CF6' : 'none',
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' },
            }}
          >
            <ListItemIcon sx={{ color: 'white', minWidth: '40px' }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItemButton>
        </Tooltip>
      </ListItem>
    );
  };

  return (
    <Box
      component="aside"
      sx={{
        width: 250,
        height: '100vh',
        position: 'fixed',
        bgcolor: '#111827',
        borderRight: '1px solid rgba(255, 255, 255, 0.1)',
        display: { xs: 'none', md: 'flex' },
        flexDirection: 'column',
        p: 1,
      }}
    >
      <Typography variant="h5" fontWeight="bold" sx={{ p: 2, color: 'white' }}>Everhood</Typography>
      {navSections.map((section, idx) => (
        <React.Fragment key={section.header || idx}>
          {section.header && (
            <Typography variant="caption" sx={{ color: 'gray', pl: 2, pt: idx === 0 ? 0 : 2, pb: 0.5, textTransform: 'uppercase', letterSpacing: 1 }}>
              {section.header}
            </Typography>
          )}
          <List>{section.items.map(renderListItem)}</List>
          {idx < navSections.length - 1 && <Divider sx={{ my: 1, borderColor: 'rgba(255, 255, 255, 0.1)' }} />}
        </React.Fragment>
      ))}
      <Divider sx={{ my: 2, borderColor: 'rgba(255, 255, 255, 0.1)' }} />
      <OpportunityColumn />
    </Box>
  );
}
