import React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/24/solid';

interface Option<T = string> {
  value: T;
  label: string;
}

interface SelectProps<T = string> {
  value?: T;
  onValueChange?: (value: T) => void;
  options: Option<T>[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function Select<T extends string = string>({
  value,
  onValueChange,
  options,
  placeholder = 'Select...',
  disabled = false,
  className,
}: SelectProps<T>) {
  return (
    <SelectPrimitive.Root value={value} onValueChange={(v) => onValueChange?.(v as T)}>
      <SelectPrimitive.Trigger
        aria-label={placeholder}
        className={`inline-flex items-center justify-between rounded-md border px-3 py-2 w-full ${className ?? ''}`}
        disabled={disabled}
      >
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon>
          <ChevronDownIcon className="w-4 h-4 text-gray-500" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Content className="z-50 bg-white rounded-md shadow-md border mt-2 w-full">
        <SelectPrimitive.ScrollUpButton />
        <SelectPrimitive.Viewport className="p-2">
          {options.map((opt) => (
            <SelectPrimitive.Item
              key={String(opt.value)}
              value={String(opt.value)}
              className="flex items-center justify-between px-3 py-2 rounded hover:bg-gray-100 cursor-pointer"
            >
              <SelectPrimitive.ItemText>{opt.label}</SelectPrimitive.ItemText>
              <SelectPrimitive.ItemIndicator>
                <CheckIcon className="w-4 h-4 text-blue-600" />
              </SelectPrimitive.ItemIndicator>
            </SelectPrimitive.Item>
          ))}
        </SelectPrimitive.Viewport>
        <SelectPrimitive.ScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Root>
  );
}

export default Select;
