import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  FileText, 
  Image, 
  Video, 
  Music, 
  Eye,
  ExternalLink 
} from 'lucide-react';
import { MessageAttachment, AttachmentType } from '@/types/message.types';
import { formatFileSize } from '@/utils/fileUpload';

interface FileAttachmentProps {
  attachment: MessageAttachment;
  isOwnMessage?: boolean;
  onPreview?: (attachment: MessageAttachment) => void;
}

export const FileAttachment: React.FC<FileAttachmentProps> = ({
  attachment,
  isOwnMessage = false,
  onPreview
}) => {
  const getIcon = () => {
    switch (attachment.type) {
      case AttachmentType.IMAGE:
        return <Image className="w-4 h-4" />;
      case AttachmentType.VIDEO:
        return <Video className="w-4 h-4" />;
      case AttachmentType.AUDIO:
        return <Music className="w-4 h-4" />;
      case AttachmentType.DOCUMENT:
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getTypeColor = () => {
    switch (attachment.type) {
      case AttachmentType.IMAGE:
        return 'bg-green-100 text-green-700 border-green-200';
      case AttachmentType.VIDEO:
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case AttachmentType.AUDIO:
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case AttachmentType.DOCUMENT:
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = attachment.url;
    link.download = attachment.name;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePreview = () => {
    if (onPreview) {
      onPreview(attachment);
    } else {
      // Fallback to opening in new tab
      window.open(attachment.url, '_blank');
    }
  };

  const canPreview = attachment.type === AttachmentType.IMAGE || 
                    attachment.type === AttachmentType.VIDEO ||
                    attachment.mimeType === 'application/pdf';

  // For images, show thumbnail
  if (attachment.type === AttachmentType.IMAGE) {
    return (
      <div className={`relative group max-w-xs ${isOwnMessage ? 'ml-auto' : 'mr-auto'}`}>
        <img
          src={attachment.url}
          alt={attachment.name}
          className="rounded-lg max-h-64 w-auto cursor-pointer hover:opacity-90 transition-opacity"
          onClick={handlePreview}
        />
        
        {/* Overlay with actions */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={handlePreview}
              className="bg-white/90 hover:bg-white"
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={handleDownload}
              className="bg-white/90 hover:bg-white"
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* File info */}
        <div className="mt-1 text-xs text-gray-500">
          {attachment.name} • {formatFileSize(attachment.size)}
        </div>
      </div>
    );
  }

  // For other file types, show file card
  return (
    <div className={`max-w-sm ${isOwnMessage ? 'ml-auto' : 'mr-auto'}`}>
      <div className={`
        border rounded-lg p-3 bg-white hover:shadow-md transition-shadow cursor-pointer
        ${isOwnMessage ? 'border-blue-200' : 'border-gray-200'}
      `}>
        <div className="flex items-start space-x-3">
          {/* File icon */}
          <div className={`p-2 rounded-lg ${getTypeColor()}`}>
            {getIcon()}
          </div>
          
          {/* File info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <p className="text-sm font-medium text-gray-900 truncate">
                {attachment.name}
              </p>
              <Badge variant="outline" className="text-xs">
                {attachment.type}
              </Badge>
            </div>
            
            <p className="text-xs text-gray-500 mb-2">
              {formatFileSize(attachment.size)}
            </p>
            
            {/* Actions */}
            <div className="flex space-x-2">
              {canPreview && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handlePreview}
                  className="h-7 px-2 text-xs"
                >
                  <Eye className="w-3 h-3 mr-1" />
                  Preview
                </Button>
              )}
              
              <Button
                size="sm"
                variant="outline"
                onClick={handleDownload}
                className="h-7 px-2 text-xs"
              >
                <Download className="w-3 h-3 mr-1" />
                Download
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Audio player component for audio attachments
export const AudioAttachment: React.FC<FileAttachmentProps> = ({
  attachment,
  isOwnMessage = false
}) => {
  if (attachment.type !== AttachmentType.AUDIO) {
    return <FileAttachment attachment={attachment} isOwnMessage={isOwnMessage} />;
  }

  return (
    <div className={`max-w-sm ${isOwnMessage ? 'ml-auto' : 'mr-auto'}`}>
      <div className={`
        border rounded-lg p-3 bg-white
        ${isOwnMessage ? 'border-blue-200' : 'border-gray-200'}
      `}>
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
            <Music className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {attachment.name}
            </p>
            <p className="text-xs text-gray-500">
              {formatFileSize(attachment.size)}
            </p>
          </div>
        </div>
        
        <audio controls className="w-full h-8">
          <source src={attachment.url} type={attachment.mimeType} />
          Your browser does not support the audio element.
        </audio>
      </div>
    </div>
  );
};
