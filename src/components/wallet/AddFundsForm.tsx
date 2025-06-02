import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/Card';
import { CreditCard, CheckCircle, QrCode } from 'lucide-react';
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
  const [qrData, setQrData] = useState<string | null>(null);
  const [paymentMode, setPaymentMode] = useState<'qr' | 'card'>('qr');
  
  const { user } = useAuth();
  
  const handleGenerateQR = async () => {
    setError('');
    setSuccess(false);
    setIsLoading(true);
    
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // Call Supabase Edge Function to create QR code
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-qr`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount * 100, // Convert to paise
          userId: user.id,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate QR code');
      }
      
      setQrData(data.qr_code);
      
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
          <div>
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
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  className={`flex items-center justify-center p-4 border rounded-lg ${
                    paymentMode === 'qr'
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => setPaymentMode('qr')}
                >
                  <QrCode size={24} className="mr-2" />
                  <span>QR Code</span>
                </button>
                
                <button
                  type="button"
                  className={`flex items-center justify-center p-4 border rounded-lg ${
                    paymentMode === 'card'
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => setPaymentMode('card')}
                >
                  <CreditCard size={24} className="mr-2" />
                  <span>Card</span>
                </button>
              </div>
            </div>
            
            {paymentMode === 'qr' ? (
              <div className="text-center">
                {qrData ? (
                  <div className="p-4 border rounded-lg">
                    <QRCodeSVG value={qrData} size={200} className="mx-auto" />
                    <p className="mt-4 text-sm text-gray-600">
                      Scan this QR code with any UPI app to add ₹{amount} to your wallet
                    </p>
                  </div>
                ) : (
                  <Button
                    onClick={handleGenerateQR}
                    isLoading={isLoading}
                    fullWidth
                    leftIcon={<QrCode size={18} />}
                  >
                    Generate QR Code for ₹{amount}
                  </Button>
                )}
              </div>
            ) : (
              <Button
                type="button"
                fullWidth
                isLoading={isLoading}
                leftIcon={<CreditCard size={18} />}
              >
                Pay ₹{amount} with Card
              </Button>
            )}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="bg-gray-50 text-sm text-gray-500">
        Funds will be instantly added to your wallet balance after successful payment.
      </CardFooter>
    </Card>
  );
};

export default AddFundsForm;