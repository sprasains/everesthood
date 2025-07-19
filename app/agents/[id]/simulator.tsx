"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import CardComponent from '@/components/ui/CardComponent';

export default function SimulatorTab({ agentId }: { agentId: string }) {
  const [state, setState] = useState<any>(null);
  const [input, setInput] = useState("{}");
  const [loading, setLoading] = useState(false);

  async function start() {
    setLoading(true);
    const res = await fetch("/api/debug-agent", {
      method: "POST",
      body: JSON.stringify({ agentId, input: JSON.parse(input) }),
    });
    setState(await res.json());
    setLoading(false);
  }
  async function nextStep() {
    setLoading(true);
    const res = await fetch("/api/debug-agent", {
      method: "POST",
      body: JSON.stringify({ agentId, state }),
    });
    setState(await res.json());
    setLoading(false);
  }
  function reset() { setState(null); }

  return (
    <CardComponent>
      <h2>Simulator</h2>
      <textarea value={input} onChange={e => setInput(e.target.value)} />
      <div>
        <Button onClick={start} disabled={loading}>Start</Button>
        <Button onClick={nextStep} disabled={loading || !state}>Next Step</Button>
        <Button onClick={reset}>Reset</Button>
      </div>
      <pre>{JSON.stringify(state, null, 2)}</pre>
    </CardComponent>
  );
} 