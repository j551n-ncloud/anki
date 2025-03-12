import React, { useState, useRef } from 'react';
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
import FileUploadIcon from '@mui/icons-material/FileUpload';

interface FileUploadProps {
  onFileContent: (content: string, fileName: string) => void;
  acceptedFileTypes?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({ 
  onFileContent, 
  acceptedFileTypes = ".txt,.md,.csv"
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (event.target.files) {
      const fileList = Array.from(event.target.files);
      setFiles(prev => [...prev, ...fileList]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleProcessFile = async (file: File) => {
    setLoading(true);
    setError(null);
    
    try {
      const content = await readFileAsText(file);
      onFileContent(content, file.name);
    } catch (err) {
      setError(`Error reading file: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
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
      <Button
        variant="contained"
        onClick={() => fileInputRef.current?.click()}
        startIcon={<FileUploadIcon />}
        sx={{ mb: 2 }}
      >
        Upload Files
      </Button>
      
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
            Uploaded Files
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
                  <DescriptionIcon />
                </ListItemIcon>
                <ListItemText
                  primary={file.name}
                  secondary={
                    <>
                      {`${(file.size / 1024).toFixed(2)} KB`}
                      <Chip 
                        size="small" 
                        label={file.name.split('.').pop()?.toUpperCase() || 'FILE'} 
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
                  onClick={() => handleProcessFile(file)}
                  disabled={loading}
                  sx={{ ml: 2 }}
                >
                  {loading ? <CircularProgress size={20} /> : 'Process'}
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