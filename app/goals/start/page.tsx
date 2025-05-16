'use client';

import { useState } from 'react';
import { Button } from '../../components/DemoComponents';
import { SavingsDialog } from '../../components/SavingsDialog';
import { useMiniKit } from '@coinbase/onchainkit/minikit';
import { useVault } from '@/app/hooks/useVault';
import { usePublicClient, useWaitForTransactionReceipt } from 'wagmi';
import { toast } from 'react-hot-toast';
import { decodeEventLog } from 'viem';
import Link  from 'next/link';
import { BottomNavBar } from '@/app/components/BottomNavBar';
import { base } from 'viem/chains';
import { sleep } from '@/lib/utils';
import { useRouter } from 'next/navigation';

const isDevelopment = process.env.NODE_ENV === 'development';

export default function StartGoalPage() {
  const { context } = useMiniKit();
  const router = useRouter();
  const publicClient = usePublicClient({
    chainId: base.id,
  })
  const { createChallenge, isChallengeLoading, challengeHash } = useVault();
  
  const [amount, setAmount] = useState(100);
  const [duration, setDuration] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreatingChallenge, setIsCreatingChallenge] = useState(false);
  
  // // Wait for transaction receipt
  // const { isLoading: isTransactionPending, isSuccess: isTransactionSuccess , data: transactionReceipt} = useWaitForTransactionReceipt({
  //   hash: challengeHash,
  // });

  const handleSave = (newAmount: number, newDuration: number) => {
    setAmount(newAmount);
    setDuration(newDuration);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F9FAFB]">
      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center  justify-center p-6">
        {/* Headline */}
        <h1 className="text-3xl font-bold text-[#14213D] mb-12">
          Set a savings goal
        </h1>

        {/* Goal Input Button */}
        <button
          className="w-full max-w-sm p-6 mb-8 bg-white rounded-full shadow-lg border-2 border-[#00C896] text-[#333333] text-xl font-medium hover:bg-[#00C896] hover:text-white transition-colors duration-200"
          onClick={() => setIsDialogOpen(true)}
        >
          Save ${amount} in {duration} month{duration > 1 ? 's' : ''}
        </button>

        {/* Continue Button */}
        <Button
          className="w-full max-w-sm bg-[#00C896] hover:bg-[#00B085] text-white py-6 rounded-xl text-lg font-semibold shadow-lg"
          onClick={async () => {
            if (!isDevelopment && (!context?.user?.fid || !context?.user?.username || !context?.user?.displayName || !context?.user?.pfpUrl)) {
              toast.error('Missing required user data');
              return;
            }

            setIsCreatingChallenge(true);
            try {
              const challengeName = `Save $${amount} in ${duration} month${duration > 1 ? 's' : ''}`;
              const tx = await createChallenge(challengeName, amount.toString(), duration);
              console.log('Hash: ', tx)
              if (tx ) {
                console.log('Waiting for transaction receipt...')
                await sleep(2000);
                
                
                const response = await fetch('/api/challenges', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    ...(context?.user?.fid ? { 'fid': context.user.fid.toString() } : {}),
                  },
                  body: JSON.stringify({
                    hash: tx,
                    creatorFid: context?.user?.fid?.toString(),
                    username: context?.user?.username,
                    displayName: context?.user?.displayName,
                    profilePictureUrl: context?.user?.pfpUrl,
                    name: challengeName,
                    description: `Save $${amount} in ${duration} month${duration > 1 ? 's' : ''}`,
                    goalAmount: amount,
                    targetDate: new Date(Date.now() + duration * 30 * 24 * 60 * 60 * 1000).toISOString(),
                    transactionHash: tx,
                  }),
                });

                if (response.ok) {
                  const challenge = await response.json();
                  toast.success('Challenge Created successfully!', { duration: 3000 });
                  router.push(`/goals/progress/${challenge.id}`);
                } else {
                  toast.error('Failed to Create challenge');
                }
              }else{
                toast.error('Failed to create challenge');
              }
            } catch (error) {
              console.error('Error creating challenge:', error);
              toast.error(`Failed to create challenge. ${error instanceof Error ? error.message : 'Unknown error'}`, {
                id: 'create-challenge',
                duration: 5000,
              });
            } finally {
              setIsCreatingChallenge(false);
            }
          }}
          disabled={isChallengeLoading || isCreatingChallenge }
        >
          {isChallengeLoading || isCreatingChallenge  ? (
            <span className="flex items-center justify-center">
              <span className="mr-2 h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
              {challengeHash ? 'Challenge Created!' : 'Creating Challenge...'}
            </span>
          ) : (
            'Continue'
          )}
        </Button>

        <Link href="/landing" className={`w-full mt-6`}>
          <button className="w-full max-w-sm bg-[#D80806] hover:bg-[#c03035] text-white py-6 rounded-xl text-lg font-semibold shadow-lg">
            

            <span className="text-sm">Cancel</span>
          </button>
        </Link>

        {/*Add a note to user to inform them that the first to reach target out of all participants will get 10% extra reward in SUP Token, and Others that reach the target will get 10 SUP Token*/}
        <p className="text-sm text-[#00C896] mt-6 font-semibold">
          🏆 Race to the Goal: Every winner earns 10 SUP!<br/>... and the top performer gets <b>10% bonus SUP Extra!</b>
        </p>
      </main>

      {/* Bottom Navigation */}
      <BottomNavBar activeTab="Mini-App" onNavClick={() => {}} />

      {/* <nav className="bg-white border-t border-gray-200 p-4">
        <div className="flex justify-around items-center max-w-md mx-auto">
          <Link href="/landing" >
            <button className="flex flex-col items-center text-[#14213D] opacity-50">
              <span className="text-sm">Home</span>
            </button>
          </Link>
          <button className="flex flex-col items-center text-[#00C896]">
            <span className="text-sm font-medium">Mini-App</span>
            <div className="w-1 h-1 bg-[#00C896] rounded-full mt-1"></div>
          </button>
          <button className="flex flex-col items-center text-[#14213D] opacity-50">
            <span className="text-sm">Profile</span>
          </button>
        </div>
      </nav> */}

      {/* Savings Dialog */}
      <SavingsDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSave}
        initialAmount={amount}
        initialDuration={duration}
      />
    </div>
  );
}
