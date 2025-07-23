import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Wifi,
  WifiOff,
  Zap,
  ZapOff,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { useSocketContext } from '@/components/providers/SocketProvider';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

interface ConnectionStatusProps {
  variant?: 'badge' | 'indicator' | 'detailed' | 'banner';
  className?: string;
  showReconnectButton?: boolean;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  variant = 'indicator',
  className = '',
  showReconnectButton = true,
}) => {
  const { isConnected, connectionStatus, connect } = useSocketContext();
  const networkStatus = useNetworkStatus();

  const getStatusInfo = () => {
    if (!networkStatus.isOnline) {
      return {
        status: 'offline',
        icon: WifiOff,
        color: 'text-red-500',
        bgColor: 'bg-red-500',
        label: 'Offline',
        description: 'No internet connection',
      };
    }

    if (connectionStatus.isConnecting) {
      return {
        status: 'connecting',
        icon: RefreshCw,
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-500',
        label: 'Connecting',
        description: 'Connecting to real-time services...',
      };
    }

    if (!isConnected) {
      return {
        status: 'disconnected',
        icon: ZapOff,
        color: 'text-red-500',
        bgColor: 'bg-red-500',
        label: 'Disconnected',
        description: connectionStatus.error || 'Real-time features unavailable',
      };
    }

    return {
      status: 'connected',
      icon: Zap,
      color: 'text-green-500',
      bgColor: 'bg-green-500',
      label: 'Connected',
      description: 'Real-time features active',
    };
  };

  const statusInfo = getStatusInfo();
  const Icon = statusInfo.icon;

  const handleReconnect = () => {
    if (!networkStatus.isOnline) {
      return; // Can't reconnect without internet
    }
    connect();
  };

  if (variant === 'badge') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              variant={statusInfo.status === 'connected' ? 'default' : 'destructive'}
              className={`flex items-center space-x-1 ${className}`}
            >
              <Icon className={`h-3 w-3 ${statusInfo.status === 'connecting' ? 'animate-spin' : ''}`} />
              <span>{statusInfo.label}</span>
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>{statusInfo.description}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (variant === 'indicator') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={`flex items-center space-x-2 ${className}`}>
              <div className={`w-2 h-2 rounded-full ${statusInfo.bgColor} ${
                statusInfo.status === 'connecting' ? 'animate-pulse' : ''
              }`} />
              <span className={`text-xs ${statusInfo.color}`}>
                {statusInfo.label}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{statusInfo.description}</p>
            {networkStatus.effectiveType && (
              <p className="text-xs opacity-75">
                Connection: {networkStatus.effectiveType}
              </p>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (variant === 'detailed') {
    return (
      <div className={`flex items-center space-x-3 p-3 rounded-lg border ${className}`}>
        <Icon className={`h-5 w-5 ${statusInfo.color} ${
          statusInfo.status === 'connecting' ? 'animate-spin' : ''
        }`} />
        
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <span className="font-medium text-sm">{statusInfo.label}</span>
            {connectionStatus.reconnectAttempts > 0 && (
              <Badge variant="outline" className="text-xs">
                Attempt {connectionStatus.reconnectAttempts}
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{statusInfo.description}</p>
          
          {networkStatus.effectiveType && (
            <p className="text-xs text-muted-foreground">
              Network: {networkStatus.effectiveType}
              {networkStatus.downlink && ` (${networkStatus.downlink} Mbps)`}
            </p>
          )}
        </div>

        {showReconnectButton && statusInfo.status === 'disconnected' && networkStatus.isOnline && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleReconnect}
            disabled={connectionStatus.isConnecting}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${connectionStatus.isConnecting ? 'animate-spin' : ''}`} />
            Reconnect
          </Button>
        )}
      </div>
    );
  }

  if (variant === 'banner') {
    // Only show banner for problematic states
    if (statusInfo.status === 'connected') {
      return null;
    }

    return (
      <Alert className={`${className} border-l-4 ${
        statusInfo.status === 'offline' ? 'border-l-red-500 bg-red-50' :
        statusInfo.status === 'connecting' ? 'border-l-yellow-500 bg-yellow-50' :
        'border-l-red-500 bg-red-50'
      }`}>
        <Icon className={`h-4 w-4 ${statusInfo.color} ${
          statusInfo.status === 'connecting' ? 'animate-spin' : ''
        }`} />
        <AlertDescription className="flex items-center justify-between">
          <div>
            <span className="font-medium">{statusInfo.label}</span>
            <span className="ml-2">{statusInfo.description}</span>
          </div>
          
          {showReconnectButton && statusInfo.status === 'disconnected' && networkStatus.isOnline && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleReconnect}
              disabled={connectionStatus.isConnecting}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${connectionStatus.isConnecting ? 'animate-spin' : ''}`} />
              Retry
            </Button>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  return null;
};

// Specific status components for different use cases
export const HeaderConnectionStatus: React.FC<{ className?: string }> = ({ className }) => (
  <ConnectionStatus variant="indicator" className={className} showReconnectButton={false} />
);

export const SidebarConnectionStatus: React.FC<{ className?: string }> = ({ className }) => (
  <ConnectionStatus variant="detailed" className={className} />
);

export const BannerConnectionStatus: React.FC<{ className?: string }> = ({ className }) => (
  <ConnectionStatus variant="banner" className={className} />
);

export default ConnectionStatus;
