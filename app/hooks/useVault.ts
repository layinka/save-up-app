import { useState, useEffect, useCallback } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits, formatUnits, Address, erc20Abi, TransactionReceipt } from 'viem';
import { SaveUpVault_ABI, IERC20_ABI, getContractAddress } from '@/lib/contracts';
import { useMiniKit } from '@coinbase/onchainkit/minikit';
import { baseSepolia } from 'viem/chains';
import { USDT_DECIMALS, usdtAddress, VAULT_DECIMALS, vaultAddress } from '../utils/chain-details';


type FrameContext = {
  chainId?: number;
  user?: {
    fid?: number;
    username?: string;
    displayName?: string;
    pfpUrl?: string;
  };
};

interface UseVaultReturn {
  vaultBalance: string;
  usdtBalance: string;
  isApproved: boolean;
  isLoading: boolean;
  approveUsdtSpending: (amount: string) => Promise<void>;
  deposit: (challengeId: number, amount: string) => Promise<void>;
  depositReceipt?: TransactionReceipt;
  depositHash?: Address;
  isApproveLoading: boolean;
  isDepositLoading: boolean;
  isChallengeLoading: boolean;
  isApproveError: boolean;
  isDepositError: boolean;
  isChallengeError: boolean;
  createChallenge: (name: string, targetAmount: string, durationInMonths: number) => Promise<Address| undefined | null|void>;
  challengeHash: Address | undefined;
  // challengeReceipt?: TransactionReceipt;
  // isChallengeSuccess?: boolean;
  getUserProgress: (challengeId: number, userAddress?: string) => Promise<{ contribution: string; target: string }>;
  allowanceData: string;
  approveHash: Address | undefined;
  withdraw: (challengeId: number) => Promise<`0x${string}` | undefined>;
  withdrawHash?: Address;
  isWithdrawLoading: boolean;
  isWithdrawError: boolean;
}

export function useVault(): UseVaultReturn {
  const { address } = useAccount();
  const { context} = useMiniKit();
  
  
  const [vaultBalance, setVaultBalance] = useState<string>('0');
  const [usdtBalance, setUsdtBalance] = useState<string>('0');
  const [isApproved, setIsApproved] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
 
  
  // Read contracts
  const { data: vaultBalanceData, refetch: refetchVaultBalance } = useReadContract({
    address: vaultAddress,
    abi: SaveUpVault_ABI,
    functionName: 'balanceOf',
    args: address ? [address as Address] : undefined,
    // @ts-ignore - enabled is valid but TypeScript doesn't recognize it
    enabled: !!address,
  });
  
  const { data: usdtBalanceData ,refetch: refetchUsdtBalance} = useReadContract({
    address: usdtAddress,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: address ? [address as Address] : undefined,
    // @ts-ignore - enabled is valid but TypeScript doesn't recognize it
    enabled: !!address,
  });
  
  const { data: allowanceData, refetch: refetchAllowance } = useReadContract({
    address: usdtAddress,
    abi: erc20Abi,
    functionName: 'allowance',
    // @ts-ignore - TypeScript expects a readonly array with 1 element, but we need 2 elements
    args: address && vaultAddress ? [address as Address, vaultAddress] : undefined,
    // @ts-ignore - enabled is valid but TypeScript doesn't recognize it
    enabled: !!address,
  });

  
  
  // Write contracts
  const { data: approveHash, writeContractAsync: approveUsdt, isPending: isApprovePending, isError: isApproveError } = useWriteContract();
  const { data: depositHash, writeContractAsync: depositToVault, isPending: isDepositPending, isError: isDepositError } = useWriteContract();
  const { data: challengeHash, writeContractAsync: createChallengeToVault, isPending: isChallengePending, isError: isChallengeError } = useWriteContract();
  const { data: withdrawHash, writeContractAsync: withdrawFromVault, isPending: isWithdrawPending, isError: isWithdrawError } = useWriteContract();
  
  // // Transaction receipts
  // const { isLoading: isApproveLoading, data: approveReceipt } = useWaitForTransactionReceipt({
  //   hash: approveHash,
  // });
  
  // const { isLoading: isDepositLoading, data: depositReceipt } = useWaitForTransactionReceipt({
  //   hash: depositHash,
  // });
  
  // const { isLoading: isChallengeLoading, data: challengeReceipt, isSuccess: isChallengeSuccess } = useWaitForTransactionReceipt({
  //   hash: challengeHash,
  // });
  
  // Update balances when data changes
  useEffect(() => {
    if (vaultBalanceData) {
      setVaultBalance(formatUnits(vaultBalanceData as bigint, VAULT_DECIMALS));
    }
    
    if (usdtBalanceData) {
      setUsdtBalance(formatUnits(usdtBalanceData as bigint, USDT_DECIMALS));
    }
    
    if (allowanceData) {
      setIsApproved(Number(allowanceData) > 0);
    }
  }, [vaultBalanceData, usdtBalanceData, allowanceData, approveHash]);

  useEffect(() => {
    refetchVaultBalance();
    refetchUsdtBalance();
    refetchAllowance();
  }, [approveHash, depositHash, challengeHash, withdrawHash]);
  
  // Update loading state
  // useEffect(() => {
  //   setIsLoading(isApprovePending || isApproveLoading || isDepositPending || isDepositLoading || isChallengePending || isChallengeLoading);
  // }, [isApprovePending, isApproveLoading, isDepositPending, isDepositLoading, isChallengePending, isChallengeLoading]);
  
  useEffect(() => {
    setIsLoading(isApprovePending  || isDepositPending  || isChallengePending );
  }, [isApprovePending, isDepositPending, isChallengePending]);
  

  // Approve USDT spending
  const approveUsdtSpending = useCallback(async (amount: string) => {
    if (!address) return;
    
    try {
      const amountInWei = parseUnits(amount, USDT_DECIMALS);
      
      await approveUsdt({
        address: usdtAddress,
        abi: erc20Abi,
        functionName: 'approve',
        args: [vaultAddress, amountInWei],
      });
    } catch (error) {
      console.error('Error approving USDT:', error);
    }
  }, [address, approveUsdt, usdtAddress, vaultAddress]);
  
  // Deposit to vault
  const deposit = useCallback(async (challengeId: number,amount: string ) => {
    if (!address) return;
    
    try {
      const amountInWei = parseUnits(amount, USDT_DECIMALS);
      
      let tx = await depositToVault({
        address: vaultAddress,
        abi: SaveUpVault_ABI,
        functionName: 'contribute',
        args: [BigInt(challengeId), amountInWei],
      });
    } catch (error) {
      console.error('Error depositing to vault:', error);
    }
  }, [address, depositToVault, vaultAddress]);
  
  // Get user's progress in a challenge
  const getUserProgress = useCallback(async (challengeId: number, userAddress: string = address || '') => {
    if (!userAddress) return { contribution: '0', target: '0' };
    // getUserEarnings
    try {
      const result = await fetch(`/api/challenges/${challengeId}/progress?address=${userAddress}`);
      if (!result.ok) throw new Error('Failed to fetch user progress');
      
      return await result.json();
    } catch (error) {
      console.error('Error getting user progress:', error);
      return { contribution: '0', target: '0' };
    }
  }, [address]);
  
  
  // Create a challenge in the vault
  const createChallenge = useCallback(async (name: string, targetAmount: string, durationInMonths: number) => {
    console.log('Creating challenge with name:', name, address);
    if (!address) return;
    
    console.log('Creating challenge with target amount:', targetAmount);
    console.log('Creating challenge with duration in months:', durationInMonths);
    try {
      // Convert target amount to wei
      const targetAmountInWei = parseUnits(targetAmount, USDT_DECIMALS);
      
      // Calculate end date (current timestamp + duration in seconds)
      const endDateSeconds = Math.floor(Date.now() / 1000) + (durationInMonths * 30 * 24 * 60 * 60);
      const endDate = BigInt(endDateSeconds);
      
      // Call the createChallenge function on the vault contract
      const tx = await createChallengeToVault({
        address: vaultAddress,
        abi: SaveUpVault_ABI,
        functionName: 'createChallenge',
        args: [name, targetAmountInWei, endDate],
      });
      console.log('Creating challenge tx:', tx);
      return tx;
    } catch (error) {
      console.error('Error creating challenge:', error);
      throw error;  // Rethrow to allow caller to handle
    }
  }, [address, createChallengeToVault, vaultAddress]);

  // Withdraw funds from a completed challenge
  const withdraw = useCallback(async (challengeId: number) => {
    if (!address) return;

    try {
      const tx = await withdrawFromVault({
        address: vaultAddress,
        abi: SaveUpVault_ABI,
        functionName: 'withdrawFromChallenge',
        args: [BigInt(challengeId)],
      });

      return tx;
    } catch (error) {
      console.error('Error withdrawing from challenge:', error);
      throw error;
    }
  }, [address, withdrawFromVault, vaultAddress]);
  
  return {
    vaultBalance,
    usdtBalance,
    isApproved,
    isLoading,
    approveUsdtSpending,
    deposit,
    withdraw,
    isWithdrawLoading: isWithdrawPending,
    isApproveLoading: isApprovePending ,
    isDepositLoading: isDepositPending ,
    isChallengeLoading: isChallengePending ,
    createChallenge,
    challengeHash,
    // challengeReceipt,
    // isChallengeSuccess,
    getUserProgress,
    allowanceData: allowanceData ? formatUnits(allowanceData as bigint, USDT_DECIMALS) : '0',
    approveHash,
    depositHash,
    withdrawHash,
    isApproveError,
    isDepositError,
    isChallengeError,
    isWithdrawError,
  };
}
