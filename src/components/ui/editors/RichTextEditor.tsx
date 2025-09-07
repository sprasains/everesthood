import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import type ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const QuillEditor = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => <div className="h-64 w-full animate-pulse bg-gray-100 rounded" />,
}) as typeof ReactQuill;

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  error?: string;
  maxLength?: number;
  className?: string;
  toolbar?: string[][];
  onBlur?: () => void;
  onFocus?: () => void;
}

const DEFAULT_TOOLBAR = [
  [{ header: [1, 2, 3, false] }],
  ['bold', 'italic', 'underline', 'strike'],
  [{ list: 'ordered' }, { list: 'bullet' }],
  [{ align: [] }],
  ['link', 'image'],
  ['clean'],
];

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Start writing...',
  readOnly = false,
  error,
  maxLength,
  className,
  toolbar = DEFAULT_TOOLBAR,
  onBlur,
  onFocus,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [charCount, setCharCount] = useState(0);

  const handleChange = (content: string) => {
    if (maxLength && content.length > maxLength) {
      return;
    }
    setCharCount(content.length);
    onChange(content);
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

  return (
    <div className={className}>
      <div
        className={cn(
          'border rounded-lg transition-all duration-200',
          error
            ? 'border-red-500 focus-within:ring-red-500'
            : 'border-gray-300 focus-within:ring-blue-500',
          isFocused && 'ring-2 ring-offset-2',
          readOnly && 'bg-gray-50'
        )}
      >
        <QuillEditor
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder={placeholder}
          readOnly={readOnly}
          theme="snow"
          modules={{
            toolbar: {
              container: toolbar,
            },
            clipboard: {
              matchVisual: false,
            },
          }}
          formats={[
            'header',
            'bold',
            'italic',
            'underline',
            'strike',
            'list',
            'bullet',
            'align',
            'link',
            'image',
          ]}
        />
      </div>

      <div className="mt-1 flex justify-between items-center">
        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        {maxLength && (
          <p
            className={cn(
              'text-sm',
              charCount > maxLength ? 'text-red-600' : 'text-gray-500'
            )}
          >
            {charCount}/{maxLength} characters
          </p>
        )}
      </div>
    </div>
  );
};

// Utility function
function cn(...classes: (string | undefined | boolean)[]) {
  return classes.filter(Boolean).join(' ');
}
