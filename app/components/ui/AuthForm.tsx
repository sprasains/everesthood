"use client";

import { useForm } from "react-hook-form";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useSnackbar } from "notistack";
import { useState, useEffect } from "react";
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
import Image from "next/image";

interface AuthFormProps {
  isSignUp?: boolean;
}

interface TestUser {
  label: string;
  email: string;
  password: string;
}
const testUsers: TestUser[] = [
  { label: 'Demo User', email: 'demo@everesthood.com', password: 'password123' },
  { label: 'Test User 0', email: 'test0@example.com', password: 'password123' },
  { label: 'Test User 1', email: 'test1@example.com', password: 'password123' },
  { label: 'Test User 2', email: 'test2@example.com', password: 'password123' },
  { label: 'Test User 3', email: 'test3@example.com', password: 'password123' },
  { label: 'Test User 4', email: 'test4@example.com', password: 'password123' },
];

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String((error as { message: unknown }).message);
  }
  return String(error);
}

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

  // Add toggle for sign in/sign up
  const [mode, setMode] = useState(isSignUp ? 'signup' : 'signin');

  // Check if user is already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const session = await getSession();
      if (session) {
        router.push('/dashboard');
      }
    };
    checkAuth();
  }, [router]);

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      console.log('AuthForm onSubmit data:', data);
      if (mode === 'signup') {
        // Handle sign-up logic here
        const res = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        console.log('Sign up response:', res);
        if (res.ok) {
          enqueueSnackbar("Sign up successful! Please sign in.", {
            variant: "success",
          });
          setMode('signin'); // Switch to sign in mode after sign up
        } else {
          let errorData: { message?: string } = {};
          try {
            errorData = await res.json();
          } catch (jsonErr) {
            console.error('Error parsing sign up error response:', jsonErr);
          }
          console.error('Sign up error:', errorData, 'Status:', res.status, 'StatusText:', res.statusText);
          enqueueSnackbar(errorData?.message || `Registration failed: ${res.status} ${res.statusText}` , { variant: "error" });
        }
      } else {
        // Handle sign-in logic
        let result;
        try {
          result = await signIn("credentials", {
            redirect: false,
            email: data.email,
            password: data.password,
          });
        } catch (signInErr) {
          console.error('signIn threw error:', signInErr);
          enqueueSnackbar("Sign in failed: " + getErrorMessage(signInErr), { variant: "error" });
          setIsSubmitting(false);
          return;
        }
        
        console.log('SIGNIN RESULT', result);
        if (result?.error) {
          console.error('Sign in error:', result.error);
          enqueueSnackbar("Invalid email or password. Please try again.", {
            variant: "error",
          });
        } else if (result?.ok) {
          enqueueSnackbar("Signed in successfully!", { variant: "success" });
          // ✅ Redirect to dashboard after successful login
          router.push('/dashboard');
        } else {
          console.error('Unknown sign in result:', result);
          enqueueSnackbar("Unknown sign in error.", { variant: "error" });
        }
      }
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      const errStack = error instanceof Error ? error.stack : '';
      console.error('AuthForm onSubmit error:', errorMessage, errStack);
      enqueueSnackbar("An unexpected error occurred: " + errorMessage, { variant: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update email/password fields when a test user is selected
  const handleTestUserSelect = (idx: number) => {
    setSelectedTestUser(idx);
    const user = testUsers[idx];
    setValue('email', user.email, { shouldValidate: true });
    setValue('password', user.password, { shouldValidate: true });
    // Automatically submit the form for test users
    setTimeout(() => {
      handleSubmit(onSubmit)();
    }, 100); // slight delay to ensure form state updates
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
        maxWidth: 600,
        margin: "0 auto",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.18)",
        position: 'relative',
      }}
    >
      {/* Background image behind buttons (Next.js Image for best practice) */}
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: 180,
        zIndex: 0,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        overflow: 'hidden',
        opacity: 0.25,
      }}>
        <Image
          src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80"
          alt="Colorful mountain background"
          fill
          style={{ objectFit: 'cover' }}
          priority
          sizes="(max-width: 600px) 100vw, 600px"
        />
      </Box>
      <Stack spacing={2} alignItems="center" mb={2} sx={{ position: 'relative', zIndex: 1 }}>
        {/* Remove logo, keep only heading and subheading */}
        <Typography
          variant="h3"
          fontWeight={900}
          sx={{
            background: "linear-gradient(90deg, #ff4e53, #ffcc00, #8b5cf6)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontFamily: 'Poppins, Montserrat, sans-serif',
            letterSpacing: 1.5,
            mb: 1,
            textShadow: "0 2px 16px rgba(139,92,246,0.12)",
            textAlign: 'center',
          }}
        >
          {mode === 'signup' ? 'Create Your Account' : 'Welcome Back!'}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            maxWidth: 480,
            margin: '0 auto',
            color: '#d0d0d0',
            fontSize: { xs: '1rem', md: '1.1rem' },
            lineHeight: 1.7,
            padding: { xs: 1, md: 2 },
            marginBottom: 2,
            textAlign: 'center',
          }}
        >
          {mode === 'signup'
            ? 'Sign up to join the AI Vibe Hub for Gen-Z. Explore, connect, and level up your world!'
            : 'Sign in to join the AI Vibe Hub for Gen-Z. Explore, connect, and level up your world!'}
        </Typography>
        {/* Toggle button */}
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', mb: 2 }}>
          <Button
            onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
            variant="outlined"
            sx={{
              borderRadius: 8,
              fontWeight: 'bold',
              px: 4,
              py: 1.2,
              background: mode === 'signin'
                ? 'linear-gradient(90deg, #8b5cf6 0%, #ffcc00 100%)'
                : 'linear-gradient(90deg, #ff4e53 0%, #ffcc00 100%)',
              color: '#fff',
              border: 'none',
              boxShadow: '0 2px 12px rgba(139,92,246,0.10)',
              transition: 'all 0.2s',
              '&:hover': {
                background: mode === 'signin'
                  ? 'linear-gradient(90deg, #ffcc00 0%, #8b5cf6 100%)'
                  : 'linear-gradient(90deg, #ffcc00 0%, #ff4e53 100%)',
                color: '#222',
                boxShadow: '0 4px 24px rgba(255, 78, 83, 0.15)',
              },
            }}
          >
            {mode === 'signin' ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
          </Button>
        </Box>
      </Stack>
      {/* Test User Dropdown */}
      {mode === 'signin' && (
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
              {testUsers.map((user: TestUser, idx: number) => (
                <option key={user.email} value={idx}>{user.label} ({user.email})</option>
              ))}
            </select>
          </Button>
          {selectedTestUser !== null && (
            null
          )}
        </Box>
      )}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2} sx={{ width: "100%" }}>
          {mode === 'signup' && (
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
            autoFocus={mode !== 'signup'}
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
              background: (mode === 'signup')
                ? "linear-gradient(45deg, #8b5cf6, #ffcc00)"
                : "linear-gradient(45deg, #ff4e53, #ffcc00)",
              color: "#222",
              boxShadow: (mode === 'signup')
                ? '0 4px 16px rgba(139, 92, 246, 0.2)'
                : '0 4px 16px rgba(255, 78, 83, 0.2)',
              borderRadius: 8,
              '&:hover': {
                background: (mode === 'signup')
                  ? "linear-gradient(45deg, #ffcc00, #8b5cf6)"
                  : "linear-gradient(45deg, #ffcc00, #ff4e53)",
                color: "#111",
              },
            }}
          >
            {isSubmitting ? (
              <CircularProgress size={24} />
            ) : mode === 'signup' ? (
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
                console.log('Google signIn result:', result);
                if (!result?.ok) enqueueSnackbar("Google sign-in failed.", { variant: "error" });
              } catch (e) {
                const errorMessage = getErrorMessage(e);
                const errStack = e instanceof Error ? e.stack : '';
                console.error('Google signIn error:', errorMessage, errStack);
                enqueueSnackbar("Google sign-in failed: " + errorMessage, { variant: "error" });
              } finally {
                setIsSubmitting(false);
              }
            }}
            disabled={isSubmitting}
          >
            {mode === 'signup' ? "Sign up with Google" : "Sign in with Google"}
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
                console.log('Facebook signIn result:', result);
                if (!result?.ok) enqueueSnackbar("Facebook sign-in failed.", { variant: "error" });
              } catch (e) {
                const errorMessage = getErrorMessage(e);
                const errStack = e instanceof Error ? e.stack : '';
                console.error('Facebook signIn error:', errorMessage, errStack);
                enqueueSnackbar("Facebook sign-in failed: " + errorMessage, { variant: "error" });
              } finally {
                setIsSubmitting(false);
              }
            }}
            disabled={isSubmitting}
          >
            {mode === 'signup' ? "Sign up with Facebook" : "Sign in with Facebook"}
          </Button>
        </Stack>
      </form>
    </motion.div>
  );
}
