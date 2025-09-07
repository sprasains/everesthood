import React from 'react';
import * as RadixProgress from '@radix-ui/react-progress';

interface ProgressProps {
  value: number; // 0-100
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const Progress: React.FC<ProgressProps> = ({ value, size = 'md', showLabel = false, className }) => {
  const height = { sm: 6, md: 8, lg: 10 }[size];

  return (
    <div className={className}>
      <RadixProgress.Root className={`relative overflow-hidden bg-gray-200 rounded`} value={value} style={{ height }}>
        <RadixProgress.Indicator className="bg-blue-600 h-full transition-all" style={{ width: `${value}%` }} />
      </RadixProgress.Root>
      {showLabel && <div className="mt-1 text-sm text-gray-600">{Math.round(value)}%</div>}
    </div>
  );
};

export default Progress;
