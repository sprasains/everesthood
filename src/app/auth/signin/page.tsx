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
  Alert,
  Fade,
  Divider,
  Box,
  IconButton,
} from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import GitHubIcon from "@mui/icons-material/GitHub";
import FacebookIcon from "@mui/icons-material/Facebook";
import PersonIcon from "@mui/icons-material/Person";
import { useForm } from "react-hook-form";
import { useSnackbar } from 'notistack';

const TEST_USERS = [
  { email: "test1@example.com", password: "password123" },
  { email: "test2@example.com", password: "password123" },
];

export default function SignInPage() {
  const { enqueueSnackbar } = useSnackbar();
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignIn = async (data: { email: string; password: string }) => {
    setLoading(true);
    const res = await signIn("credentials", {
      redirect: false,
      email: data.email,
      password: data.password,
    });
    setLoading(false);
    if (res?.error) {
      enqueueSnackbar("Invalid credentials", { variant: "error" });
    } else {
      enqueueSnackbar("Signed in!", { variant: "success" });
      router.push("/dashboard");
    }
  };

  const handleTestUser = (user: { email: string; password: string }) => {
    setValue("email", user.email);
    setValue("password", user.password);
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
                Sign In
              </Typography>
              <Button
                component={Link}
                href="/auth/signup"
                variant="text"
                color="secondary"
                sx={{ fontWeight: 600 }}
              >
                Sign Up
              </Button>
            </Box>
            <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
              {TEST_USERS.map((user, i) => (
                <Button
                  key={i}
                  size="small"
                  variant="outlined"
                  color="info"
                  startIcon={<PersonIcon />}
                  onClick={() => handleTestUser(user)}
                  sx={{ textTransform: "none" }}
                >
                  Test User {i + 1}
                </Button>
              ))}
            </Box>
            <form onSubmit={handleSubmit(handleSignIn)} autoComplete="off">
              <TextField
                label="Email"
                type="email"
                fullWidth
                margin="normal"
                required
                autoFocus
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
                {loading ? "Signing in..." : "Sign In"}
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
