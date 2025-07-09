"use client";
import Navbar from "app/components/layout/Navbar";
import { Container, Typography } from "@mui/material";
const useRequireAuth = () => { return { user: { id: 'placeholder' } }; };

const AuthLoading = () => <div>Loading...</div>;

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
