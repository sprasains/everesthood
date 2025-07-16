"use client";
export const dynamic = "force-dynamic";
import Fade from "@mui/material/Fade";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import AuthForm from "@/components/ui/AuthForm";
import Box from "@mui/material/Box";

export default function SignInPage() {
  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
      <Box sx={{ width: { xs: '100%', sm: '75%', md: '50%' }, maxWidth: 600, margin: '0 auto' }}>
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
              Sign In
            </Typography>
            <AuthForm />
            <Stack direction="row" justifyContent="center" sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Don&apos;t have an account?{" "}
                <Link
                  href="/auth/signup"
                  style={{
                    color: "#8b5cf6",
                    textDecoration: "underline",
                    fontWeight: 500,
                  }}
                >
                  Sign up
                </Link>
              </Typography>
            </Stack>
          </Paper>
        </Fade>
      </Box>
    </Box>
  );
}
