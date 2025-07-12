import React, { useState, useRef, useEffect } from 'react';
import { 
  Button, 
  Box, 
  Typography, 
  Paper, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemIcon,
  CircularProgress, 
  IconButton, 
  Alert,
  Chip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import DescriptionIcon from '@mui/icons-material/Description';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import FileUploadIcon from '@mui/icons-material/FileUpload';

interface FileUploadProps {
  onFileContent: (content: string | ArrayBuffer, fileName: string) => void;
  acceptedFileTypes?: string;
  onFileListChange?: (files: File[]) => void; // Add callback for file list changes
}

const FileUpload: React.FC<FileUploadProps> = ({ 
  onFileContent, 
  acceptedFileTypes = ".txt,.md,.csv,.pdf,.json",
  onFileListChange
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [processingFile, setProcessingFile] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Notify parent component when files change
  useEffect(() => {
    if (onFileListChange) {
      onFileListChange(files);
    }
  }, [files, onFileListChange]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (event.target.files) {
      const fileList = Array.from(event.target.files);
      
      // Check for duplicates
      const duplicates: string[] = [];
      const newFiles = fileList.filter(newFile => {
        const isDuplicate = files.some(existingFile => 
          existingFile.name === newFile.name && existingFile.size === newFile.size
        );
        if (isDuplicate) {
          duplicates.push(newFile.name);
        }
        return !isDuplicate;
      });
      
      if (duplicates.length > 0) {
        setError(`Skipped duplicate file(s): ${duplicates.join(', ')}`);
      }
      
      setFiles(prev => [...prev, ...newFiles]);
    }
    
    // Clear the input value to allow uploading the same file again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleProcessFile = async (file: File, index: number) => {
    setProcessingFile(index);
    setError(null);
    
    try {
      // Check if file is PDF
      if (file.name.toLowerCase().endsWith('.pdf')) {
        // For PDFs, use ArrayBuffer
        const content = await readFileAsArrayBuffer(file);
        onFileContent(content, file.name);
      } else {
        // For text-based files, use text
        const content = await readFileAsText(file);
        onFileContent(content, file.name);
      }
    } catch (err) {
      setError(`Error reading file: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setProcessingFile(null);
    }
  };

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result && typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to read file as text'));
        }
      };
      reader.onerror = () => {
        reject(new Error('Error reading file'));
      };
      reader.readAsText(file);
    });
  };

  const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result && reader.result instanceof ArrayBuffer) {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to read file as ArrayBuffer'));
        }
      };
      reader.onerror = () => {
        reject(new Error('Error reading file'));
      };
      reader.readAsArrayBuffer(file);
    });
  };

  const getFileTypeLabel = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toUpperCase() || 'FILE';
    return extension;
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (extension === 'pdf') {
      return <PictureAsPdfIcon color="error" />;
    }
    return <DescriptionIcon />;
  };

  const clearAllFiles = () => {
    setFiles([]);
    setError(null);
  };

  return (
    <Box sx={{ mt: 3, mb: 3 }}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
        accept={acceptedFileTypes}
        multiple
      />
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Button
          variant="contained"
          onClick={() => fileInputRef.current?.click()}
          startIcon={<FileUploadIcon />}
        >
          Upload Files
        </Button>
        
        {files.length > 0 && (
          <Button
            variant="outlined"
            color="secondary"
            onClick={clearAllFiles}
          >
            Clear All
          </Button>
        )}
      </Box>
      
      <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
        Supported file types: {acceptedFileTypes}
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {files.length > 0 && (
        <Paper elevation={2} sx={{ p: 2, mt: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Uploaded Files ({files.length})
          </Typography>
          <List dense>
            {files.map((file, index) => (
              <ListItem
                key={`${file.name}-${index}`}
                secondaryAction={
                  <IconButton 
                    edge="end" 
                    aria-label="delete"
                    onClick={() => handleRemoveFile(index)}
                  >
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <ListItemIcon>
                  {getFileIcon(file.name)}
                </ListItemIcon>
                <ListItemText
                  primary={file.name}
                  secondary={
                    <>
                      {`${(file.size / 1024).toFixed(2)} KB`}
                      <Chip 
                        size="small" 
                        label={getFileTypeLabel(file.name)} 
                        color="primary" 
                        variant="outlined"
                        sx={{ ml: 1 }}
                      />
                    </>
                  }
                />
                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={() => handleProcessFile(file, index)}
                  disabled={processingFile !== null}
                  sx={{ ml: 2 }}
                >
                  {processingFile === index ? <CircularProgress size={20} /> : 'Process'}
                </Button>
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
};

export default FileUpload;