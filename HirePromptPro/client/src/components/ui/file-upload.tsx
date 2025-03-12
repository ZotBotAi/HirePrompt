import React, { useState, useRef } from 'react';
import { Button } from './button';
import { cn } from '@/lib/utils';
import { UploadCloud, File, X, Check } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSize?: number; // in MB
  className?: string;
  label?: string;
  description?: string;
  uploading?: boolean;
  uploaded?: boolean;
  error?: string;
  multiple?: boolean;
}

export function FileUpload({
  onFileSelect,
  accept = '.pdf',
  maxSize = 10, // 10MB default
  className,
  label = 'Upload a file',
  description = 'Drag and drop a file here, or click to select',
  uploading = false,
  uploaded = false,
  error,
  multiple = false,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleFile(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      handleFile(file);
    }
  };

  const handleFile = (file: File) => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      alert(`File size exceeds ${maxSize}MB limit`);
      return;
    }
    
    // Check file type if accept is specified
    if (accept && !file.type.match(accept.replace('.', '').replace(/,/g, '|'))) {
      alert(`Only ${accept} files are accepted`);
      return;
    }
    
    setSelectedFile(file);
    onFileSelect(file);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={cn('flex flex-col items-center w-full', className)}>
      <div
        className={cn(
          'border-2 border-dashed rounded-lg p-6 w-full transition-colors duration-200 ease-in-out cursor-pointer group',
          isDragging ? 'border-primary-400 bg-primary-50' : 'border-gray-300 hover:border-primary-300',
          error ? 'border-red-500 bg-red-50 hover:border-red-400' : '',
          uploaded ? 'border-green-500 bg-green-50 hover:border-green-400' : '',
          'relative'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleButtonClick}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileInputChange}
          accept={accept}
          multiple={multiple}
        />
        
        <div className="flex flex-col items-center justify-center text-center">
          {uploading ? (
            <>
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-3"></div>
              <p className="text-sm text-gray-500">Uploading...</p>
            </>
          ) : uploaded ? (
            <>
              <Check className="h-10 w-10 text-green-500 mb-3" />
              <p className="text-sm font-medium text-gray-700">File uploaded successfully!</p>
              {selectedFile && (
                <p className="text-xs text-gray-500 mt-1">{selectedFile.name}</p>
              )}
            </>
          ) : selectedFile ? (
            <div className="flex flex-col items-center">
              <File className="h-10 w-10 text-primary-500 mb-2" />
              <p className="text-sm font-medium text-gray-700">{selectedFile.name}</p>
              <p className="text-xs text-gray-500 mt-1">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
              <Button 
                variant="ghost" 
                size="sm" 
                className="mt-2 text-gray-500 hover:text-red-500"
                onClick={removeFile}
              >
                <X className="h-4 w-4 mr-1" /> Remove
              </Button>
            </div>
          ) : (
            <>
              <UploadCloud className="h-10 w-10 text-gray-400 group-hover:text-primary-500 mb-3" />
              <p className="text-sm font-medium text-gray-700">{label}</p>
              <p className="text-xs text-gray-500 mt-1">{description}</p>
              <p className="text-xs text-gray-400 mt-2">
                {accept === '.pdf' ? 'PDF files only' : `Accepted: ${accept}`}, up to {maxSize}MB
              </p>
            </>
          )}
        </div>

        {error && (
          <div className="mt-2 text-sm text-red-500">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
