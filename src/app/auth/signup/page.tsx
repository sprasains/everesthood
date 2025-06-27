"use client";
import { Grid } from "@mui/material";
import Fade from "@mui/material/Fade";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import AuthForm from "@/components/ui/AuthForm";

export default function SignUpPage() {
  return (
    <Grid
      container
      justifyContent="center"
      alignItems="center"
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #e3f2fd 0%, #ede7f6 100%)",
      }}
    >
      <Grid item xs={11} sm={8} md={5} lg={4}>
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
