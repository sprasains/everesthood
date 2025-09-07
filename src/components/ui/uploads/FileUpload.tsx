import React, { useRef, useState } from 'react';
import { CloudArrowUpIcon, XCircleIcon } from '@heroicons/react/24/outline';

interface FileUploadProps {
  accept?: string;
  maxSize?: number; // in bytes
  multiple?: boolean;
  onChange: (files: File[]) => void;
  onError?: (error: string) => void;
  value?: File[];
  className?: string;
  disabled?: boolean;
  error?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  accept = '*',
  maxSize = 5 * 1024 * 1024, // 5MB default
  multiple = false,
  onChange,
  onError,
  value = [],
  className,
  disabled = false,
  error,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const validateFiles = (files: File[]): File[] => {
    return files.filter(file => {
      if (maxSize && file.size > maxSize) {
        onError?.(`File ${file.name} is too large. Maximum size is ${formatBytes(maxSize)}`);
        return false;
      }

      if (accept !== '*') {
        const acceptedTypes = accept.split(',').map(type => type.trim());
        const fileType = file.type || '';
        const fileExtension = '.' + file.name.split('.').pop();
        
        const isAccepted = acceptedTypes.some(type => {
          if (type.startsWith('.')) {
            return fileExtension.toLowerCase() === type.toLowerCase();
          }
          if (type.endsWith('/*')) {
            return fileType.startsWith(type.replace('/*', ''));
          }
          return fileType === type;
        });

        if (!isAccepted) {
          onError?.(`File ${file.name} is not an accepted file type`);
          return false;
        }
      }

      return true;
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    const validFiles = validateFiles(droppedFiles);

    if (validFiles.length) {
      onChange(multiple ? [...value, ...validFiles] : [validFiles[0]]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files ? Array.from(e.target.files) : [];
    const validFiles = validateFiles(selectedFiles);

    if (validFiles.length) {
      onChange(multiple ? [...value, ...validFiles] : [validFiles[0]]);
    }

    // Reset input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (file: File) => {
    onChange(value.filter(f => f !== file));
  };

  return (
    <div className={className}>
      <div
        className={cn(
          'relative border-2 border-dashed rounded-lg p-6',
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300',
          error ? 'border-red-500' : '',
          disabled ? 'bg-gray-50 cursor-not-allowed' : 'cursor-pointer',
          'transition-colors duration-200'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={!disabled ? handleDrop : undefined}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept={accept}
          multiple={multiple}
          onChange={handleFileInputChange}
          disabled={disabled}
        />
        
        <div className="text-center">
          <CloudArrowUpIcon 
            className={cn(
              'mx-auto h-12 w-12',
              isDragging ? 'text-blue-500' : 'text-gray-400'
            )}
          />
          <p className="mt-2 text-sm text-gray-600">
            {multiple ? 'Drop files here or click to upload' : 'Drop a file here or click to upload'}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            {accept === '*' 
              ? `Max file size: ${formatBytes(maxSize)}`
              : `Accepted files: ${accept} (max ${formatBytes(maxSize)})`}
          </p>
        </div>
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      {value.length > 0 && (
        <ul className="mt-4 space-y-2">
          {value.map((file, index) => (
            <li
              key={`${file.name}-${index}`}
              className="flex items-center justify-between p-2 bg-gray-50 rounded"
            >
              <div className="flex items-center">
                <span className="text-sm text-gray-700">{file.name}</span>
                <span className="ml-2 text-xs text-gray-500">
                  ({formatBytes(file.size)})
                </span>
              </div>
              {!disabled && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFile(file);
                  }}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <XCircleIcon className="h-5 w-5" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// Utility function to format bytes to human readable format
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Utility function to combine class names
function cn(...classes: (string | undefined | boolean)[]) {
  return classes.filter(Boolean).join(' ');
}
