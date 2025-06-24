"use client";
import { useState } from "react";
import {
  Paper,
  TextField,
  Button,
  Box,
  Typography,
  CircularProgress,
  Chip,
  Stack,
} from "@mui/material";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import SummarizeIcon from "@mui/icons-material/Summarize";

export default function AIToolbox() {
  const [inputText, setInputText] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"summarize" | "bullets" | "rephrase">(
    "summarize"
  );

  const handleProcess = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setResult("");
    // This would call a new API endpoint, e.g., /api/v1/ai/process
    // For now, we'll simulate a delay.
    setTimeout(() => {
      setResult(
        `This is a simulated **${mode}** result for the provided text.`
      );
      setLoading(false);
    }, 1500);
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 4,
        mb: 6,
        bgcolor: "rgba(255, 255, 255, 0.05)",
        borderRadius: 4,
      }}
    >
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
        AI Toolbox
      </Typography>
      <TextField
        fullWidth
        multiline
        rows={4}
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder="Paste text or an article URL here..."
        sx={{
          mb: 2,
          "& .MuiOutlinedInput-root": {
            color: "white",
            borderRadius: 2,
            "& fieldset": { borderColor: "rgba(255, 255, 255, 0.2)" },
          },
        }}
      />
      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <Chip
          icon={<SummarizeIcon />}
          label="Summarize"
          color={mode === "summarize" ? "secondary" : "default"}
          onClick={() => setMode("summarize")}
          variant={mode === "summarize" ? "filled" : "outlined"}
          sx={{ color: "white", borderColor: "rgba(255,255,255,0.2)" }}
        />
        <Chip
          icon={<FormatListBulletedIcon />}
          label="Bullet Points"
          color={mode === "bullets" ? "secondary" : "default"}
          onClick={() => setMode("bullets")}
          variant={mode === "bullets" ? "filled" : "outlined"}
          sx={{ color: "white", borderColor: "rgba(255,255,255,0.2)" }}
        />
        <Chip
          icon={<AutoFixHighIcon />}
          label="Rephrase"
          color={mode === "rephrase" ? "secondary" : "default"}
          onClick={() => setMode("rephrase")}
          variant={mode === "rephrase" ? "filled" : "outlined"}
          sx={{ color: "white", borderColor: "rgba(255,255,255,0.2)" }}
        />
      </Stack>
      <Button
        variant="contained"
        onClick={handleProcess}
        disabled={loading || !inputText.trim()}
      >
        {loading ? <CircularProgress size={24} /> : `Generate ${mode}`}
      </Button>
      {result && (
        <Box sx={{ mt: 3, p: 2, bgcolor: "rgba(0,0,0,0.2)", borderRadius: 2 }}>
          <Typography sx={{ whiteSpace: "pre-wrap" }}>{result}</Typography>
        </Box>
      )}
    </Paper>
  );
}
