"use client";
import Navbar from "@/components/layout/Navbar";
import { Container, Typography, CircularProgress } from "@mui/material";
import { useUser } from "@/hooks/useUser";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SettingsPage() {
  const { user, loading } = useUser();
  const router = useRouter();
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth/signin");
    }
  }, [user, loading, router]);
  if (loading || !user) {
    return <CircularProgress />;
  }
  return (
    <>
      <Navbar />
      <Container sx={{ pt: 10 }}>
        <Typography variant="h3" fontWeight="bold">
          Settings Page
        </Typography>
      </Container>
    </>
  );
}
