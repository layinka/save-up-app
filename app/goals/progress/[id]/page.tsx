'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/app/components/DemoComponents';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useMiniKit } from '@coinbase/onchainkit/minikit';
import { InviteLinkDialog } from '@/components/InviteLinkDialog';
import { ParticipantDetail } from '@/components/ParticipantDetail';

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
  currentAmount: number;
  participants: Participant[];
}

export default function ChallengeProgressPage({ params }: { params: { id: string } }) {
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isInviteLinkDialogOpen, setIsInviteLinkDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Participant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { context } = useMiniKit();

  useEffect(() => {
    // Fetch challenge data
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

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await fetch(`/api/search/users?q=${encodeURIComponent(query)}`);
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
        headers: { 'Content-Type': 'application/json' },
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

  const progressPercentage = (challenge.currentAmount / challenge.goalAmount) * 100;

  return (
    <div className="flex flex-col min-h-screen bg-[#F9FAFB]">
      {/* Main Content */}
      <main className="flex-1 p-6 max-w-2xl mx-auto w-full">
        {/* Challenge Description */}
        <h1 className="text-xl font-semibold text-[#14213D] mb-6">
          {challenge.description}
        </h1>

        {/* Invite Buttons */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <button
            onClick={() => setIsInviteDialogOpen(true)}
            className="p-4 bg-white rounded-full shadow-lg border-2 border-[#00C896] text-[#333333] font-medium hover:bg-[#00C896] hover:text-white transition-colors duration-200"
          >
            Search Friends
          </button>
          <button
            onClick={() => setIsInviteLinkDialogOpen(true)}
            className="p-4 bg-white rounded-full shadow-lg border-2 border-[#FCA311] text-[#333333] font-medium hover:bg-[#FCA311] hover:text-white transition-colors duration-200"
          >
            Share Link
          </button>
        </div>

        {/* Progress Section */}
        <section className="mb-8 bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold text-[#14213D] mb-4">Your Progress</h2>
          {challenge.currentAmount > 0 ? (
            <>
              <p className="text-2xl font-bold text-[#00C896] mb-2">
                ${challenge.currentAmount.toLocaleString()} Saved
              </p>
              <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#00C896] transition-all duration-500"
                  style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Goal: ${challenge.goalAmount.toLocaleString()}
              </p>
            </>
          ) : (
            <Button
              className="w-full bg-[#00C896] hover:bg-[#00B085] text-white py-6 rounded-xl text-lg font-semibold"
              onClick={() => {/* TODO: Add savings flow */}}
            >
              Add your First Savings now
            </Button>
          )}
        </section>

        {/* Participants Section */}
        <section className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold text-[#14213D] mb-4">Challenge Participants</h2>
          {challenge.participants.length > 0 ? (
            <div className="space-y-4">
              {challenge.participants.map((participant) => (
                <div>
                  <ParticipantDetail key={participant.fid} fid={participant.fid} />
                  <div key={participant.fid} className="flex items-center space-x-3 p-3 bg-[#F9FAFB] rounded-lg">
                    <Image
                      src={participant.pfpUrl ?? ''}
                      alt={participant.username ?? ''}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                    <div>
                      <p className="font-medium text-[#14213D]">{participant.displayName}</p>
                      <p className="text-sm text-gray-500">@{participant.username}</p>
                    </div>
                    {participant.currentAmount > 0 && (
                      <p className="ml-auto font-semibold text-[#00C896]">
                        ${participant.currentAmount.toLocaleString()}
                      </p>
                    )}
                  </div>
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

      {/* Search Friends Dialog */}
      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent className="bg-[#F9FAFB] sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[#14213D]">
              Invite Friends
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              type="text"
              placeholder="Search Farcaster users..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="mb-4"
            />
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {searchResults.map((user) => (
                <div key={user.fid} className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Image
                      src={user.pfpUrl ?? ''}
                      alt={user.username ?? ''}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                    <div>
                      <p className="font-medium text-[#14213D]">{user.displayName}</p>
                      <p className="text-sm text-gray-500">@{user.username}</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleInvite(user)}
                    className="bg-[#00C896] hover:bg-[#00B085] text-white px-4 py-2 rounded-lg"
                  >
                    Invite
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Share Link Dialog */}
      <InviteLinkDialog
        open={isInviteLinkDialogOpen}
        onOpenChange={setIsInviteLinkDialogOpen}
        challengeId={params.id}
        challengeName={challenge.name}
      />
    </div>
  );
}
