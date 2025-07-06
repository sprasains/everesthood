import { useState } from "react";
import { Input, Button, Card } from "@/components/ui";

export default function SettingsPage() {
  const [webhook, setWebhook] = useState("");
  const [threshold, setThreshold] = useState(0.1);

  async function save() {
    await fetch("/api/admin/settings", {
      method: "POST",
      body: JSON.stringify({ alert_webhook_url: webhook, alert_threshold: threshold }),
    });
    alert("Settings saved!");
  }

  return (
    <Card>
      <h2>Metric Alert Settings</h2>
      <label>Webhook URL</label>
      <Input value={webhook} onChange={e => setWebhook(e.target.value)} />
      <label>Error Rate Threshold (%)</label>
      <Input type="number" value={threshold * 100} onChange={e => setThreshold(Number(e.target.value) / 100)} />
      <Button onClick={save}>Save</Button>
    </Card>
  );
} 