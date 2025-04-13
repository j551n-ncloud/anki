import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { File, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface FileUploaderProps {
  onFileContent: (content: string) => void;
  disabled?: boolean;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileContent, disabled }) => {
  const [fileContent, setFileContent] = useState<string>('');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        setFileContent(content);
        onFileContent(content);
      } catch (error) {
        console.error("Error reading file:", error);
        toast.error("Failed to read the file.");
      }
    };

    reader.onerror = () => {
      toast.error("Failed to read the file.");
    };

    reader.readAsText(file);
  }, [onFileContent]);

  const {getRootProps, getInputProps, isDragActive} = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    disabled: disabled,
  });

  const handleClear = () => {
    setFileContent('');
    onFileContent('');
  };

  return (
    <div className="space-y-4">
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-md p-6 text-center cursor-pointer ${isDragActive ? 'border-primary' : 'border-muted-foreground'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p className="text-primary">Drop the files here ...</p>
        ) : (
          <p className="text-muted-foreground">
            Drag 'n' drop some files here, or click to select files
            <br />
            <span className="text-xs">Supported formats: .txt, .md, .pdf</span>
          </p>
        )}
      </div>

      {fileContent && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium">File Content:</h4>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleClear}
              disabled={disabled}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>
          <Textarea 
            value={fileContent} 
            readOnly 
            className="min-h-[150px] text-sm"
          />
        </div>
      )}
    </div>
  );
};

export default FileUploader;
