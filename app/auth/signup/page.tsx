"use client";
import Fade from "@mui/material/Fade";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import AuthForm from "@/components/ui/AuthForm";
import Grid from '@mui/material/Grid';

export default function SignUpPage() {
  return (
    <Grid container spacing={2}>
      <Grid sx={{ width: { xs: '100%', sm: '75%', md: '50%' }, maxWidth: 600, margin: '0 auto' }}>
        <Fade in timeout={700}>
          <Paper
            elevation={8}
            sx={{
              p: 5,
              borderRadius: 4,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <Typography variant="h4" mb={2}>
              Sign Up
            </Typography>
            <AuthForm isSignUp />
            <Stack direction="row" justifyContent="center" sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Already have an account?{" "}
                <Link
                  href="/auth/signin"
                  style={{
                    color: "#8b5cf6",
                    textDecoration: "underline",
                    fontWeight: 500,
                  }}
                >
                  Sign in
                </Link>
              </Typography>
            </Stack>
          </Paper>
        </Fade>
      </Grid>
    </Grid>
  );
}
