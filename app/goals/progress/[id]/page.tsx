'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/app/components/DemoComponents';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useMiniKit } from '@coinbase/onchainkit/minikit';
import { InviteLinkDialog } from '@/components/InviteLinkDialog';
import { ParticipantDetail } from '@/components/ParticipantDetail';
import { VaultBalance } from '@/app/components/VaultBalance';
import { DepositDialog } from '@/app/components/DepositDialog';
import { useVault } from '@/app/hooks/useVault';
import { useAccount, useReadContract } from 'wagmi';
import { SaveUpVault_ABI } from '@/lib/contracts';
import { vaultAddress } from '@/app/utils/chain-details';
import { useUserProgress } from '@/app/hooks/useUserProgress';
import sdk from '@farcaster/frame-sdk';
import { format } from 'date-fns';

interface Participant {
  fid: number;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
  currentAmount: number;
}

interface Challenge {
  id: string;
  name: string;
  description: string;
  goalAmount: number;
  targetDate: Date;
  currentAmount: number;
  participants: Participant[];
}

export default function ChallengeProgressPage({ params }: { params: { id: number } }) {
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isInviteLinkDialogOpen, setIsInviteLinkDialogOpen] = useState(false);
  const [isDepositDialogOpen, setIsDepositDialogOpen] = useState(false);
  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Participant[]>([]);
  const { address } = useAccount();
  const { getUserProgress, withdraw } = useVault();
  
  // Get user progress from blockchain
  const { contribution, target, progressPercentage, isLoading: loadingProgressPercent } = useUserProgress(params.id, address || '');
  const { context } = useMiniKit();

  const [isLoading, setIsLoading] = useState(true);
  const [isWithdrawable, setIsWithdrawable] = useState(false);

  useEffect(() => {
    // Fetch challenge data
    const fetchChallenge = async () => {
      try {
        const response = await fetch(`/api/challenges/${params.id}`, {
          headers: {
            ...(context?.user?.fid ? { 'fid': context.user.fid.toString() } : {}),
          }
        });
        if (!response.ok) throw new Error('Failed to fetch challenge');
        const data = await response.json();
        setChallenge(data);

        // Determine if challenge is withdrawable
        // Check if current time is past the challenge end date
        const currentTime = new Date().getTime();
        const endTime = new Date(data.endDate).getTime();
        const hasReachedGoal = data.currentAmount >= data.goalAmount;

        setIsWithdrawable(hasReachedGoal && currentTime >= endTime);
      } catch (error) {
        console.error('Error fetching challenge:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchChallenge();
    }
  }, [params.id]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await fetch(`/api/search/users?q=${encodeURIComponent(query)}`, {
        headers: {
          ...(context?.user?.fid ? { 'fid': context.user.fid.toString() } : {}),
        }
      });
      if (!response.ok) throw new Error('Failed to search users');
      const results = await response.json();
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching users:', error);
      setSearchResults([]);
    }
  };

  const handleInvite = async (participant: Participant) => {
    try {
      const response = await fetch(`/api/challenges/${params.id}/participants`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(context?.user?.fid ? { 'fid': context.user.fid.toString() } : {}),
         },
        body: JSON.stringify({ fid: participant.fid }),
      });

      if (!response.ok) throw new Error('Failed to invite user');
      
      // Update local state
      setChallenge(prev => prev ? {
        ...prev,
        participants: [...prev.participants, participant],
      } : null);

      // Close dialog after successful invite
      setIsInviteDialogOpen(false);
    } catch (error) {
      console.error('Error inviting user:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00C896]"></div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="flex items-center justify-center min-h-screen text-[#14213D]">
        Challenge not found
      </div>
    );
  }

  // Calculate progress percentage based on user's contribution from blockchain
  const userContribution = parseFloat(contribution ?? '0') || 0;
  const userTarget = parseFloat(target ?? '0') || (challenge?.goalAmount || 0);

  return (
    <div className="flex flex-col min-h-screen bg-[#F9FAFB]">
      {/* Main Content */}
      <main className="flex-1 p-6 max-w-2xl mx-auto w-full">
        {/* Challenge Description */}
        <h1 className="text-xl font-semibold text-[#14213D] mb-6">
          {challenge.description}
        </h1>

        {/* Invite Buttons */}
        <div className="grid grid-cols-2  gap-4 mb-8">
          <button
            onClick={() => setIsInviteLinkDialogOpen(true)}
            className="p-4 bg-white rounded-full shadow-lg border-2 border-[#FCA311] text-[#333333] font-medium hover:bg-[#FCA311] hover:text-white transition-colors duration-200"
          >
            Challenge a Friend!
          </button>

          <button
            onClick={async () => await sdk.actions.composeCast({ 
              text: `"Savings mode activated! I'm challenging myself to save ${challenge.goalAmount} by ${format(new Date(challenge.targetDate), 'MMM d, yyyy')}. Who's with me? #SavingsChallenge #FinancialFreedom"`,
              embeds: [],
            })}
            className="p-4 bg-white rounded-full shadow-lg border-2 border-[#FCA311] text-[#333333] font-medium hover:bg-[#FCA311] hover:text-white transition-colors duration-200"
          >
            Share to Feed!
          </button>
        </div>

        {/* Vault Balance Section */}
        <section className="mb-8">
          <VaultBalance challengeId={Number(params.id)} challengeAmount={challenge?.goalAmount || 0} challengeName={challenge?.name || ''} />
        </section>

        {/* Progress Section */}
        <section className="mb-8 bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold text-[#14213D] mb-4">Your Progress</h2>
          {userContribution > 0 ? (
            <>
              <p className="text-2xl font-bold text-[#00C896] mb-2">
                ${userContribution.toLocaleString()} Saved 
              </p>
              <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#00C896] transition-all duration-500"
                  style={{ width: `${Math.min(progressPercentage || 0, 100)}%` }}
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {progressPercentage ? `${progressPercentage.toFixed(2)}% of goal achieved` : 'Progress tracking'}
              </p>
              <p className="text-sm text-gray-600 mb-2">Target Date: {format(new Date(challenge.targetDate), 'MMM d, yyyy')}</p>
            </>
          ) : (
            <p className="text-sm text-gray-500 mt-2">You have $0. Start Saving Now</p>
          )}
        </section>

        {/* Participants Section */}
        <section className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold text-[#14213D] mb-4">Challenge Participants</h2>
          {challenge.participants.length > 0 ? (
            <div className="space-y-4">
              {challenge.participants.map((participant) => (
                <div key={participant.fid}>
                  <ParticipantDetail viewerFid={context?.user?.fid} key={participant.fid} fid={participant.fid} currentAmount={participant.currentAmount} />
                </div>
              ))}
            </div>
          ) : (
            <Button
              className="w-full bg-[#00C896] hover:bg-[#00B085] text-white py-6 rounded-xl text-lg font-semibold"
              onClick={() => setIsInviteDialogOpen(true)}
            >
              No Friends invited yet, Invite Someone now
            </Button>
          )}
        </section>
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-white border-t border-gray-200 p-4">
        <div className="flex justify-around items-center max-w-md mx-auto">
          <button className="flex flex-col items-center text-[#14213D] opacity-50">
            <span className="text-sm">Home</span>
          </button>
          <button className="flex flex-col items-center text-[#00C896]">
            <span className="text-sm font-medium">Mini-App</span>
            <div className="w-1 h-1 bg-[#00C896] rounded-full mt-1"></div>
          </button>
          <button className="flex flex-col items-center text-[#14213D] opacity-50">
            <span className="text-sm">Profile</span>
          </button>
        </div>
      </nav>

      {/* Search Dialog */}
      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent className="bg-white p-6 rounded-xl max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-[#14213D] mb-4">
              Invite Friends
            </DialogTitle>
          </DialogHeader>
          <Input
            type="text"
            placeholder="Search by username..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="mb-4"
          />
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {searchResults.length > 0 ? (
              searchResults.map((user) => (
                <div
                  key={user.fid}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                  onClick={() => handleInvite(user)}
                >
                  <div className="flex items-center">
                    {user.pfpUrl && (
                      <Image
                        src={user.pfpUrl}
                        alt={user.displayName || `User ${user.fid}`}
                        width={40}
                        height={40}
                        className="rounded-full mr-3"
                      />
                    )}
                    <div>
                      <p className="font-medium text-[#14213D]">
                        {user.displayName || `User ${user.fid}`}
                      </p>
                      {user.username && (
                        <p className="text-sm text-gray-500">@{user.username}</p>
                      )}
                    </div>
                  </div>
                  <button className="text-[#00C896] hover:text-[#00B085]">
                    Invite
                  </button>
                </div>
              ))
            ) : searchQuery.length >= 3 ? (
              <p className="text-center text-gray-500 py-4">No users found</p>
            ) : (
              <p className="text-center text-gray-500 py-4">
                Type at least 3 characters to search
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Invite Link Dialog */}
      <InviteLinkDialog
        open={isInviteLinkDialogOpen}
        onOpenChange={() => setIsInviteLinkDialogOpen(false)}
        challengeId={Number(params.id)}
        challengeName={challenge?.name || ''}
      />

      {/* Deposit Dialog */}
      <DepositDialog
        isOpen={isDepositDialogOpen}
        onClose={() => setIsDepositDialogOpen(false)}
        challengeId={Number(params.id)}
        challengeAmount={challenge?.goalAmount || 0}
        challengeName={challenge?.name || ''}
      />

      {/* Withdraw Dialog */}
      <Dialog open={isWithdrawDialogOpen} onOpenChange={() => setIsWithdrawDialogOpen(false)}>
        <DialogContent className="bg-[#F9FAFB] p-6 rounded-xl max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-[#14213D] mb-4">
              Withdraw Funds
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {!isWithdrawable ? (
              <div className="bg-[#FCA311] bg-opacity-10 border border-[#FCA311] rounded-lg p-4 text-center">
                <p className="text-[#333333] mb-2">
                  Withdrawal is not available yet.
                </p>
                <p className="text-sm text-[#14213D]">
                  You can withdraw after reaching your goal and the challenge end date.
                </p>
              </div>
            ) : (
              <>
                <p className="text-[#333333]">
                  You've successfully reached your savings goal! Would you like to withdraw your funds?
                </p>

                <div className="flex space-x-4">
                  <Button
                    className="flex-1 bg-[#1DB954] hover:bg-[#19a85a] text-white py-3 rounded-xl text-lg font-semibold"
                    onClick={async () => {
                      try {
                        await withdraw(Number(params.id));
                        setIsWithdrawDialogOpen(false);
                      } catch (error) {
                        console.error('Withdrawal error:', error);
                      }
                    }}
                  >
                    Confirm Withdrawal
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 border-[#14213D] text-[#14213D] hover:bg-gray-100 py-3 rounded-xl text-lg font-semibold"
                    onClick={() => setIsWithdrawDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
