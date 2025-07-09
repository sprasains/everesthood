"use client";
import Navbar from "app/components/layout/Navbar";
import { Container, Typography, CircularProgress } from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const useUser = () => ({ user: { id: 'placeholder', name: 'Placeholder User', weeklyGoal: 5 }, updateUser: () => {}, isLoading: false });

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
