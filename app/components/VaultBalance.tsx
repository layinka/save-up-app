'use client';

import { useEffect, useState } from 'react';
import { useVault } from '@/app/hooks/useVault';
import { Button } from '@/app/components/DemoComponents';
import { DepositDialog } from '@/app/components/DepositDialog';
import { Address } from 'viem';

interface VaultBalanceProps {
  challengeId?: number;
  challengeAmount?: number;
  challengeName?: string;
  address?: Address;
}

export function VaultBalance({ challengeId, challengeAmount, challengeName, address }: VaultBalanceProps) {
  const { vaultBalance, usdtBalance, isLoading, isApproved } = useVault();
  const [isDepositDialogOpen, setIsDepositDialogOpen] = useState(false);
  const [formattedVaultBalance, setFormattedVaultBalance] = useState('0.00');
  const [formattedUsdtBalance, setFormattedUsdtBalance] = useState('0.00');

  useEffect(() => {
    setFormattedVaultBalance(parseFloat(vaultBalance).toFixed(4));
    setFormattedUsdtBalance(parseFloat(usdtBalance).toFixed(2));
  }, [vaultBalance, usdtBalance]);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h2 className="text-lg font-semibold text-[#14213D] mb-4">Your Balances</h2>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-[#333333]">USDT Balance:</span>
          <span className="text-[#14213D] font-medium">
            {isLoading ? (
              <span className="inline-block w-16 h-4 bg-gray-200 animate-pulse rounded"></span>
            ) : (
              `$${formattedUsdtBalance}`
            )}
          </span>
        </div>
        
        {/* <div className="flex justify-between items-center">
          <span className="text-[#333333]">Vault Balance:</span>
          <span className="text-[#00C896] font-medium">
            {isLoading ? (
              <span className="inline-block w-16 h-4 bg-gray-200 animate-pulse rounded"></span>
            ) : (
              `$${formattedVaultBalance}`
            )}
          </span>
        </div> */}
        
        <Button
          className="w-full bg-[#00C896] hover:bg-[#00B085] text-white py-3 rounded-xl text-lg font-semibold mt-4"
          onClick={() => setIsDepositDialogOpen(true)}
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <span className="mr-2 h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
              Loading...
            </span>
          ) : (
            challengeId ? 'Contribute to Challenge' : 'Deposit to Vault'
          )}
        </Button>
      </div>
      
      {address && <DepositDialog
        address={address}
        isOpen={isDepositDialogOpen}
        onClose={() => setIsDepositDialogOpen(false)}
        challengeId={challengeId || 0}
        challengeAmount={challengeAmount || 0}
        challengeName={challengeName || ''}
      />}
    </div>
  );
}
