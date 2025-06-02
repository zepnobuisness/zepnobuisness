import React, { useState, useEffect } from 'react';
import { OtpSession as OtpSessionType } from '../../types';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/Card';
import Button from '../ui/Button';
import { ClipboardCopy, Copy, CheckCircle, XCircle, Clock } from 'lucide-react';

interface OtpSessionProps {
  session: OtpSessionType;
  onCancel: (sessionId: string) => void;
  onRefresh: (sessionId: string) => void;
  isLoading?: boolean;
}

const OtpSession: React.FC<OtpSessionProps> = ({ 
  session, 
  onCancel, 
  onRefresh,
  isLoading = false 
}) => {
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [numberCopied, setNumberCopied] = useState(false);
  const [otpCopied, setOtpCopied] = useState(false);
  
  // Calculate time elapsed since session creation
  useEffect(() => {
    const interval = setInterval(() => {
      const created = new Date(session.createdAt).getTime();
      const now = new Date().getTime();
      const elapsed = Math.floor((now - created) / 1000); // seconds
      setTimeElapsed(elapsed);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [session.createdAt]);
  
  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Copy text to clipboard
  const copyToClipboard = (text: string, type: 'number' | 'otp') => {
    navigator.clipboard.writeText(text);
    if (type === 'number') {
      setNumberCopied(true);
      setTimeout(() => setNumberCopied(false), 2000);
    } else {
      setOtpCopied(true);
      setTimeout(() => setOtpCopied(false), 2000);
    }
  };
  
  // Get status indicator
  const getStatusIndicator = () => {
    switch (session.status) {
      case 'pending':
        return (
          <div className="flex items-center text-yellow-500">
            <Clock size={18} className="mr-1" />
            <span>Waiting for OTP</span>
          </div>
        );
      case 'success':
        return (
          <div className="flex items-center text-green-500">
            <CheckCircle size={18} className="mr-1" />
            <span>OTP Received</span>
          </div>
        );
      case 'canceled':
        return (
          <div className="flex items-center text-red-500">
            <XCircle size={18} className="mr-1" />
            <span>Canceled</span>
          </div>
        );
      default:
        return null;
    }
  };
  
  return (
    <Card className={`overflow-hidden transition-all duration-200 ${
      session.status === 'success' ? 'border-green-400' : 
      session.status === 'canceled' ? 'border-red-400' : 'border-yellow-400'
    }`}>
      <CardHeader className="bg-gray-50">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Service: {session.serviceId}</CardTitle>
          {getStatusIndicator()}
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-gray-500">Phone Number</span>
              <button 
                onClick={() => copyToClipboard(session.number, 'number')}
                className="text-indigo-600 hover:text-indigo-800 focus:outline-none"
                disabled={session.status === 'canceled'}
              >
                {numberCopied ? (
                  <CheckCircle size={16} />
                ) : (
                  <Copy size={16} />
                )}
              </button>
            </div>
            <div className="p-3 bg-gray-100 rounded-md font-mono text-lg flex justify-between items-center">
              {session.number}
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-gray-500">OTP Code</span>
              {session.otp && (
                <button 
                  onClick={() => copyToClipboard(session.otp || '', 'otp')}
                  className="text-indigo-600 hover:text-indigo-800 focus:outline-none"
                >
                  {otpCopied ? (
                    <CheckCircle size={16} />
                  ) : (
                    <Copy size={16} />
                  )}
                </button>
              )}
            </div>
            <div className={`p-3 ${session.otp ? 'bg-green-100' : 'bg-gray-100'} rounded-md font-mono text-lg flex justify-between items-center`}>
              {session.otp ? (
                <span className="font-bold">{session.otp}</span>
              ) : (
                <span className="text-gray-500">Waiting for OTP...</span>
              )}
            </div>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">
              Time elapsed: <span className="font-medium">{formatTime(timeElapsed)}</span>
            </span>
            <span className="text-gray-500">
              Session ID: <span className="font-medium">{session.id.substring(0, 8)}</span>
            </span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="bg-gray-50 flex justify-between p-4">
        {session.status === 'pending' && (
          <>
            <Button 
              variant="outline"
              size="sm"
              onClick={() => onCancel(session.id)}
              isLoading={isLoading}
              leftIcon={<XCircle size={16} />}
            >
              Cancel
            </Button>
            <Button 
              variant="primary"
              size="sm"
              onClick={() => onRefresh(session.id)}
              isLoading={isLoading}
              leftIcon={<ClipboardCopy size={16} />}
            >
              Check OTP
            </Button>
          </>
        )}
        {session.status === 'success' && (
          <Button 
            variant="primary"
            size="sm"
            onClick={() => copyToClipboard(session.otp || '', 'otp')}
            fullWidth
            leftIcon={<ClipboardCopy size={16} />}
          >
            Copy OTP
          </Button>
        )}
        {session.status === 'canceled' && (
          <span className="text-sm text-gray-500">This session has been canceled</span>
        )}
      </CardFooter>
    </Card>
  );
};

export default OtpSession;