import React from 'react';
import { TextField } from '@mui/material';
export default function SecretInput({ label, value, onChange }: { label: string; value: any; onChange: (val: any) => void }) {
  return <TextField label={label} value={value || ''} onChange={e => onChange(e.target.value)} fullWidth margin="normal" type="password" />;
}
