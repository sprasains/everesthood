import React, { useEffect, useRef, useState } from 'react';
import { CalendarIcon, ChevronDownIcon, ClockIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { format, isValid, parse } from 'date-fns';

interface DateTimePickerProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  error?: string;
  className?: string;
  placeholder?: string;
  showClearButton?: boolean;
  format?: string;
  id?: string;
}

export const DateTimePicker: React.FC<DateTimePickerProps> = ({
  value,
  onChange,
  minDate,
  maxDate,
  disabled = false,
  error,
  className,
  placeholder = 'Select date and time',
  showClearButton = true,
  format: dateFormat = 'MM/dd/yyyy HH:mm',
  id,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInputValue(value ? format(value, dateFormat) : '');
  }, [value, dateFormat]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    const parsedDate = parse(newValue, dateFormat, new Date());
    if (isValid(parsedDate)) {
      if (isDateInRange(parsedDate)) {
        onChange(parsedDate);
      }
    } else if (newValue === '') {
      onChange(null);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    setInputValue('');
    setIsOpen(false);
  };

  const isDateInRange = (date: Date) => {
    if (minDate && date < minDate) return false;
    if (maxDate && date > maxDate) return false;
    return true;
  };

  const handleNowClick = () => {
    const now = new Date();
    if (isDateInRange(now)) {
      onChange(now);
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className={cn('relative inline-block w-full', className)}>
      <div 
        className={cn(
          'relative flex items-center',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input
          id={id}
          ref={inputRef}
          type="text"
          className={cn(
            'w-full px-4 py-2 pl-10 pr-10 border rounded-lg focus:outline-none focus:ring-2 transition-all',
            error
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
            disabled && 'bg-gray-50'
          )}
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={disabled}
          onFocus={() => !disabled && setIsOpen(true)}
        />
        <CalendarIcon className="absolute left-3 w-5 h-5 text-gray-400" />
        <div className="absolute right-3 flex items-center space-x-1">
          {showClearButton && value && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          )}
          <ChevronDownIcon 
            className={cn(
              'w-4 h-4 text-gray-400 transition-transform',
              isOpen && 'transform rotate-180'
            )}
          />
        </div>
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-700">Select Date & Time</span>
              <button
                type="button"
                onClick={handleNowClick}
                className="text-sm text-blue-600 hover:text-blue-500 flex items-center"
              >
                <ClockIcon className="w-4 h-4 mr-1" />
                Now
              </button>
            </div>
            
            {/* Calendar/Time picker UI can be added here. For now, showing a simple note */}
            <p className="text-sm text-gray-500">
              Enter date and time in format: {dateFormat}
              {minDate && <span><br />Min: {format(minDate, dateFormat)}</span>}
              {maxDate && <span><br />Max: {format(maxDate, dateFormat)}</span>}
            </p>
          </div>
        </div>
      )}

      {error && (
        <p className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

// Utility function to combine class names
function cn(...classes: (string | undefined | boolean)[]) {
  return classes.filter(Boolean).join(' ');
}
