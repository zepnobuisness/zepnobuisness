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

declare global {
  interface Window {
    Razorpay: any;
  }
}

const AddFundsForm: React.FC<AddFundsFormProps> = ({ onSuccess }) => {
  const [amount, setAmount] = useState<number>(100);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const { user } = useAuth();
  
  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = resolve;
      document.body.appendChild(script);
    });
  };
  
  const handlePayment = async () => {
    try {
      await loadRazorpay();
      
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: amount * 100, // Razorpay expects amount in paise
        currency: 'INR',
        name: 'Zepno',
        description: 'Add funds to wallet',
        handler: async function (response: any) {
          try {
            if (!user) {
              throw new Error('User not authenticated');
            }
            
            const result = await addFunds(user.id, amount);
            
            if (!result.success) {
              throw new Error(result.error || 'Failed to add funds');
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
          }
        },
        prefill: {
          email: user?.email,
          contact: '', // Add phone number if available
        },
        theme: {
          color: '#4F46E5', // Indigo color to match the theme
        },
      };
      
      const razorpay = new window.Razorpay(options);
      razorpay.open();
      
    } catch (err) {
      setError('Failed to initialize payment');
      console.error('Razorpay initialization failed:', err);
    }
  };
  
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
      await handlePayment();
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