"use client";
import Navbar from "@/components/layout/Navbar";
import { Container, Typography } from "@mui/material";
import { useRequireAuth, AuthLoading } from "@/hooks/useRequireAuth";

export default function TermsPage() {
  const { user, loading } = useRequireAuth();
  if (loading || !user) return <AuthLoading />;
  return (
    <>
      <Navbar />
      <Container sx={{ pt: 10 }}>
        <Typography variant="h3" fontWeight="bold">
          Terms of Service
        </Typography>
      </Container>
    </>
  );
}
