'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/app/components/DemoComponents';
import { useVault } from '@/app/hooks/useVault';

interface DepositDialogProps {
  isOpen: boolean;
  onClose: () => void;
  challengeId: number;
}

export function DepositDialog({ isOpen, onClose, challengeId }: DepositDialogProps) {
  const [amount, setAmount] = useState<string>('');
  const [step, setStep] = useState<'approve' | 'deposit'>('approve');
  const [error, setError] = useState<string | null>(null);
  
  const { 
    usdtBalance, 
    isApproved, 
    isLoading, 
    isApproveLoading,
    isApproveError,
    isDepositLoading,
    isDepositError, 
    approveUsdtSpending, 
    deposit,
    allowanceData
  } = useVault();
  
  // Reset state when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      setAmount('');
      setStep(isApproved ? 'deposit' : 'approve');
    }
  }, [isOpen, isApproved]);
  
  // Update step when approval status changes or amount changes
  useEffect(() => {
    // If the user has approved enough USDT for the current amount, show deposit step
    // Otherwise, show approve step
    const amountValue = parseFloat(amount) || 0;
    const allowanceValue = parseFloat(allowanceData) || 0;
    
    if (amountValue > 0 && allowanceValue >= amountValue) {
      setStep('deposit');
    } else {
      setStep('approve');
    }
  }, [isApproved, amount, allowanceData]);
  
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers and decimals
    if (/^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };
  
  const handleApprove = async () => {
    console.log(' approving USDT:', isApproveLoading);
    if (!amount || isApproveLoading ) return;
    if(isApproveError){
      console.error('Error approving USDT:', isApproveError);
      return;
    }
    await approveUsdtSpending(amount);
  };
  
  const handleDeposit = async () => {
    // Reset any previous errors
    setError(null);

    // Validate amount
    const amountValue = parseFloat(amount);
    if (!amount || isNaN(amountValue) || amountValue <= 0) {
      setError('Please enter a valid deposit amount');
      return;
    }

    // Check if user has sufficient USDT balance
    const usdtBalanceValue = parseFloat(usdtBalance);
    if (amountValue > usdtBalanceValue) {
      setError(`Insufficient USDT balance. You have ${usdtBalanceValue.toFixed(2)} USDT available`);
      return;
    }

    // Check if user has sufficient allowance
    const allowanceValue = parseFloat(allowanceData);
    if (amountValue > allowanceValue) {
      setError(`Insufficient allowance. Please approve ${amountValue.toFixed(2)} USDT`);
      return;
    }

    // Prevent multiple submissions
    if (isDepositLoading || isDepositError) {
      setError('Deposit in progress. Please wait.');
      return;
    }

    try {
      // First, deposit to the vault
      await deposit(challengeId, amount);
      
      // Then update challenge amount in the backend
      const response = await fetch(`/api/challenges/${challengeId}/deposit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amountValue,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update challenge amount');
      }

      // If everything is successful, close the dialog
      onClose();
    } catch (error) {
      console.error('Deposit error:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#F9FAFB] p-6 rounded-xl max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-[#14213D] mb-4">
            {challengeId ? 'Contribute to Challenge' : 'Deposit to Vault'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-[#333333] mb-1">
              Amount (USDT)
            </label>
            <Input
              id="amount"
              type="text"
              value={amount}
              onChange={handleAmountChange}
              placeholder="0.00"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-[#00C896] focus:border-[#00C896]"
            />
            <div className="text-sm text-gray-500 mt-1 space-y-1">
              <p>Available: {parseFloat(usdtBalance).toFixed(2)} USDT</p>
              <p>Allowance: {parseFloat(allowanceData).toFixed(2)} USDT</p>
            </div>
          </div>
          
          {error && (
            <div className="bg-[#FF6B6B] bg-opacity-10 border border-[#FF6B6B] rounded-lg p-3 text-[#FF6B6B] text-sm flex items-center space-x-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}
          
          {step === 'approve' && (
            <p className="text-xs text-gray-500 italic">
              You need to approve SaveUp to use your USDT before depositing. This is a one-time approval for the amount you specify.
            </p>
          )}
          
          {step === 'approve' ? (
            <Button
              className="w-full bg-[#FCA311] hover:bg-[#E69200] text-white py-3 rounded-xl text-lg font-semibold"
              onClick={handleApprove}
              disabled={!amount || isApproveLoading || parseFloat(amount) <= 0 }
            >
              {isApproveLoading ? 'Approving...' : `Approve ${amount || '0'} USDT`}
            </Button>
          ) : (
            <Button
              className="w-full bg-[#00C896] hover:bg-[#00B085] text-white py-3 rounded-xl text-lg font-semibold"
              onClick={handleDeposit}
              disabled={!amount || isDepositLoading || parseFloat(amount) <= 0 }
            >
              {isDepositLoading ? 'Processing...' : challengeId ? 'Contribute' : 'Deposit'}
            </Button>
          )}
          
          <div className="text-center">
            <p className="text-xs text-gray-500">
              {step === 'approve' 
                ? 'You need to approve USDT spending before depositing' 
                : 'Depositing will convert your USDT to vault shares'}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
