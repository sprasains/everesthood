"use client";
export const dynamic = "force-dynamic";
import CrudManager from "@/components/ui/CrudManager";

export default function HealthPage() {
  return (
    <CrudManager
      title="Health Metrics"
      apiBase="/api/v1/health"
      itemLabel="Health Metric"
      fields={[
        { name: "metric", label: "Metric", required: true },
        { name: "value", label: "Value", required: true, type: "number", validate: v => isNaN(Number(v)) ? "Must be a number" : undefined },
        { name: "date", label: "Date", required: true, type: "date" },
      ]}
    />
  );
} 