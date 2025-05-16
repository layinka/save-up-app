import Image from 'next/image';
import { useViewProfile } from '@coinbase/onchainkit/minikit';
import { useState, useEffect } from 'react';
import { getDefaultAvatarImage } from '@/lib/utils';


export interface User {
  id: number;
  username: string;
  displayName: string;
  profilePictureUrl: string;
  totalChallenges: number;
  createdAt: string;
  updatedAt: string;
}

export interface ParticipantDetailProps {
  fid: number;
  currentAmount: number;
  viewerFid?: number;
}




export function ParticipantDetail({ fid, currentAmount, viewerFid }: ParticipantDetailProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const viewProfile = useViewProfile();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`/api/users/${fid}`,
          {
            headers: {
              'fid': viewerFid?.toString() || '',
            },
          }
        );
        if (!response.ok) {
          throw new Error('Failed to fetch user details');
        }
        const data = await response.json();
        setUser(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [fid]);

  if (isLoading) {
    return (
      <div className="animate-pulse flex items-center space-x-4 p-4 bg-white rounded-lg">
        <div className="rounded-full bg-gray-200 h-12 w-12"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="p-4 bg-white rounded-lg border border-[#FF6B6B]/20">
        <p className="text-[#FF6B6B] text-sm">
          {error || 'Failed to load participant details'}
        </p>
      </div>
    );
  }

  const defaultAvatar = getDefaultAvatarImage (user.id); // 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + (user.id);

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start space-x-4">
        {/* Avatar */}
        <div
          onClick={() => viewProfile(fid)}
          className="cursor-pointer transform hover:scale-105 transition-transform"
        >
          <img
            src={user.profilePictureUrl || defaultAvatar}
            alt={user.displayName}
            width={48}
            height={48}
            className="rounded-full" />
        </div>

        {/* User Info */}
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <h3 className="font-semibold text-[#14213D]">{viewerFid === fid ? 'You' : user.displayName}</h3>
            <span className="text-sm text-gray-500">{viewerFid === fid ? 'You' : `@${user.username}`}</span>
          </div>

          {/* Stats */}
          <div className="mt-2 flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#00C896]/10 text-[#00C896]">
                ${currentAmount.toLocaleString()}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#00C896]/10 text-[#00C896]">
                {user.totalChallenges} Challenge{user.totalChallenges !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="text-xs text-gray-500">
              Joined {new Date(user.createdAt).toLocaleDateString()}
            </div>
          </div>

          {/* Last Active */}
          <div className="mt-2 text-xs text-gray-500">
            Last active {new Date(user.updatedAt).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}

