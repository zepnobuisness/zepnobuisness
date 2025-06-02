import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAvailableServices, requestNumber, getUserSessions, cancelNumber } from '../api/smsActivate';
import { deductFunds } from '../api/wallet';
import { Service, OtpSession } from '../types';
import OtpSessionComponent from '../components/services/OtpSession';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import Button from '../components/ui/Button';

const ServiceDetail: React.FC = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [service, setService] = useState<Service | null>(null);
  const [sessions, setSessions] = useState<OtpSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRequesting, setIsRequesting] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchData = async () => {
      if (!serviceId) return;
      
      setIsLoading(true);
      try {
        // Fetch service details
        const servicesResponse = await getAvailableServices();
        if (servicesResponse.success && servicesResponse.data) {
          const serviceData = servicesResponse.data.find(s => s.id === serviceId);
          if (serviceData) {
            setService(serviceData);
          }
        }
        
        // Fetch active sessions for this service
        if (user) {
          const sessionsResponse = await getUserSessions(user.id);
          if (sessionsResponse.success && sessionsResponse.data) {
            const filteredSessions = sessionsResponse.data.filter(
              s => s.serviceId === serviceId && s.status !== 'canceled'
            );
            setSessions(filteredSessions);
          }
        }
      } catch (error) {
        console.error('Error fetching service data:', error);
        setError('Failed to load service details');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
    
    // Polling for updates
    const interval = setInterval(async () => {
      if (user) {
        const response = await getUserSessions(user.id);
        if (response.success && response.data) {
          const filteredSessions = response.data.filter(
            s => s.serviceId === serviceId && s.status !== 'canceled'
          );
          setSessions(filteredSessions);
        }
      }
    }, 10000);
    
    return () => clearInterval(interval);
  }, [serviceId, user]);
  
  const handleRequestNumber = async () => {
    if (!user || !service) return;
    
    setIsRequesting(true);
    setError('');
    
    try {
      // Check balance
      if (user.balance < service.price) {
        throw new Error('Insufficient balance. Please add funds to your wallet.');
      }
      
      // Request number
      const response = await requestNumber(service.id, user.id);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to get number');
      }
      
      // Deduct funds
      await deductFunds(user.id, service.price, `OTP for ${service.name}`);
      
      // Add session to list
      setSessions(prev => [response.data!, ...prev]);
      
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setIsRequesting(false);
    }
  };
  
  const handleRefreshSession = async (sessionId: string) => {
    if (!user) return;
    
    try {
      const response = await getUserSessions(user.id);
      if (response.success && response.data) {
        const filteredSessions = response.data.filter(
          s => s.serviceId === serviceId && s.status !== 'canceled'
        );
        setSessions(filteredSessions);
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
    }
  };
  
  const handleCancelSession = async (sessionId: string) => {
    try {
      const response = await cancelNumber(sessionId);
      if (response.success) {
        // Update sessions list to reflect the canceled session
        setSessions(prev => prev.filter(s => s.id !== sessionId));
      } else {
        setError(response.error || 'Failed to cancel session');
      }
    } catch (error) {
      console.error('Error canceling session:', error);
      setError('Failed to cancel session');
    }
  };
  
  if (isLoading) {
    return (
      <div className="max-w-md mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          <div className="h-40 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }
  
  if (!service) {
    return (
      <div className="max-w-md mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Service not found</p>
          <Button onClick={() => navigate('/services')}>
            Back to Services
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/services')}
          leftIcon={<ArrowLeft size={18} />}
        >
          Back
        </Button>
        <h1 className="text-2xl font-bold text-gray-900 ml-2">{service.name}</h1>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}
      
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-500">Price</p>
              <p className="text-2xl font-bold text-gray-900">₹{service.price.toFixed(2)}</p>
            </div>
            <Button
              onClick={handleRequestNumber}
              isLoading={isRequesting}
              disabled={!service.isActive || isRequesting}
            >
              Get Number
            </Button>
          </div>
          {service.description && (
            <p className="text-gray-600">{service.description}</p>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          {sessions.length > 0 ? (
            <div className="space-y-4">
              {sessions.map((session) => (
                <OtpSessionComponent
                  key={session.id}
                  session={session}
                  onCancel={handleCancelSession}
                  onRefresh={handleRefreshSession}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No active sessions</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ServiceDetail;