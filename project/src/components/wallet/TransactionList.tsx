import React from 'react';
import { Transaction } from '../../types';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  isLoading?: boolean;
}

const TransactionList: React.FC<TransactionListProps> = ({ 
  transactions, 
  isLoading = false 
}) => {
  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-gray-200 rounded-md"></div>
        ))}
      </div>
    );
  }
  
  if (transactions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No transactions yet</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {transactions.map((transaction) => (
        <div 
          key={transaction.id} 
          className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm transition-all hover:shadow-md"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center">
              <div className={`p-2 rounded-full mr-3 ${
                transaction.type === 'credit' 
                  ? 'bg-green-100 text-green-600' 
                  : 'bg-red-100 text-red-600'
              }`}>
                {transaction.type === 'credit' 
                  ? <ArrowDownLeft size={20} /> 
                  : <ArrowUpRight size={20} />
                }
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {transaction.purpose}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(transaction.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
            <div className={`font-bold ${
              transaction.type === 'credit' 
                ? 'text-green-600' 
                : 'text-red-600'
            }`}>
              {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount.toFixed(2)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TransactionList;