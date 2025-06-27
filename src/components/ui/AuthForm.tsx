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
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

interface AuthFormProps {
  isSignUp?: boolean;
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
  } = useForm();

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

  return (
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
          sx={{ py: 1.5, fontWeight: "bold" }}
        >
          {isSubmitting ? (
            <CircularProgress size={24} />
          ) : isSignUp ? (
            "Sign Up"
          ) : (
            "Sign In"
          )}
        </Button>
      </Stack>
    </form>
  );
} 