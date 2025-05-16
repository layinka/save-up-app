import { useContractRead, useReadContract } from 'wagmi'
import { USDT_DECIMALS, vaultAddress } from '../utils/chain-details'
import { SaveUpVault_ABI } from '@/lib/contracts'
import { formatUnits } from 'viem'
import { base } from 'wagmi/chains'

// Hook to get user's progress in a challenge
export function useUserProgress(challengeId: number, userAddress: string) {
  const { data, isLoading, error } = useReadContract({
    address: vaultAddress,
    abi: SaveUpVault_ABI,
    functionName: 'getUserProgress',
    args: [BigInt(challengeId), userAddress as any],
    chainId: base.id,
  })

  if (isLoading) return { isLoading: true }
  if (error) return { error }

  // USDT has 6 decimals, so we need to convert
  const contribution = data && formatUnits(data[0], USDT_DECIMALS) 
  const target = data && formatUnits(data[1], USDT_DECIMALS)
  const progressPercentage = (contribution && target) ? (Number(contribution) / Number(target)) * 100 : 0

  return {
    contribution,
    target,
    progressPercentage,
    isLoading: false,
  }
}