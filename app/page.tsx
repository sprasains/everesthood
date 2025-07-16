"use client";
export const dynamic = "force-dynamic";
import AuthForm from "@/components/ui/AuthForm";
import { Box } from "@mui/material";
import Image from "next/image";

// This page is now a landing page. Auth is handled in /auth/signin and /auth/signup
export default function AuthLandingPage() {
  return (
    <Box
      minHeight="100vh"
      width="100vw"
      sx={{
        background: "linear-gradient(135deg, #0f2027 0%, #8b5cf6 100%)",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Animated background shapes */}
      <Box sx={{
        position: "absolute",
        top: -120,
        left: -120,
        width: 400,
        height: 400,
        background: "radial-gradient(circle at 60% 40%, #ff4e53 0%, transparent 70%)",
        filter: "blur(80px)",
        opacity: 0.7,
        zIndex: 0,
      }} />
      <Box sx={{
        position: "absolute",
        bottom: -100,
        right: -100,
        width: 350,
        height: 350,
        background: "radial-gradient(circle at 40% 60%, #ffcc00 0%, transparent 70%)",
        filter: "blur(80px)",
        opacity: 0.6,
        zIndex: 0,
      }} />
      <Box
        sx={{
          zIndex: 2,
          width: "100%",
          maxWidth: { xs: '98vw', md: '60vw' },
          mx: "auto",
          p: { xs: 2, md: 0 },
        }}
      >
        <AuthForm />
      </Box>
    </Box>
  );
}
