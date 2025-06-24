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
import { styled } from "@mui/material/styles";
import { motion } from "framer-motion";
import { AutoAwesome } from "@mui/icons-material";

const CardStyled = styled(Card)(({ theme }) => ({
  background:
    "linear-gradient(145deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))",
  backdropFilter: "blur(15px)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  color: "white",
  borderRadius: 3,
  padding: theme.spacing(3),
  boxShadow: "0 12px 30px rgba(0, 0, 0, 0.3)",
  textAlign: "center",
  flexGrow: 1,
}));

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
        flexGrow: 1,
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
          flexGrow: 1,
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ width: "100%" }}
        >
          <CardStyled>
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
                Join Everhood
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: "#d0d0d0",
                  mb: { xs: 2, sm: 3, md: 4 },
                  fontSize: { xs: "0.85rem", sm: "0.9rem", md: "1rem" },
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
                    p: { xs: 1.5, sm: 2 },
                    borderRadius: 1.5,
                    mb: { xs: 2, sm: 3 },
                    textAlign: "left",
                    fontSize: {
                      xs: "0.75rem",
                      sm: "0.8rem",
                      md: "0.85rem",
                    },
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
                  inputProps={{ minLength: 6 }}
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
                  {loading ? "Creating Account..." : "Sign Up"}
                </Button>
              </form>

              <Box mt={{ xs: 2, sm: 3, md: 4 }} textAlign="center">
                <Typography
                  variant="body2"
                  sx={{
                    color: "#d0d0d0",
                    fontSize: { xs: "0.75rem", sm: "0.8rem", md: "0.85rem" },
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
          </CardStyled>
        </motion.div>
      </Box>
    </Container>
  );
}
