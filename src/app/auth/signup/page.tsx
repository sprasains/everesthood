"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Grid,
  Paper,
  Typography,
  Button,
  TextField,
  Fade,
  Divider,
  Box,
} from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import GitHubIcon from "@mui/icons-material/GitHub";
import FacebookIcon from "@mui/icons-material/Facebook";
import { useForm } from "react-hook-form";
import { useSnackbar } from 'notistack';

export default function SignUpPage() {
  const { enqueueSnackbar } = useSnackbar();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (data: { name: string; email: string; password: string }) => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Sign up failed");
      await signIn("credentials", { email: data.email, password: data.password, redirect: false });
      enqueueSnackbar("Account created!", { variant: "success" });
      router.push("/dashboard");
    } catch (err) {
      enqueueSnackbar("Sign up failed. Try a different email.", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Grid
      container
      justifyContent="center"
      alignItems="center"
      sx={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #e3f2fd 0%, #ede7f6 100%)",
      }}
    >
      <Fade in timeout={700}>
        <Grid item xs={11} sm={8} md={5} lg={4}>
          <Paper
            elevation={8}
            sx={{
              p: 5,
              borderRadius: 4,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography
                variant="h5"
                fontWeight={700}
                color="primary.main"
              >
                Sign Up
              </Typography>
              <Button
                component={Link}
                href="/auth/signin"
                variant="text"
                color="secondary"
                sx={{ fontWeight: 600 }}
              >
                Sign In
              </Button>
            </Box>
            <form onSubmit={handleSubmit(handleSignUp)} autoComplete="off">
              <TextField
                label="Name"
                type="text"
                fullWidth
                margin="normal"
                required
                autoFocus
                {...register("name", { required: "Name is required" })}
                error={!!errors.name}
                helperText={errors.name?.message as string}
              />
              <TextField
                label="Email"
                type="email"
                fullWidth
                margin="normal"
                required
                {...register("email", { required: "Email is required" })}
                error={!!errors.email}
                helperText={errors.email?.message as string}
              />
              <TextField
                label="Password"
                type="password"
                fullWidth
                margin="normal"
                required
                {...register("password", { required: "Password is required" })}
                error={!!errors.password}
                helperText={errors.password?.message as string}
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                sx={{
                  mt: 2,
                  py: 1.2,
                  fontWeight: 600,
                  fontSize: "1rem",
                }}
                disabled={loading}
              >
                {loading ? "Signing up..." : "Sign Up"}
              </Button>
            </form>
            <Divider sx={{ my: 3 }}>or</Divider>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Button
                  onClick={() => signIn("google")}
                  variant="outlined"
                  color="inherit"
                  fullWidth
                  startIcon={<GoogleIcon sx={{ color: "#EA4335" }} />}
                  sx={{ textTransform: "none", fontWeight: 500 }}
                >
                  Google
                </Button>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Button
                  onClick={() => signIn("github")}
                  variant="outlined"
                  color="inherit"
                  fullWidth
                  startIcon={<GitHubIcon />}
                  sx={{ textTransform: "none", fontWeight: 500 }}
                >
                  GitHub
                </Button>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Button
                  onClick={() => signIn("facebook")}
                  variant="outlined"
                  color="inherit"
                  fullWidth
                  startIcon={<FacebookIcon sx={{ color: "#1877F3" }} />}
                  sx={{ textTransform: "none", fontWeight: 500 }}
                >
                  Facebook
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Fade>
    </Grid>
  );
}
