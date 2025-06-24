"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { AutoAwesome } from "@mui/icons-material";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, name }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Registration failed");
      }

      router.push("/auth/signin?registered=true");
    } catch (err: any) {
      setError(err.message || "An error occurred during registration");
    } finally {
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
          maxWidth: "90%",
          width: "450px",
          p: { xs: 4, md: 6 },
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
              borderRadius: 4,
              p: { xs: 4, md: 6 },
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
                  fontSize: { xs: "2rem", md: "2.5rem" },
                  background: "linear-gradient(45deg, #ff4e53, #ffcc00)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  mb: 2,
                }}
              >
                Join Everhood
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: "#d0d0d0",
                  mb: 4,
                  fontSize: { xs: "0.9rem", md: "1rem" },
                }}
              >
                Create your account to access AI-powered insights
              </Typography>

              {error && (
                <Box
                  sx={{
                    backgroundColor: "rgba(239, 68, 68, 0.2)",
                    border: "1px solid rgba(239, 68, 68, 0.5)",
                    color: "#ffcccc",
                    p: 2,
                    borderRadius: 2,
                    mb: 3,
                    textAlign: "left",
                    fontSize: "0.85rem",
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
                  gap: "1.5rem",
                }}
              >
                <TextField
                  label="Name"
                  variant="outlined"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name"
                  required
                  fullWidth
                  sx={{
                    "& .MuiInputBase-root": {
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      color: "white",
                      borderRadius: 2,
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      "&:hover": {
                        border: "1px solid rgba(255, 255, 255, 0.3)",
                      },
                      "&.Mui-focused": {
                        border: "1px solid #ff4e53",
                      },
                    },
                    "& .MuiInputLabel-root": {
                      color: "rgba(255, 255, 255, 0.7)",
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
                      "&:hover": {
                        border: "1px solid rgba(255, 255, 255, 0.3)",
                      },
                      "&.Mui-focused": {
                        border: "1px solid #ff4e53",
                      },
                    },
                    "& .MuiInputLabel-root": {
                      color: "rgba(255, 255, 255, 0.7)",
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
                  inputProps={{ minLength: 6 }}
                  sx={{
                    "& .MuiInputBase-root": {
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      color: "white",
                      borderRadius: 2,
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      "&:hover": {
                        border: "1px solid rgba(255, 255, 255, 0.3)",
                      },
                      "&.Mui-focused": {
                        border: "1px solid #ff4e53",
                      },
                    },
                    "& .MuiInputLabel-root": {
                      color: "rgba(255, 255, 255, 0.7)",
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
                    padding: { xs: "12px 0", md: "14px 0" },
                    borderRadius: "50px",
                    fontWeight: "bold",
                    fontSize: { xs: "0.9rem", md: "1rem" },
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
                  {loading ? "Creating Account..." : "Sign Up"}
                </Button>
              </form>

              <Box mt={4} textAlign="center">
                <Typography
                  variant="body2"
                  sx={{
                    color: "#d0d0d0",
                    fontSize: { xs: "0.8rem", md: "0.85rem" },
                  }}
                >
                  Already have an account?{" "}
                  <a
                    href="/auth/signin"
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
                    Sign In
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
