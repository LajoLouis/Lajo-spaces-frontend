import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Info, 
  X, 
  User, 
  Mail, 
  Phone, 
  Key, 
  Code,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export const DevInfo: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  // Only show in development
  if (import.meta.env.PROD) {
    return null;
  }

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 left-4 z-50">
        <Button
          onClick={() => setIsVisible(true)}
          size="sm"
          variant="outline"
          className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
        >
          <Info className="h-4 w-4 mr-2" />
          Dev Info
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 max-w-sm">
      <Card className="border-blue-200 bg-blue-50/95 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center text-blue-800">
              <Info className="h-4 w-4 mr-2" />
              Development Mode
              <Badge variant="secondary" className="ml-2 text-xs">
                Mock Auth
              </Badge>
            </CardTitle>
            <div className="flex items-center space-x-1">
              <Button
                onClick={() => setIsExpanded(!isExpanded)}
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 text-blue-600 hover:bg-blue-100"
              >
                {isExpanded ? (
                  <ChevronUp className="h-3 w-3" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                )}
              </Button>
              <Button
                onClick={() => setIsVisible(false)}
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 text-blue-600 hover:bg-blue-100"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        {isExpanded && (
          <CardContent className="pt-0 space-y-3 text-xs text-blue-700">
            <div>
              <h4 className="font-semibold mb-2 flex items-center">
                <User className="h-3 w-3 mr-1" />
                Demo Account
              </h4>
              <div className="space-y-1 text-xs">
                <div className="flex items-center">
                  <Mail className="h-3 w-3 mr-1" />
                  <code className="bg-blue-100 px-1 rounded">demo@lajospaces.com</code>
                </div>
                <div className="flex items-center">
                  <Key className="h-3 w-3 mr-1" />
                  <span>Any password works</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2 flex items-center">
                <User className="h-3 w-3 mr-1" />
                New Registration
              </h4>
              <div className="text-xs">
                <p>Create any account - all data is stored locally</p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2 flex items-center">
                <Code className="h-3 w-3 mr-1" />
                Verification Code
              </h4>
              <div className="flex items-center">
                <code className="bg-blue-100 px-1 rounded">123456</code>
                <span className="ml-1">for email/phone verification</span>
              </div>
            </div>

            <div className="pt-2 border-t border-blue-200">
              <p className="text-xs text-blue-600">
                Mock authentication simulates real API responses with network delays.
                All data is stored in browser localStorage.
              </p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};
