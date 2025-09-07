"use client";
import { useState } from 'react';
import MarketplaceAnalytics from '@/components/marketplace/MarketplaceAnalytics';

export default function AgentMarketplaceAnalyticsPage() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  const handleTimeRangeChange = (range: string) => {
    setTimeRange(range as '7d' | '30d' | '90d' | '1y');
  };

  return (
    <MarketplaceAnalytics 
      timeRange={timeRange}
      onTimeRangeChange={handleTimeRangeChange}
    />
  );
}

