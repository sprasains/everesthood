import React from 'react';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { ChevronDownIcon } from '@heroicons/react/24/solid';

interface AccordionItemProps {
  value: string;
  title: React.ReactNode;
  children?: React.ReactNode;
}

export const Accordion: React.FC<{ children?: React.ReactNode; className?: string }> = ({ children, className }) => (
  <AccordionPrimitive.Root type="single" collapsible className={className}>
    {children}
  </AccordionPrimitive.Root>
);

export const AccordionItem: React.FC<AccordionItemProps> = ({ value, title, children }) => {
  return (
    <AccordionPrimitive.Item value={value} className="border-b">
      <AccordionPrimitive.Header>
        <AccordionPrimitive.Trigger className="w-full flex items-center justify-between px-4 py-3 text-left">
          <span>{title}</span>
          <ChevronDownIcon className="w-4 h-4 text-gray-500" />
        </AccordionPrimitive.Trigger>
      </AccordionPrimitive.Header>
      <AccordionPrimitive.Content className="px-4 py-3 text-sm text-gray-600">{children}</AccordionPrimitive.Content>
    </AccordionPrimitive.Item>
  );
};

export default Accordion;
