"use client";

import { useForm } from "react-hook-form";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useSnackbar } from "notistack";
import { useState } from "react";
import {
  Button,
  TextField,
  CircularProgress,
  Stack,
  Typography,
  IconButton,
  InputAdornment,
  Box,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import GoogleIcon from "@mui/icons-material/Google";
import FacebookIcon from '@mui/icons-material/Facebook';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { motion } from "framer-motion";

interface AuthFormProps {
  isSignUp?: boolean;
}

// Hardcoded test/demo users for dropdown
const testUsers = [
  { label: 'Admin', email: 'admin@example.com', password: 'password123' },
  { label: 'Demo User', email: 'demo@everesthood.com', password: 'password123' },
  { label: 'Test User 0', email: 'test0@example.com', password: 'password123' },
  { label: 'Test User 1', email: 'test1@example.com', password: 'password123' },
  { label: 'Test User 2', email: 'test2@example.com', password: 'password123' },
  { label: 'Test User 3', email: 'test3@example.com', password: 'password123' },
  { label: 'Test User 4', email: 'test4@example.com', password: 'password123' },
];

export default function AuthForm({ isSignUp = false }: AuthFormProps) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm();
  const [selectedTestUser, setSelectedTestUser] = useState<number | null>(null);

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      if (isSignUp) {
        // Handle sign-up logic here
        const res = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (res.ok) {
          enqueueSnackbar("Sign up successful! Please sign in.", {
            variant: "success",
          });
          router.push("/auth/signin");
        } else {
          const errorData = await res.json().catch(() => ({}));
          enqueueSnackbar(errorData.message || "Registration failed", { variant: "error" });
        }
      } else {
        const result = await signIn("credentials", {
          redirect: false,
          email: data.email,
          password: data.password,
        });

        if (result?.error) {
          enqueueSnackbar("Invalid email or password. Please try again.", {
            variant: "error",
          });
        } else if (result?.ok) {
          enqueueSnackbar("Signed in successfully!", { variant: "success" });
          // Force session refresh before redirect
          setTimeout(() => {
            router.push("/dashboard");
          }, 300);
        }
      }
    } catch (error) {
      enqueueSnackbar("An unexpected error occurred.", { variant: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update email/password fields when a test user is selected
  const handleTestUserSelect = (idx: number) => {
    setSelectedTestUser(idx);
    const user = testUsers[idx];
    setValue('email', user.email);
    setValue('password', user.password);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      style={{
        background: "rgba(255,255,255,0.08)",
        borderRadius: 24,
        boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
        padding: 32,
        maxWidth: 400,
        margin: "0 auto",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.18)",
      }}
    >
      <Stack spacing={2} alignItems="center" mb={2}>
        <img src="/logo.svg" alt="Everhood Logo" style={{ width: 56, height: 56, marginBottom: 8 }} />
        <Typography variant="h5" fontWeight="bold" sx={{ background: "linear-gradient(45deg, #ff4e53, #ffcc00)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          {isSignUp ? "Create your account" : "Sign in to Everhood"}
        </Typography>
      </Stack>
      {/* Test User Dropdown */}
      {!isSignUp && (
        <Box mb={2}>
          <Button
            variant="outlined"
            startIcon={<ArrowDropDownIcon />}
            sx={{ borderRadius: 8, fontWeight: 'bold', mb: 1, background: 'rgba(255,255,255,0.7)', color: '#222' }}
            aria-label="Sign in with test user"
            id="test-user-dropdown"
            aria-haspopup="listbox"
            aria-expanded={selectedTestUser !== null}
          >
            <select
              style={{ background: 'transparent', border: 'none', fontWeight: 'bold', fontSize: 16, outline: 'none' }}
              onChange={e => handleTestUserSelect(Number(e.target.value))}
              value={selectedTestUser ?? ''}
            >
              <option value="" disabled>Select a test user…</option>
              {testUsers.map((user, idx) => (
                <option key={user.email} value={idx}>{user.label} ({user.email})</option>
              ))}
            </select>
          </Button>
          {selectedTestUser !== null && (
            <Button
              variant="contained"
              color="secondary"
              sx={{ ml: 2, borderRadius: 8, fontWeight: 'bold' }}
              onClick={handleSubmit(onSubmit)}
              disabled={isSubmitting}
            >
              Sign in as {testUsers[selectedTestUser].label}
            </Button>
          )}
        </Box>
      )}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2} sx={{ width: "100%" }}>
          {isSignUp && (
            <TextField
              label="Name"
              {...register("name", { required: "Name is required" })}
              error={!!errors.name}
              helperText={errors.name?.message as string}
              disabled={isSubmitting}
              fullWidth
              autoFocus
            />
          )}
          <TextField
            label="Email"
            {...register("email", { required: "Email is required" })}
            error={!!errors.email}
            helperText={errors.email?.message as string}
            disabled={isSubmitting}
            fullWidth
            autoFocus={!isSignUp}
          />
          <TextField
            label="Password"
            type={showPassword ? "text" : "password"}
            {...register("password", { required: "Password is required" })}
            error={!!errors.password}
            helperText={errors.password?.message as string}
            disabled={isSubmitting}
            fullWidth
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            fullWidth
            sx={{
              py: 1.5,
              fontWeight: "bold",
              background: "linear-gradient(45deg, #ff4e53, #ffcc00)",
              color: "#222",
              boxShadow: "0 4px 16px rgba(255, 78, 83, 0.2)",
              borderRadius: 8,
              '&:hover': {
                background: "linear-gradient(45deg, #ffcc00, #ff4e53)",
                color: "#111",
              },
            }}
          >
            {isSubmitting ? (
              <CircularProgress size={24} />
            ) : isSignUp ? (
              "Sign Up"
            ) : (
              "Sign In"
            )}
          </Button>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Box flex={1} height={1} bgcolor="#eee" borderRadius={2} />
            <Typography variant="caption" color="text.secondary">or</Typography>
            <Box flex={1} height={1} bgcolor="#eee" borderRadius={2} />
          </Stack>
          {/* Google Sign In */}
          <Button
            variant="outlined"
            fullWidth
            startIcon={<GoogleIcon />}
            sx={{
              borderRadius: 8,
              fontWeight: "bold",
              background: "rgba(255,255,255,0.7)",
              color: "#222",
              '&:hover': {
                background: "#fff",
                color: "#ff4e53",
                borderColor: "#ff4e53",
              },
            }}
            onClick={async () => {
              setIsSubmitting(true);
              try {
                const result = await signIn("google", { callbackUrl: "/dashboard" });
                if (!result?.ok) enqueueSnackbar("Google sign-in failed.", { variant: "error" });
              } catch (e) {
                enqueueSnackbar("Google sign-in failed.", { variant: "error" });
              } finally {
                setIsSubmitting(false);
              }
            }}
            disabled={isSubmitting}
          >
            {isSignUp ? "Sign up with Google" : "Sign in with Google"}
          </Button>
          {/* Facebook Sign In */}
          <Button
            variant="outlined"
            fullWidth
            startIcon={<FacebookIcon sx={{ color: '#1877f3' }} />}
            sx={{
              borderRadius: 8,
              fontWeight: "bold",
              background: "rgba(255,255,255,0.7)",
              color: "#222",
              '&:hover': {
                background: "#fff",
                color: "#1877f3",
                borderColor: "#1877f3",
              },
            }}
            onClick={async () => {
              setIsSubmitting(true);
              try {
                const result = await signIn("facebook", { callbackUrl: "/dashboard" });
                if (!result?.ok) enqueueSnackbar("Facebook sign-in failed.", { variant: "error" });
              } catch (e) {
                enqueueSnackbar("Facebook sign-in failed.", { variant: "error" });
              } finally {
                setIsSubmitting(false);
              }
            }}
            disabled={isSubmitting}
          >
            {isSignUp ? "Sign up with Facebook" : "Sign in with Facebook"}
          </Button>
        </Stack>
      </form>
    </motion.div>
  );
} 