"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import CardComponent from '@/components/ui/CardComponent';
import { CardContent } from '@mui/material';
import { Typography, Box } from '@mui/material';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InfoCircledIcon } from '@radix-ui/react-icons';
import { Button } from '@/components/ui/button';

interface UsageData {
  currentMonthExecutionCount: number;
  monthlyExecutionLimit: number;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
}

export default function UsageAndBillingPage() {
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsageData = async () => {
      try {
        const response = await fetch('/api/v1/user/usage'); // Assuming this endpoint will be created
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: UsageData = await response.json();
        setUsageData(data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsageData();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading usage data...</div>;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <InfoCircledIcon className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Failed to load usage data: {error}</AlertDescription>
      </Alert>
    );
  }

  const progressValue = usageData
    ? (usageData.currentMonthExecutionCount / usageData.monthlyExecutionLimit) * 100
    : 0;

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Usage & Billing</h1>

      <CardComponent className="mb-6">
        <Box sx={{ p: 2 }}>
          <Typography variant="h6">Current Usage</Typography>
        </Box>
        <CardContent>
          {usageData ? (
            <div className="space-y-4">
              <p className="text-lg">
                You have used <strong>{usageData.currentMonthExecutionCount}</strong> out of{' '}
                <strong>{usageData.monthlyExecutionLimit}</strong> agent executions this month.
              </p>
              <Progress value={progressValue} className="w-full" />
              {usageData.currentMonthExecutionCount >= usageData.monthlyExecutionLimit && (
                <Alert>
                  <InfoCircledIcon className="h-4 w-4" />
                  <AlertTitle>Usage Limit Reached!</AlertTitle>
                  <AlertDescription>
                    You have reached your monthly execution limit. Please upgrade your plan to continue using agents.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          ) : (
            <p>No usage data available.</p>
          )}
        </CardContent>
      </CardComponent>

      <CardComponent>
        <Box sx={{ p: 2 }}>
          <Typography variant="h6">Billing History</Typography>
        </Box>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Your past invoices and billing details will appear here.
          </p>
          {/* Placeholder for Stripe billing portal link or invoice list */}
          <Button onClick={() => {
            // TODO: Replace with real Stripe billing portal redirect
            window.location.href = process.env.NEXT_PUBLIC_STRIPE_BILLING_PORTAL_URL || '/dashboard';
          }}>
            Manage Subscription on Stripe
          </Button>
        </CardContent>
      </CardComponent>
    </div>
  );
}
