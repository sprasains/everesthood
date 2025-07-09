"use client";
import Navbar from "app/components/layout/Navbar";
import { Box, Container, Typography, Button, CircularProgress, Paper } from "@mui/material";
import { useState } from "react";

export default function BillingPage() {
  const [loading, setLoading] = useState(false);

  const redirectToCustomerPortal = async () => {
    setLoading(true);
    const response = await fetch('/api/v1/stripe/create-portal-session', { method: 'POST' });
    if(response.ok) {
        const { url } = await response.json();
        window.location.href = url;
    } else {
        alert("Could not open management portal. Please contact support.");
        setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#0f2027", color: "white" }}>
      <Navbar />
      <Container maxWidth="sm" sx={{ pt: 12, textAlign: 'center' }}>
        <Paper sx={{ p: 4, bgcolor: 'rgba(255,255,255,0.05)' }}>
            <Typography variant="h4" fontWeight="bold">Subscription Management</Typography>
            <Typography sx={{ my: 2 }}>Click below to manage your billing information, view invoices, and update or cancel your subscription.</Typography>
            <Button variant="contained" size="large" disabled={loading} onClick={redirectToCustomerPortal}>
                {loading ? <CircularProgress size={24} /> : "Open Billing Portal"}
            </Button>
        </Paper>
      </Container>
    </Box>
  );
}
