import { Card } from "@/components/ui";
import { CheckCircle, XCircle, Clock, ActivitySquare, HeartPulse } from "lucide-react";

interface HealthSummaryCardsProps {
  total: number;
  success: number;
  error: number;
  running: number;
  avgTime: number;
  healthStatus: string;
}

export default function HealthSummaryCards({ total, success, error, running, avgTime, healthStatus }: HealthSummaryCardsProps) {
  const statusColor = healthStatus === "green" ? "bg-green-400" : healthStatus === "yellow" ? "bg-yellow-400" : "bg-red-500";
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 mb-8">
      <Card className="flex flex-col items-center py-4 shadow-lg">
        <ActivitySquare className="w-6 h-6 text-blue-500 mb-1" />
        <span className="text-lg font-bold">{total}</span>
        <span className="text-xs text-gray-500">Total</span>
      </Card>
      <Card className="flex flex-col items-center py-4 shadow-lg">
        <CheckCircle className="w-6 h-6 text-green-500 mb-1" />
        <span className="text-lg font-bold">{success}</span>
        <span className="text-xs text-gray-500">Success</span>
      </Card>
      <Card className="flex flex-col items-center py-4 shadow-lg">
        <XCircle className="w-6 h-6 text-red-500 mb-1" />
        <span className="text-lg font-bold">{error}</span>
        <span className="text-xs text-gray-500">Error</span>
      </Card>
      <Card className="flex flex-col items-center py-4 shadow-lg">
        <Clock className="w-6 h-6 text-yellow-500 mb-1" />
        <span className="text-lg font-bold">{running}</span>
        <span className="text-xs text-gray-500">Running</span>
      </Card>
      <Card className="flex flex-col items-center py-4 shadow-lg">
        <HeartPulse className="w-6 h-6 text-pink-500 mb-1" />
        <span className="text-lg font-bold">{avgTime.toFixed(2)}s</span>
        <span className="text-xs text-gray-500">Avg Time</span>
      </Card>
      <Card className="flex flex-col items-center py-4 shadow-lg">
        <div className={`w-6 h-6 rounded-full ${statusColor} mb-1`} />
        <span className="text-xs text-gray-500">Health</span>
      </Card>
    </div>
  );
} 