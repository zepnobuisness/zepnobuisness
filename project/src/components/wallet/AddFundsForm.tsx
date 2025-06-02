import React, { useState } from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/Card';
import { CreditCard, CheckCircle } from 'lucide-react';
import { addFunds } from '../../api/wallet';
import { useAuth } from '../../context/AuthContext';

interface AddFundsFormProps {
  onSuccess: () => void;
}

const AddFundsForm: React.FC<AddFundsFormProps> = ({ onSuccess }) => {
  const [amount, setAmount] = useState<number>(100);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const { user } = useAuth();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    
    if (!amount || amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const response = await addFunds(user.id, amount);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to add funds');
      }
      
      setSuccess(true);
      onSuccess();
      
      // Reset form after a delay
      setTimeout(() => {
        setAmount(100);
        setSuccess(false);
      }, 3000);
      
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const presetAmounts = [50, 100, 200, 500, 1000];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Funds to Your Wallet</CardTitle>
      </CardHeader>
      
      <CardContent>
        {success ? (
          <div className="bg-green-50 border border-green-200 rounded-md p-4 flex items-center">
            <CheckCircle className="text-green-500 mr-2\" size={20} />
            <span className="text-green-800">₹{amount} has been added to your wallet successfully!</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
                {error}
              </div>
            )}
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Amount
              </label>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {presetAmounts.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    className={`py-2 px-4 rounded-md border ${
                      amount === preset 
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-700' 
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => setAmount(preset)}
                  >
                    ₹{preset}
                  </button>
                ))}
              </div>
              
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                placeholder="Enter amount"
                min="10"
                fullWidth
                label="Custom Amount (₹)"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Method
              </label>
              <div className="border border-gray-300 rounded-md p-3 bg-gray-50">
                <div className="flex items-center">
                  <input
                    id="card-payment"
                    name="payment-method"
                    type="radio"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                    checked
                    readOnly
                  />
                  <label htmlFor="card-payment" className="ml-3 block text-sm font-medium text-gray-700">
                    Credit/Debit Card
                  </label>
                </div>
              </div>
            </div>
            
            <Button
              type="submit"
              fullWidth
              isLoading={isLoading}
              leftIcon={<CreditCard size={18} />}
            >
              Add ₹{amount} to Wallet
            </Button>
          </form>
        )}
      </CardContent>
      
      <CardFooter className="bg-gray-50 text-sm text-gray-500">
        Funds will be instantly added to your wallet balance.
      </CardFooter>
    </Card>
  );
};

export default AddFundsForm;