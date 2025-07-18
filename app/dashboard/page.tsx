"use client";
export const dynamic = "force-dynamic";
import AppLayoutShell from '@/components/layout/AppLayoutShell';
import DashboardOverview from './DashboardOverview';

export default function DashboardPage() {
  return (
    <AppLayoutShell>
      {/* Responsive grid container for dashboard widgets */}
      <div className="w-full max-w-7xl mx-auto px-2 md:px-6 py-6">
        <DashboardOverview />
      </div>
    </AppLayoutShell>
  );
}
