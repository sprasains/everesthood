"use client";
import { useState, useEffect } from 'react';
import { IconButton, Badge, Popover, Box, Typography, List, ListItem, ListItemAvatar, Avatar, ListItemText, CircularProgress, Button, Divider, Tooltip, ListItemIcon } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import CommentIcon from '@mui/icons-material/Comment';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PostAddIcon from '@mui/icons-material/PostAdd';
import ArticleIcon from '@mui/icons-material/Article';
import Link from 'next/link';
import { getSocket, joinUserRoom } from '@/lib/socket';
import { useSession } from 'next-auth/react';

function timeAgo(dateString: string) {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

function getNotificationIcon(type: string) {
  switch (type) {
    case 'NEW_COMMENT':
    case 'REPLY':
      return <CommentIcon sx={{ color: '#1976d2' }} />;
    case 'POST_LIKE':
      return <ThumbUpAltIcon sx={{ color: '#f44336' }} />;
    case 'FRIEND_REQUEST':
      return <PersonAddIcon sx={{ color: '#43a047' }} />;
    case 'FRIEND_ACCEPT':
      return <CheckCircleIcon sx={{ color: '#ffb300' }} />;
    case 'NEW_POST':
      return <PostAddIcon sx={{ color: '#7c4dff' }} />;
    case 'NEWS':
      return <ArticleIcon sx={{ color: '#0288d1' }} />;
    default:
      return <NotificationsIcon sx={{ color: '#757575' }} />;
  }
}

export default function NotificationDropdown() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [markingAll, setMarkingAll] = useState(false);
  const { data: session } = useSession();

  const open = Boolean(anchorEl);

  useEffect(() => {
    if (session?.user?.id) {
      joinUserRoom(session.user.id);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    if (open) {
      fetchNotifications();
    }
  }, [open]);

  useEffect(() => {
    // Real-time websocket notification
    const socket = getSocket();
    socket.on('notification', () => {
      fetchNotifications();
    });
    return () => {
      socket.off('notification');
    };
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    const res = await fetch('/api/v1/notifications');
    if (res.ok) {
      const data = await res.json();
      setNotifications(data);
      setUnreadCount(data.filter((n: any) => !n.isRead).length);
    }
    setLoading(false);
  };

  const markAllAsRead = async () => {
    setMarkingAll(true);
    await fetch('/api/v1/notifications', { method: 'POST' });
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    setMarkingAll(false);
  };

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Tooltip title="Notifications">
        <IconButton color="inherit" onClick={handleOpen} aria-label="notifications">
          <Badge badgeContent={unreadCount} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Tooltip>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ sx: { minWidth: 370, maxWidth: 420, p: 0, borderRadius: 3, boxShadow: 6, bgcolor: 'white', color: 'black' } }}
      >
        <Box sx={{ p: 2, borderBottom: '1px solid #e4e6eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography fontWeight="bold" fontSize={18}>Notifications</Typography>
          <Button size="small" onClick={markAllAsRead} disabled={markingAll || unreadCount === 0} sx={{ textTransform: 'none', fontWeight: 500 }}>
            Mark all as read
          </Button>
        </Box>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={120}>
            <CircularProgress size={24} />
          </Box>
        ) : notifications.length === 0 ? (
          <Typography sx={{ p: 3, color: '#888', textAlign: 'center' }}>No notifications yet.</Typography>
        ) : (
          <List disablePadding>
            {notifications.map((n, idx) => (
              <>
                <ListItem
                  key={n.id}
                  alignItems="flex-start"
                  sx={{
                    bgcolor: n.isRead ? 'white' : '#e7f3ff',
                    borderRadius: 0,
                    px: 2,
                    py: 1.5,
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                    '&:hover': { bgcolor: n.isRead ? '#f5f6fa' : '#d2e7fb' },
                    position: 'relative',
                  }}
                  component={Link}
                  href={n.type === 'REPLY' || n.type === 'NEW_COMMENT' || n.type === 'NEW_POST' ? `/posts/${n.entityId}` : n.type === 'NEWS' ? `/news/${n.entityId}` : '#'}
                  onClick={handleClose}
                >
                  <ListItemIcon sx={{ minWidth: 36, mr: 1, mt: 0.5 }}>
                    {getNotificationIcon(n.type)}
                  </ListItemIcon>
                  <ListItemAvatar>
                    <Avatar src={n.actor?.profilePicture || n.actor?.image} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography component="span" fontWeight="bold" color="#050505">
                          {n.actor?.name || (n.type === 'NEWS' ? 'News' : 'Someone')}
                        </Typography>
                        <Typography component="span" color="#65676b">
                          {n.type === 'REPLY' ? 'replied to your comment'
                            : n.type === 'NEW_COMMENT' ? 'commented on your post'
                            : n.type === 'NEW_POST' ? 'posted something new'
                            : n.type === 'NEWS' ? 'Breaking News'
                            : n.type.replace('_', ' ')}
                        </Typography>
                        {!n.isRead && (
                          <FiberManualRecordIcon sx={{ color: '#1877f2', fontSize: 14, ml: 1 }} />
                        )}
                      </Box>
                    }
                    secondary={
                      <>
                        {n.snippet && (
                          <Typography variant="body2" color="#65676b" sx={{ fontStyle: 'italic', mb: 0.5 }}>
                            &quot;{n.snippet.length > 80 ? n.snippet.slice(0, 80) + '…' : n.snippet}&quot;
                          </Typography>
                        )}
                        {n.type === 'NEW_POST' && n.title && (
                          <Typography variant="body2" color="#7c4dff" sx={{ fontWeight: 500, mb: 0.5 }}>
                            &quot;{n.title.length > 80 ? n.title.slice(0, 80) + '…' : n.title}&quot;
                          </Typography>
                        )}
                        {n.type === 'NEWS' && n.title && (
                          <Typography variant="body2" color="#0288d1" sx={{ fontWeight: 500, mb: 0.5 }}>
                            &quot;{n.title.length > 80 ? n.title.slice(0, 80) + '…' : n.title}&quot;
                          </Typography>
                        )}
                        <Typography variant="caption" sx={{ color: '#8a8d91', mt: 0.5 }}>
                          {timeAgo(n.createdAt)}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
                {idx !== notifications.length - 1 && <Divider component="li" sx={{ ml: 8, borderColor: '#e4e6eb' }} />}
              </>
            ))}
          </List>
        )}
      </Popover>
    </>
  );
} 