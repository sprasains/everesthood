import React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';

interface TabsProps {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children?: React.ReactNode;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ defaultValue, value, onValueChange, children, className }) => {
  return (
    <TabsPrimitive.Root defaultValue={defaultValue} value={value} onValueChange={onValueChange} className={className}>
      {children}
    </TabsPrimitive.Root>
  );
};

export const TabsList: React.FC<{ children?: React.ReactNode; className?: string }> = ({ children, className }) => (
  <TabsPrimitive.List className={`flex space-x-2 ${className ?? ''}`}>{children}</TabsPrimitive.List>
);

export const TabsTrigger: React.FC<{ value: string; children?: React.ReactNode; className?: string }> = ({ value, children, className }) => (
  <TabsPrimitive.Trigger
    value={value}
    className={`px-3 py-2 rounded-md text-sm data-[state=active]:bg-blue-600 data-[state=active]:text-white ${className ?? ''}`}
  >
    {children}
  </TabsPrimitive.Trigger>
);

export const TabsContent: React.FC<{ value: string; children?: React.ReactNode; className?: string }> = ({ value, children, className }) => (
  <TabsPrimitive.Content value={value} className={`mt-4 ${className ?? ''}`}>{children}</TabsPrimitive.Content>
);

export default Tabs;
