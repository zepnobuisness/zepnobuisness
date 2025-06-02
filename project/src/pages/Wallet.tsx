import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserBalance, getTransactions } from '../api/wallet';
import { Transaction } from '../types';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import AddFundsForm from '../components/wallet/AddFundsForm';
import TransactionList from '../components/wallet/TransactionList';
import { Wallet as WalletIcon, RefreshCw } from 'lucide-react';
import Button from '../components/ui/Button';

const Wallet: React.FC = () => {
  const { user } = useAuth();
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const fetchUserData = async () => {
    if (!user) return;
    
    setIsLoadingBalance(true);
    setIsLoadingTransactions(true);
    
    try {
      // Fetch balance
      const balanceResponse = await getUserBalance(user.id);
      if (balanceResponse.success && balanceResponse.data !== undefined) {
        setBalance(balanceResponse.data);
      }
      
      // Fetch transactions
      const transactionsResponse = await getTransactions(user.id);
      if (transactionsResponse.success && transactionsResponse.data) {
        setTransactions(transactionsResponse.data);
      }
    } catch (error) {
      console.error('Error fetching wallet data:', error);
    } finally {
      setIsLoadingBalance(false);
      setIsLoadingTransactions(false);
    }
  };
  
  useEffect(() => {
    fetchUserData();
  }, [user]);
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchUserData();
    setIsRefreshing(false);
  };
  
  const handleAddFundsSuccess = () => {
    fetchUserData();
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Wallet</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          isLoading={isRefreshing}
          leftIcon={<RefreshCw size={16} />}
        >
          Refresh
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Balance Card */}
        <div>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-indigo-100 text-indigo-600 mr-4">
                    <WalletIcon size={24} />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Current Balance</h3>
                    {isLoadingBalance ? (
                      <div className="animate-pulse h-8 w-32 bg-gray-200 rounded mt-1"></div>
                    ) : (
                      <p className="text-3xl font-bold text-gray-900">₹{balance.toFixed(2)}</p>
                    )}
                  </div>
                </div>
              </div>
              
              <AddFundsForm onSuccess={handleAddFundsSuccess} />
            </CardContent>
          </Card>
        </div>
        
        {/* Transactions */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
            </CardHeader>
            <CardContent>
              <TransactionList
                transactions={transactions}
                isLoading={isLoadingTransactions}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Wallet;