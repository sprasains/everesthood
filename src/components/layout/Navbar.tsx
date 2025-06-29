"use client";
import { AppBar, Toolbar, Button, Typography, IconButton, Avatar, Box } from "@mui/material";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import { motion } from "framer-motion";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useUser } from "@/hooks/useUser";
import NotificationsIcon from "@mui/icons-material/Notifications";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import NotificationDropdown from '@/components/ui/NotificationDropdown';

export default function Navbar() {
  const { data: session } = useSession();
  const { user } = useUser();

  return (
    <AppBar
      data-testid="navbar"
      position="fixed"
      sx={{
        background: "linear-gradient(90deg, #6a11cb, #2575fc)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        {/* Logo and Dashboard Link */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
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
          <Link href="/dashboard" style={{ textDecoration: "none" }}>
            <Button
              variant="text"
              sx={{ color: "white", fontWeight: "medium", textTransform: "none" }}
            >
              📊 Dashboard
            </Button>
          </Link>
          <Link href="/genz" style={{ textDecoration: "none" }}>
            <Button
              variant="text"
              sx={{ color: "white", fontWeight: "medium", textTransform: "none" }}
            >
              🌟 Gen-Z Content
            </Button>
          </Link>
        </Box>
        {/* Right-aligned icons, upgrade, avatar, logout */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {user?.subscriptionTier === "FREE" && (
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
