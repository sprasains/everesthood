import React from 'react';

// local classnames helper (small, avoids workspace alias dependency)
function cn(...classes: (string | undefined | boolean)[]) {
  return classes.filter(Boolean).join(' ');
}

interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
  helpText?: string;
  id?: string;
}

export const FormField = ({
  label,
  error,
  required,
  className,
  children,
  helpText,
  id,
}: FormFieldProps) => {
  const fieldId = id || label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={cn('space-y-2', className)}>
      <label
        htmlFor={fieldId}
        className="block text-sm font-medium text-gray-700 dark:text-gray-200"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="mt-1">
        {React.cloneElement(children as React.ReactElement, {
          id: fieldId,
          'aria-describedby': error ? `${fieldId}-error` : undefined,
          'aria-invalid': error ? 'true' : undefined,
        })}
      </div>
      {helpText && (
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400" id={`${fieldId}-description`}>
          {helpText}
        </p>
      )}
      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-500" id={`${fieldId}-error`} role="alert">
          {error}
        </p>
      )}
    </div>
  );
};
