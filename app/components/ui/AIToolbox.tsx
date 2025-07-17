"use client";
import { useState, useEffect, useRef } from "react";
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
  const [agentInstanceId, setAgentInstanceId] = useState("");
  const [currentRunId, setCurrentRunId] = useState<string | null>(null);
  const [humanInputPrompt, setHumanInputPrompt] = useState<string | null>(null);
  const [humanResponse, setHumanResponse] = useState("");
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const pollJobStatus = async (jobId: string) => {
    setResult("Waiting for agent to complete...");
    const poll = async () => {
      try {
        const res = await fetch(`/api/agents/jobs/${jobId}`);
        if (!res.ok) {
          throw new Error("Failed to fetch job status");
        }
        const data = await res.json();
        if (data.status === "completed" || data.status === "COMPLETED") {
          setResult(data.result || JSON.stringify(data));
          setLoading(false);
          if (pollingRef.current) clearTimeout(pollingRef.current);
        } else if (data.status === "failed" || data.status === "FAILED") {
          setResult(data.error || "Agent job failed.");
          setLoading(false);
          if (pollingRef.current) clearTimeout(pollingRef.current);
        } else {
          pollingRef.current = setTimeout(poll, 2000);
        }
      } catch (err: any) {
        setResult(`Error: ${err.message}`);
        setLoading(false);
        if (pollingRef.current) clearTimeout(pollingRef.current);
      }
    };
    poll();
  };

  const handleProcess = async (input?: string) => {
    if (!inputText.trim() && !input) return;
    if (!agentInstanceId.trim()) {
      setResult("Error: Please provide an Agent Instance ID.");
      return;
    }
    setLoading(true);
    setResult("");
    setHumanInputPrompt(null);
    try {
      const response = await fetch('/api/v1/ai/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agentInstanceId,
          input: inputText,
          mode,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to process AI request');
      }
      const data = await response.json();
      if (data.jobId) {
        pollJobStatus(data.jobId);
      } else {
        setResult(data.message || JSON.stringify(data));
        setLoading(false);
      }
    } catch (error: any) {
      setResult(`Error: ${error.message}`);
      setLoading(false);
    }
  };

  const handleResume = () => {
    if (humanResponse.trim()) {
      handleProcess(humanResponse);
      setHumanResponse("");
    }
  };

  useEffect(() => {
    return () => {
      if (pollingRef.current) clearTimeout(pollingRef.current);
    };
  }, []);

  return (
    <div data-testid="ai-toolbox">
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
          label="Agent Instance ID"
          value={agentInstanceId}
          onChange={(e) => setAgentInstanceId(e.target.value)}
          placeholder="Enter your Agent Instance ID"
          sx={{ mb: 2 }}
        />
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
          onClick={() => handleProcess()}
          disabled={loading || !inputText.trim()}
        >
          {loading ? <CircularProgress size={24} /> : `Generate ${mode}`}
        </Button>

        {humanInputPrompt && (
          <Box sx={{ mt: 3, p: 2, bgcolor: "rgba(255, 255, 255, 0.1)", borderRadius: 2 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>Agent Awaiting Input:</Typography>
            <Typography sx={{ mb: 2 }}>{humanInputPrompt}</Typography>
            <TextField
              fullWidth
              multiline
              rows={2}
              value={humanResponse}
              onChange={(e) => setHumanResponse(e.target.value)}
              placeholder="Enter your response here..."
              sx={{
                mb: 2,
                "& .MuiOutlinedInput-root": {
                  color: "white",
                  borderRadius: 2,
                  "& fieldset": { borderColor: "rgba(255, 255, 255, 0.2)" },
                },
              }}
            />
            <Button
              variant="contained"
              onClick={handleResume}
              disabled={loading || !humanResponse.trim()}
            >
              {loading ? <CircularProgress size={24} /> : "Resume Agent"}
            </Button>
          </Box>
        )}

        {result && (
          <Box sx={{ mt: 3, p: 2, bgcolor: "rgba(0,0,0,0.2)", borderRadius: 2 }}>
            <Typography sx={{ whiteSpace: "pre-wrap" }}>{result}</Typography>
          </Box>
        )}
      </Paper>
    </div>
  );
}
