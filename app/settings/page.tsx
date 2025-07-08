"use client";
import Navbar from "@/components/layout/Navbar";
import { Container, Typography, CircularProgress } from "@mui/material";
import { useUser } from '@/src/hooks/useUser';
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SettingsPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/auth/signin");
    }
  }, [user, isLoading, router]);
  if (isLoading || !user) {
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
