"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Container,
  Typography,
  Button,
  Box,
  TextField,
  Card,
  CardContent,
} from "@mui/material";
import { motion } from "framer-motion";
import { AutoAwesome, Google, Facebook } from "@mui/icons-material";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered") === "true";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });
      if (result?.error) {
        setError("Invalid email or password. Please try again.");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError("An error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignIn = async (provider: string) => {
    setLoading(true);
    setError("");
    try {
      await signIn(provider, { callbackUrl: "/dashboard" });
    } catch (err) {
      setError(`Failed to sign in with ${provider}. Please try again.`);
      setLoading(false);
    }
  };

  return (
    <Container
      maxWidth={false}
      disableGutters
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
        color: "white",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: 0,
        overflowX: "hidden",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          maxWidth: { xs: "90%", sm: "500px", md: "550px" },
          p: { xs: 2, sm: 4, md: 6 },
          my: "auto",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ width: "100%" }}
        >
          <Card
            sx={{
              background:
                "linear-gradient(145deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))",
              backdropFilter: "blur(15px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              color: "white",
              borderRadius: 3,
              p: { xs: 3, sm: 5, md: 6 },
              boxShadow: "0 12px 30px rgba(0, 0, 0, 0.3)",
              textAlign: "center",
            }}
          >
            <CardContent sx={{ p: 0 }}>
              <Typography
                variant="h3"
                fontWeight="bold"
                gutterBottom
                sx={{
                  fontSize: { xs: "1.8rem", sm: "2.2rem", md: "2.5rem" },
                  background: "linear-gradient(45deg, #ff4e53, #ffcc00)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  mb: { xs: 1, sm: 2 },
                }}
              >
                Welcome to Everhood
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: "#d0d0d0",
                  mb: { xs: 2, sm: 3, md: 4 },
                  fontSize: { xs: "0.85rem", sm: "0.9rem", md: "1rem" },
                }}
              >
                Sign in to access AI-powered insights
              </Typography>

              {registered && (
                <Box
                  sx={{
                    backgroundColor: "rgba(52, 168, 83, 0.2)",
                    border: "1px solid rgba(52, 168, 83, 0.5)",
                    color: "#ccffcc",
                    p: { xs: 1.5, sm: 2 },
                    borderRadius: 1.5,
                    mb: { xs: 2, sm: 3 },
                    textAlign: "left",
                    fontSize: { xs: "0.75rem", sm: "0.8rem", md: "0.85rem" },
                  }}
                >
                  Account created successfully! Please sign in.
                </Box>
              )}

              {error && (
                <Box
                  sx={{
                    backgroundColor: "rgba(239, 68, 68, 0.2)",
                    border: "1px solid rgba(239, 68, 68, 0.5)",
                    color: "#ffcccc",
                    p: { xs: 1.5, sm: 2 },
                    borderRadius: 1.5,
                    mb: { xs: 2, sm: 3 },
                    textAlign: "left",
                    fontSize: { xs: "0.75rem", sm: "0.8rem", md: "0.85rem" },
                  }}
                >
                  {error}
                </Box>
              )}

              <form
                onSubmit={handleSubmit}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.25rem",
                }}
              >
                <TextField
                  label="Email"
                  variant="outlined"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your Email"
                  required
                  fullWidth
                  sx={{
                    "& .MuiInputBase-root": {
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      color: "white",
                      borderRadius: 2,
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      height: { xs: "48px", sm: "52px", md: "56px" },
                      fontSize: { xs: "0.85rem", sm: "0.9rem", md: "1rem" },
                      "&:hover": {
                        border: "1px solid rgba(255, 255, 255, 0.3)",
                      },
                      "&.Mui-focused": {
                        border: "1px solid #ff4e53",
                      },
                    },
                    "& .MuiInputLabel-root": {
                      color: "rgba(255, 255, 255, 0.7)",
                      fontSize: { xs: "0.85rem", sm: "0.9rem", md: "1rem" },
                      "&.Mui-focused": {
                        color: "#ff4e53",
                      },
                    },
                    "& .MuiOutlinedInput-notchedOutline": {
                      border: "none",
                    },
                  }}
                />
                <TextField
                  label="Password"
                  variant="outlined"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your Password"
                  required
                  fullWidth
                  sx={{
                    "& .MuiInputBase-root": {
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      color: "white",
                      borderRadius: 2,
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      height: { xs: "48px", sm: "52px", md: "56px" },
                      fontSize: { xs: "0.85rem", sm: "0.9rem", md: "1rem" },
                      "&:hover": {
                        border: "1px solid rgba(255, 255, 255, 0.3)",
                      },
                      "&.Mui-focused": {
                        border: "1px solid #ff4e53",
                      },
                    },
                    "& .MuiInputLabel-root": {
                      color: "rgba(255, 255, 255, 0.7)",
                      fontSize: { xs: "0.85rem", sm: "0.9rem", md: "1rem" },
                      "&.Mui-focused": {
                        color: "#ff4e53",
                      },
                    },
                    "& .MuiOutlinedInput-notchedOutline": {
                      border: "none",
                    },
                  }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  fullWidth
                  sx={{
                    background: loading
                      ? "rgba(255, 78, 83, 0.5)"
                      : "linear-gradient(45deg, #ff4e53, #ffcc00)",
                    padding: { xs: "10px 0", sm: "12px 0", md: "14px 0" },
                    borderRadius: "50px",
                    fontWeight: "bold",
                    fontSize: { xs: "0.85rem", sm: "0.9rem", md: "1rem" },
                    textTransform: "none",
                    boxShadow: loading
                      ? "none"
                      : "0 8px 16px rgba(255, 78, 83, 0.5)",
                    transition:
                      "transform 0.2s, box-shadow 0.2s, background 0.2s",
                    cursor: loading ? "not-allowed" : "pointer",
                    "&:hover": {
                      transform: loading ? "none" : "translateY(-2px)",
                      boxShadow: loading
                        ? "none"
                        : "0 12px 20px rgba(255, 78, 83, 0.7)",
                      background: loading
                        ? "rgba(255, 78, 83, 0.5)"
                        : "linear-gradient(45deg, #ffcc00, #ff4e53)",
                    },
                  }}
                  startIcon={<AutoAwesome />}
                >
                  {loading ? "Signing In..." : "Sign In"}
                </Button>
              </form>

              <Box
                mt={{ xs: 2, sm: 3, md: 4 }}
                display="flex"
                flexDirection="column"
                gap={{ xs: 1.5, sm: 2 }}
              >
                <Button
                  variant="outlined"
                  size="large"
                  disabled={loading}
                  fullWidth
                  onClick={() => handleSocialSignIn("google")}
                  sx={{
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                    color: "white",
                    padding: { xs: "10px 0", sm: "12px 0" },
                    borderRadius: "50px",
                    fontWeight: "medium",
                    fontSize: { xs: "0.8rem", sm: "0.85rem", md: "0.9rem" },
                    textTransform: "none",
                    transition: "transform 0.2s, background 0.2s, border 0.2s",
                    cursor: loading ? "not-allowed" : "pointer",
                    "&:hover": {
                      backgroundColor: "rgba(255, 255, 255, 0.15)",
                      border: "1px solid rgba(255, 255, 255, 0.5)",
                      transform: loading ? "none" : "translateY(-1px)",
                    },
                  }}
                  startIcon={<Google />}
                >
                  Sign In with Google
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  disabled={loading}
                  fullWidth
                  onClick={() => handleSocialSignIn("facebook")}
                  sx={{
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                    color: "white",
                    padding: { xs: "10px 0", sm: "12px 0" },
                    borderRadius: "50px",
                    fontWeight: "medium",
                    fontSize: { xs: "0.8rem", sm: "0.85rem", md: "0.9rem" },
                    textTransform: "none",
                    transition: "transform 0.2s, background 0.2s, border 0.2s",
                    cursor: loading ? "not-allowed" : "pointer",
                    "&:hover": {
                      backgroundColor: "rgba(255, 255, 255, 0.15)",
                      border: "1px solid rgba(255, 255, 255, 0.5)",
                      transform: loading ? "none" : "translateY(-1px)",
                    },
                  }}
                  startIcon={<Facebook />}
                >
                  Sign In with Facebook
                </Button>
              </Box>

              <Box mt={{ xs: 2, sm: 3, md: 4 }} textAlign="center">
                <Typography
                  variant="body2"
                  sx={{
                    color: "#d0d0d0",
                    fontSize: { xs: "0.75rem", sm: "0.8rem", md: "0.85rem" },
                  }}
                >
                  Don't have an account?{" "}
                  <a
                    href="/auth/signup"
                    style={{
                      color: "#ff4e53",
                      textDecoration: "none",
                      transition: "color 0.2s",
                    }}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.color = "#ffcc00")
                    }
                    onMouseOut={(e) =>
                      (e.currentTarget.style.color = "#ff4e53")
                    }
                  >
                    Sign Up
                  </a>
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </motion.div>
      </Box>
    </Container>
  );
}
