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
  Grid,
  Fade,
  Paper,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import Link from "next/link";

export default function SignInPage() {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data: { email: string; password: string }) => {
    setIsSubmitting(true);
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });
      if (result?.error) {
        enqueueSnackbar("Invalid email or password. Please try again.", { variant: "error" });
      } else if (result?.ok) {
        enqueueSnackbar("Signed in successfully!", { variant: "success" });
        router.push("/dashboard");
      }
    } catch (error) {
      enqueueSnackbar("An unexpected error occurred.", { variant: "error" });
    } finally {
      setIsSubmitting(false);
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
            <form onSubmit={handleSubmit(onSubmit)}>
              <Stack spacing={2} sx={{ width: "100%" }}>
                <Typography variant="h4">Sign In</Typography>
                <TextField
                  label="Email"
                  {...register("email", { required: "Email is required" })}
                  error={!!errors.email}
                  helperText={errors.email?.message as string}
                  disabled={isSubmitting}
                  fullWidth
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
                >
                  {isSubmitting ? <CircularProgress size={24} /> : "Sign In"}
                </Button>
              </Stack>
            </form>
            <Stack direction="row" justifyContent="center" sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Don't have an account?{" "}
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
        </Grid>
      </Fade>
    </Grid>
  );
}
