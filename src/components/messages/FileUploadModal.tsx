import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { 
  Upload, 
  X, 
  FileText, 
  Image, 
  Video, 
  Music,
  AlertCircle 
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  validateFile, 
  uploadFile, 
  formatFileSize, 
  getAttachmentType,
  FileUploadResult 
} from '@/utils/fileUpload';
import { AttachmentType } from '@/types/message.types';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFilesUploaded: (files: FileUploadResult[]) => void;
  maxFiles?: number;
}

interface UploadingFile {
  file: File;
  progress: number;
  error?: string;
  result?: FileUploadResult;
}

export const FileUploadModal: React.FC<FileUploadModalProps> = ({
  isOpen,
  onClose,
  onFilesUploaded,
  maxFiles = 5
}) => {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileIcon = (file: File) => {
    const type = getAttachmentType(file.type);
    switch (type) {
      case AttachmentType.IMAGE:
        return <Image className="w-5 h-5 text-green-600" />;
      case AttachmentType.VIDEO:
        return <Video className="w-5 h-5 text-purple-600" />;
      case AttachmentType.AUDIO:
        return <Music className="w-5 h-5 text-blue-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    const totalFiles = uploadingFiles.length + fileArray.length;

    if (totalFiles > maxFiles) {
      alert(`You can only upload up to ${maxFiles} files at once.`);
      return;
    }

    const newUploadingFiles: UploadingFile[] = fileArray.map(file => {
      const validation = validateFile(file);
      return {
        file,
        progress: 0,
        error: validation.isValid ? undefined : validation.error
      };
    });

    setUploadingFiles(prev => [...prev, ...newUploadingFiles]);

    // Start uploading valid files
    newUploadingFiles.forEach((uploadingFile, index) => {
      if (!uploadingFile.error) {
        uploadFileWithProgress(uploadingFile, uploadingFiles.length + index);
      }
    });
  };

  const uploadFileWithProgress = async (uploadingFile: UploadingFile, index: number) => {
    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setUploadingFiles(prev => 
          prev.map((file, i) => 
            i === index ? { ...file, progress: Math.min(file.progress + 10, 90) } : file
          )
        );
      }, 200);

      const result = await uploadFile(uploadingFile.file);

      clearInterval(progressInterval);

      setUploadingFiles(prev => 
        prev.map((file, i) => 
          i === index ? { ...file, progress: 100, result } : file
        )
      );
    } catch (error) {
      setUploadingFiles(prev => 
        prev.map((file, i) => 
          i === index ? { ...file, error: error instanceof Error ? error.message : 'Upload failed' } : file
        )
      );
    }
  };

  const removeFile = (index: number) => {
    setUploadingFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSend = () => {
    const successfulUploads = uploadingFiles
      .filter(file => file.result)
      .map(file => file.result!);

    if (successfulUploads.length > 0) {
      onFilesUploaded(successfulUploads);
      setUploadingFiles([]);
      onClose();
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const successfulUploads = uploadingFiles.filter(file => file.result).length;
  const hasErrors = uploadingFiles.some(file => file.error);
  const isUploading = uploadingFiles.some(file => file.progress > 0 && file.progress < 100 && !file.error);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Files</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Upload Area */}
          <div
            className={`
              border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer
              ${isDragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-1">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-gray-500">
              Images, documents, videos, and audio files up to 100MB
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files)}
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv"
          />

          {/* File List */}
          {uploadingFiles.length > 0 && (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {uploadingFiles.map((uploadingFile, index) => (
                <div key={index} className="border rounded-lg p-3">
                  <div className="flex items-center space-x-3">
                    {getFileIcon(uploadingFile.file)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {uploadingFile.file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(uploadingFile.file.size)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Progress Bar */}
                  {uploadingFile.progress > 0 && !uploadingFile.error && (
                    <div className="mt-2">
                      <Progress value={uploadingFile.progress} className="h-1" />
                    </div>
                  )}

                  {/* Error Message */}
                  {uploadingFile.error && (
                    <Alert className="mt-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        {uploadingFile.error}
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Success Indicator */}
                  {uploadingFile.result && (
                    <p className="text-xs text-green-600 mt-1">✓ Upload complete</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSend}
            disabled={successfulUploads === 0 || isUploading}
          >
            Send {successfulUploads > 0 && `(${successfulUploads})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
