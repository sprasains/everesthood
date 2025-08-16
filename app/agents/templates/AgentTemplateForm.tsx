import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, TextField, Box, Typography, Collapse, CircularProgress } from "@mui/material";
import toast from "react-hot-toast";
import SecretInput from '@/components/SecretInput';
import JsonViewer from '@/components/JsonViewer';
import RunProgress from '@/components/RunProgress';

const AgentTemplateSchema = z.object({
  name: z.string().min(2, "Name is required"),
  description: z.string().min(10, "Description required"),
  provider: z.string().min(2, "Provider required"),
  credentials: z.record(z.string()),
  config: z.any(),
});

export type AgentTemplateFormValues = z.infer<typeof AgentTemplateSchema>;

export default function AgentTemplateForm({ onSubmit }: { onSubmit: (data: AgentTemplateFormValues) => Promise<any> }) {
  const [showDebug, setShowDebug] = useState(false);
  const [testRunLoading, setTestRunLoading] = useState(false);
  const [testRunResult, setTestRunResult] = useState<any>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const { register, handleSubmit, formState, watch, setValue } = useForm<AgentTemplateFormValues>({
    resolver: zodResolver(AgentTemplateSchema),
    defaultValues: {
      name: "",
      description: "",
      provider: "",
      credentials: {},
      config: {},
    },
  });

  const handleTestRun = async () => {
    setTestRunLoading(true);
    setErrorDetails(null);
    try {
      // Simulate API call
      const payload = watch();
      // Redact secrets for debug
      const redacted = { ...payload, credentials: '[REDACTED]' };
      setShowDebug(true);
      // Replace with actual API call
      await new Promise((r) => setTimeout(r, 1200));
      setTestRunResult({ status: 'success', output: 'Test run completed.' });
      toast.success('Test run succeeded');
    } catch (err: any) {
      setTestRunResult(null);
      setErrorDetails(err?.message || 'Unknown error');
      toast.error('Test run failed');
    } finally {
      setTestRunLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ p: 2, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h5" mb={2}>Create Agent Template</Typography>
      <TextField label="Name" {...register('name')} helperText="e.g. Content Creator Assistant" error={!!formState.errors.name} fullWidth margin="normal" />
      <TextField label="Description" {...register('description')} helperText="Describe the agent's purpose" error={!!formState.errors.description} fullWidth margin="normal" multiline minRows={2} />
      <TextField label="Provider" {...register('provider')} helperText="e.g. OpenAI, Gemini, Custom" error={!!formState.errors.provider} fullWidth margin="normal" />
      <SecretInput label="Credentials" value={watch('credentials')} onChange={val => setValue('credentials', val)} />
      <TextField label="Config (JSON)" {...register('config')} helperText="Agent config as JSON" error={!!formState.errors.config} fullWidth margin="normal" />
      <Box mt={2} display="flex" gap={2}>
        <Button type="submit" variant="contained">Save</Button>
        <Button variant="outlined" onClick={handleTestRun} disabled={testRunLoading} startIcon={testRunLoading ? <CircularProgress size={16} /> : undefined}>Test run</Button>
        <Button variant="text" onClick={() => setShowDebug(v => !v)}>Debug panel</Button>
      </Box>
      <Collapse in={!!errorDetails}>
        <Box mt={2} bgcolor="#fee" p={2} borderRadius={2}>
          <Typography variant="subtitle2">Technical Details</Typography>
          <Typography variant="body2">{errorDetails}</Typography>
        </Box>
      </Collapse>
      <Collapse in={!!testRunResult}>
        <RunProgress result={testRunResult} />
      </Collapse>
      <Collapse in={showDebug}>
        <Box mt={2} bgcolor="#f5f5f5" p={2} borderRadius={2}>
          <Typography variant="subtitle2">Final Payload (secrets redacted)</Typography>
          <JsonViewer data={{ ...watch(), credentials: '[REDACTED]' }} />
        </Box>
      </Collapse>
    </Box>
  );
}
