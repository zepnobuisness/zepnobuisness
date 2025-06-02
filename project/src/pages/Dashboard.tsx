import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserSessions } from '../api/smsActivate';
import { getTransactions } from '../api/wallet';
import { OtpSession, Transaction } from '../types';
import OtpSessionComponent from '../components/services/OtpSession';
import TransactionList from '../components/wallet/TransactionList';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { CreditCard, MessageCircle, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<OtpSession[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        setIsLoadingSessions(true);
        setIsLoadingTransactions(true);
        
        try {
          // Fetch OTP sessions
          const sessionsResponse = await getUserSessions(user.id);
          if (sessionsResponse.success && sessionsResponse.data) {
            setSessions(sessionsResponse.data);
          }
          
          // Fetch transactions
          const transactionsResponse = await getTransactions(user.id);
          if (transactionsResponse.success && transactionsResponse.data) {
            setTransactions(transactionsResponse.data);
          }
        } catch (error) {
          console.error('Error fetching dashboard data:', error);
        } finally {
          setIsLoadingSessions(false);
          setIsLoadingTransactions(false);
        }
      }
    };
    
    fetchData();
    
    // Polling for updates every 10 seconds
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [user]);
  
  const handleRefreshSession = async (sessionId: string) => {
    setIsRefreshing(true);
    try {
      const response = await getUserSessions(user?.id || '');
      if (response.success && response.data) {
        setSessions(response.data);
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
    } finally {
      setIsRefreshing(false);
    }
  };
  
  const handleCancelSession = async (sessionId: string) => {
    // Implement cancel logic
    console.log('Canceling session:', sessionId);
  };
  
  // Count sessions by status
  const pendingSessions = sessions.filter(s => s.status === 'pending').length;
  const successSessions = sessions.filter(s => s.status === 'success').length;
  const canceledSessions = sessions.filter(s => s.status === 'canceled').length;
  
  // Get the most recent active sessions
  const recentSessions = [...sessions]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);
  
  // Get the most recent transactions
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-indigo-100 text-indigo-600 mr-4">
                <CreditCard size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Balance</p>
                <p className="text-2xl font-bold text-gray-900">₹{user?.balance.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
                <Clock size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Pending OTPs</p>
                <p className="text-2xl font-bold text-gray-900">{pendingSessions}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                <CheckCircle size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Received OTPs</p>
                <p className="text-2xl font-bold text-gray-900">{successSessions}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100 text-red-600 mr-4">
                <XCircle size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Canceled</p>
                <p className="text-2xl font-bold text-gray-900">{canceledSessions}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Sessions */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center">
                  <MessageCircle className="mr-2" size={20} />
                  Active OTP Sessions
                </CardTitle>
                <Link to="/services">
                  <Button variant="outline" size="sm">
                    Get New Number
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingSessions ? (
                <div className="animate-pulse space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-32 bg-gray-200 rounded-md"></div>
                  ))}
                </div>
              ) : recentSessions.length > 0 ? (
                <div className="space-y-4">
                  {recentSessions.map((session) => (
                    <OtpSessionComponent
                      key={session.id}
                      session={session}
                      onCancel={handleCancelSession}
                      onRefresh={handleRefreshSession}
                      isLoading={isRefreshing}
                    />
                  ))}
                  
                  {sessions.length > 3 && (
                    <div className="text-center mt-4">
                      <Link to="/services\" className="text-indigo-600 hover:text-indigo-800">
                        View all {sessions.length} sessions
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No active OTP sessions</p>
                  <Link to="/services">
                    <Button size="sm">
                      Get Your First Number
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Recent Transactions */}
        <div>
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center">
                  <CreditCard className="mr-2" size={20} />
                  Recent Transactions
                </CardTitle>
                <Link to="/wallet">
                  <Button variant="outline" size="sm">
                    Add Funds
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <TransactionList
                transactions={recentTransactions}
                isLoading={isLoadingTransactions}
              />
              
              {transactions.length > 5 && (
                <div className="text-center mt-4">
                  <Link to="/wallet\" className="text-indigo-600 hover:text-indigo-800">
                    View all transactions
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;