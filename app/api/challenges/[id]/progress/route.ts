import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';
import { SaveUpVault_ABI } from '@/lib/contracts/abis/SaveUpVault';

const VAULT_ADDRESS = '0x123456789abcdef123456789abcdef123456789a' as `0x${string}`; // Replace with actual vault address

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const userAddress = searchParams.get('address');
    
    if (!userAddress) {
      return NextResponse.json(
        { error: 'User address is required' },
        { status: 400 }
      );
    }
    
    const challengeId = params.id;
    
    // Create a public client to interact with the blockchain
    const publicClient = createPublicClient({
      chain: base,
      transport: http(),
    });
    
    // Convert user address to the correct format
    const formattedUserAddress = userAddress as `0x${string}`;
    
    // Get user's progress for the challenge
    // The getUserProgress function returns [contribution, target]
    const progress = await publicClient.readContract({
      address: VAULT_ADDRESS,
      abi: SaveUpVault_ABI,
      functionName: 'getUserProgress',
      args: [BigInt(challengeId), formattedUserAddress],
    });
    
    return NextResponse.json({
      contribution: progress[0].toString(),
      target: progress[1].toString(),
    });
  } catch (error) {
    console.error('Error fetching user progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user progress' },
      { status: 500 }
    );
  }
}
