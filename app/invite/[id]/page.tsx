'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/app/components/DemoComponents';
import { useMiniKit, useViewProfile } from '@coinbase/onchainkit/minikit';
import { getDefaultAvatarImage } from '@/lib/utils';
import { ParticipantDetail } from '@/components/ParticipantDetail';

interface Participant {
  fid: string;
  username: string;
  displayName: string;
  pfpUrl: string;
  currentAmount: number;
}

interface Challenge {
  id: string;
  name: string;
  description: string;
  goalAmount: number;
  currentAmount: number;
  participants: Participant[];
  creatorFid: string;
}

export default function InvitePage({ params }: { params: { id: string } }) {
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const router = useRouter();
  const {context} = useMiniKit();
  
  
  const viewProfile = useViewProfile();

  useEffect(() => {
    const fetchChallenge = async () => {
      try {
        const response = await fetch(`/api/challenges/${params.id}`);
        if (!response.ok) throw new Error('Failed to fetch challenge');
        const data = await response.json();
        setChallenge(data);
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

  const handleJoinChallenge = async () => {
    if (!challenge || !context?.user?.fid) return;

    setIsJoining(true);
    try {
      const response = await fetch(`/api/challenges/${challenge.id}/participants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          fid: context.user.fid.toString(),
          username: context.user.username,
          displayName: context.user.displayName,
          profilePictureUrl: context.user.pfpUrl,
          
        
        }),
      });

      if (!response.ok) throw new Error('Failed to join challenge');

      // Redirect to the challenge progress page
      router.push(`/goals/progress/${challenge.id}`);
    } catch (error) {
      console.error('Error joining challenge:', error);
      setIsJoining(false);
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

  // Find the inviter's details from participants
  const inviter = challenge.participants.find(p => p.fid === challenge.creatorFid);

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-6">
      <div className="max-w-2xl mx-auto">
        {/* Challenge Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h1 className="text-2xl font-bold text-[#14213D] mb-2">
            {challenge.name}
          </h1>
          <p className="text-[#333333] mb-6">
            {challenge.description}
          </p>
          <div className="flex items-center gap-4 p-4 bg-[#F9FAFB] rounded-lg mb-6">
            <div className="flex-shrink-0">
              {inviter && (
                <img
                  src={inviter.pfpUrl?? getDefaultAvatarImage(inviter.fid) }
                  alt={inviter.displayName}
                  width={48}
                  height={48}
                  className="rounded-full"
                />
              )}
            </div>
            <div>
              <p className="text-sm text-[#14213D]">Invited by</p>
              <p className="font-semibold text-[#14213D]">
                {inviter ? inviter.displayName : 'Unknown Friend'}
              </p>
            </div>
          </div>
          <div className="mb-6">
            <p className="text-sm text-[#14213D] mb-2">Goal Amount</p>
            <p className="text-2xl font-bold text-[#00C896]">
              ${challenge.goalAmount.toLocaleString()}
            </p>
          </div>
          <Button
            onClick={handleJoinChallenge}
            disabled={isJoining || !context?.user?.fid}
            className="w-full bg-[#00C896] hover:bg-[#00B085] text-white py-4 rounded-xl text-lg font-semibold disabled:opacity-50"
          >
            {isJoining ? 'Joining...' : 'Accept Challenge'}
          </Button>
          {!context?.user?.fid && (
            <p className="text-sm text-[#FF6B6B] mt-2 text-center">
              Please connect your Farcaster account to join
            </p>
          )}
        </div>

        {/* Participants Section */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-[#14213D] mb-4">
            Current Participants ({challenge.participants.length})
          </h2>
          <div className="space-y-4">
            {challenge.participants.map((participant) => (
              <ParticipantDetail
                key={participant.fid}
                fid={Number(participant.fid)}
                currentAmount={participant.currentAmount}
              />
              // <div
              //   key={participant.fid}
              //   className="flex items-center space-x-3 p-3 bg-[#F9FAFB] rounded-lg"
              // >
              //   <img
              //     src={participant.pfpUrl?? getDefaultAvatarImage(participant.fid) }
              //     alt={participant.username}
              //     width={40}
              //     height={40}
              //     className="rounded-full"
              //   />
              //   <div>
              //     <p className="font-medium text-[#14213D]">
              //       {participant.displayName}
              //     </p>
              //     <p className="text-sm text-gray-500">
              //       @{participant.username}
              //     </p>
              //   </div>
                
              //   <p className="ml-auto font-semibold text-[#00C896]">
              //     ${participant.currentAmount.toLocaleString()}
              //   </p>
                
              // </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
