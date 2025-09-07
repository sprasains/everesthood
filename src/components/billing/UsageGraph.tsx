// PARITY: implements billing.metered.usage; see PARITY_REPORT.md#billing-metered-usage
// TODO: Implement interactive usage graph for billing page

import React from 'react';
import { ResponsiveLine } from '@nivo/line';
import { api } from '@/utils/api';
import { formatDate } from '@/lib/utils';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface UsageGraphProps {
  userId: string;
}

export default function UsageGraph({ userId }: UsageGraphProps) {
  const { data: usageData, isLoading } = api.billing.getUsage.useQuery(
    { userId },
    {
      refetchInterval: 300000, // 5 minutes
    }
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>Usage Over Time</CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!usageData || usageData.length === 0) {
    return (
      <Card>
        <CardHeader>Usage Over Time</CardHeader>
        <CardContent>
          <div className="flex h-[400px] items-center justify-center">
            No usage data available
          </div>
        </CardContent>
      </Card>
    );
  }

  const data = [
    {
      id: 'usage',
      data: usageData.map((point) => ({
        x: formatDate(point.timestamp),
        y: point.usage,
      })),
    },
  ];

  return (
    <Card>
      <CardHeader>Usage Over Time</CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveLine
            data={data}
            margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
            xScale={{ type: 'point' }}
            yScale={{
              type: 'linear',
              min: 'auto',
              max: 'auto',
              stacked: false,
              reverse: false,
            }}
            axisTop={null}
            axisRight={null}
            axisBottom={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: -45,
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: 'Credits Used',
              legendOffset: -40,
              legendPosition: 'middle',
            }}
            enablePoints={true}
            pointSize={8}
            pointColor={{ theme: 'background' }}
            pointBorderWidth={2}
            pointBorderColor={{ from: 'serieColor' }}
            pointLabelYOffset={-12}
            useMesh={true}
            legends={[
              {
                anchor: 'bottom-right',
                direction: 'column',
                justify: false,
                translateX: 100,
                translateY: 0,
                itemsSpacing: 0,
                itemDirection: 'left-to-right',
                itemWidth: 80,
                itemHeight: 20,
                itemOpacity: 0.75,
                symbolSize: 12,
                symbolShape: 'circle',
                symbolBorderColor: 'rgba(0, 0, 0, .5)',
                effects: [
                  {
                    on: 'hover',
                    style: {
                      itemBackground: 'rgba(0, 0, 0, .03)',
                      itemOpacity: 1,
                    },
                  },
                ],
              },
            ]}
          />
        </div>
      </CardContent>
    </Card>
  );
}
