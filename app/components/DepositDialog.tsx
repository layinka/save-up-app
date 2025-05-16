'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/app/components/DemoComponents';
import { useVault } from '@/app/hooks/useVault';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { USDT_DECIMALS, usdtAddress, vaultAddress } from '../utils/chain-details';
import { Address, erc20Abi, formatUnits, parseUnits } from 'viem';
import { sleep } from '@/lib/utils';
import { SaveUpVault_ABI } from '@/lib/contracts';
import { useMiniKit } from '@coinbase/onchainkit/minikit';
import { base } from 'wagmi/chains';

interface DepositDialogProps {
  isOpen: boolean;
  onClose: () => void;
  challengeId: number;
  challengeAmount: number;
  challengeName: string;
  address?: Address;
}

export function DepositDialog({address, isOpen, onClose, challengeId, challengeAmount, challengeName }: DepositDialogProps) {
  const [amount, setAmount] = useState<string>('');
  const [step, setStep] = useState<'approve' | 'deposit' >('deposit');
  const [error, setError] = useState<string | null>(null);
  // const { address } = useAccount();
  const { context } = useMiniKit();

  const { data: approveHash, writeContractAsync: approveUsdt, isPending: isApprovePending, isError: isApproveError } = useWriteContract();
  const { data: depositHash, writeContractAsync: depositToVault, isPending: isDepositPending, isError: isDepositError } = useWriteContract();
  
  const { data: allowanceData, refetch: refetchAllowance } = useReadContract({
      address: usdtAddress,
      abi: erc20Abi,
      functionName: 'allowance',
      chainId: 8453,
      // @ts-ignore - TypeScript expects a readonly array with 1 element, but we need 2 elements
      args:  [address as Address, vaultAddress] ,
      // @ts-ignore - enabled is valid but TypeScript doesn't recognize it
      // enabled: !!address,
  });
  const { data: usdtBalance ,refetch: refetchUsdtBalance} = useReadContract({
      address: usdtAddress,
      abi: erc20Abi,
      functionName: 'balanceOf',
      args: [address as Address] ,
      chainId: 8453,
      // @ts-ignore - enabled is valid but TypeScript doesn't recognize it
      // enabled: !!address,
  });
  // const { 
  //   // usdtBalance, 
  //   // isApproved, 
  //   // isLoading, 
  //   // isApproveLoading,
  //   // isApproveError,
  //   isDepositLoading,
  //   isDepositError, 
  //   // approveUsdtSpending, 
  //   deposit,
  //   allowanceData
  // } = useVault();

  useEffect(() => {
    if(address){
      console.log('refteching allowance and balance for  address', address);
      refetchAllowance();
      refetchUsdtBalance();
    }
  }, [address]);
  
  // Reset state when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      setAmount('');
      setError(null);
      // setStep('approve');
    }
    refetchAllowance();
    refetchUsdtBalance();
  }, [isOpen]);
  
  // Update step when approval status changes or amount changes
  useEffect(() => {
    console.log('allowanceData', allowanceData);
    if(!allowanceData){
      return;
    }
    const amountValue = +formatUnits(BigInt(amount??'0'), USDT_DECIMALS) || 0;
    const allowanceValue = +formatUnits(allowanceData, USDT_DECIMALS) || 0;
    
    if (amountValue > 0) {
      if (allowanceValue >= amountValue) {
        setStep('deposit');
        setError(null);
      } else {
        // setStep('approve');
        setStep('deposit');
      }
    }
  }, [amount, allowanceData]);
  
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers and decimals
    if (/^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };
  
  const handleApprove = async () => {
    if (!amount || isApprovePending ) return;
    if(isApproveError){
      console.error('Error approving USDT:', isApproveError);
      return;
    }
    let tx = await approveUsdt({
      address: usdtAddress,
      abi: erc20Abi,
      functionName: 'approve',
      args: [vaultAddress, parseUnits(amount, USDT_DECIMALS)],
    });
    if(tx){
      await sleep(2000);
      setStep('deposit');
    }

    refetchAllowance();
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
    const amountInWei = parseUnits(amount, USDT_DECIMALS);

    //// Check if user has sufficient USDT balance
    // const usdtBalanceValue = parseFloat(formatUnits(usdtBalance??BigInt(0), USDT_DECIMALS));
    // if (amountInWei > (usdtBalance??BigInt(0))) {
    //   setError(`Insufficient USDT balance. You have ${usdtBalanceValue.toFixed(2)} USDT available`);
    //   return;
    // }

    // Check if user has sufficient allowance
    
    // if (amountInWei > (allowanceData??BigInt(0))) {
    //   setError(`Insufficient allowance. Please approve ${amountValue.toFixed(2)} USDT`);
    //   return;
    // }

    // Prevent multiple submissions
    if (isDepositPending || isDepositError) {
      setError('Deposit in progress. Please wait.');
      return;
    }

    try {
      // First, deposit to the vault
      console.log('depositing to vault', amountInWei, challengeId, vaultAddress);
            
      let tx = await depositToVault({
        address: vaultAddress,
        abi: SaveUpVault_ABI,
        functionName: 'contribute',
        args: [BigInt(challengeId), amountInWei],
        chainId: base.id,
      });

      await sleep(2000);
      
      // Then update challenge amount in the backend
      const response = await fetch(`/api/challenges/${challengeId}/deposit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'fid': context?.user?.fid?.toString()??'',
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
      console.error('Deposit error:', isDepositError, error);
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
            {/* <div className="text-sm text-gray-500 mt-1 space-y-1">
              <p>Available: {(+formatUnits(usdtBalance??BigInt(0), USDT_DECIMALS)).toFixed(2)} USDT</p>
              <p>Allowance: {(+formatUnits(allowanceData??BigInt(0), USDT_DECIMALS)).toFixed(2)} USDT</p>
            </div> */}
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
            <div className="space-y-2">
              <p className="text-xs text-gray-500 italic">
                You need to approve SaveUp to use your USDT before depositing. This is a one-time approval for the amount you specify.
              </p>
              <p className="text-xs text-[#FCA311] font-semibold">
                ⚠️ Approve the exact amount you want to deposit
              </p>
            </div>
          )}
          
          {step === 'approve' ? (
            <Button
              className="w-full bg-[#FCA311] hover:bg-[#E69200] text-white py-3 rounded-xl text-lg font-semibold"
              onClick={handleApprove}
              disabled={!amount || isApprovePending || parseFloat(amount) <= 0 }
            >
              {isApprovePending ? 'Approving...' : `Approve ${amount || '0'} USDT`}
            </Button>
          ) : step === 'deposit' ? (
            <Button
              className="w-full bg-[#00C896] hover:bg-[#00B085] text-white py-3 rounded-xl text-lg font-semibold"
              onClick={handleDeposit}
              disabled={!amount || isDepositPending || parseFloat(amount) <= 0 }
            >
              {isDepositPending ? 'Processing...' : challengeId ? `Contribute ${amount} USDT` : `Deposit ${amount} USDT`}
            </Button>
          ) : (
            <Button
              className="w-full bg-gray-300 text-gray-500 py-3 rounded-xl text-lg font-semibold"
              disabled
            >
              Waiting for Approval
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
