import React from 'react';

export interface ChallengeCardProps {
  id: string;
  name: string;
  progressPercent: number;
  progressAmount: string;
  daysRemaining: number;
  participants: number;
  onClick: () => void;
}

export const ChallengeCard: React.FC<ChallengeCardProps> = ({
  id,
  name,
  progressPercent,
  progressAmount,
  daysRemaining,
  participants,
  onClick
}) => {
  return (
    <div
      className="bg-white rounded-lg shadow-md p-4 min-w-[250px] flex-shrink-0 cursor-pointer mr-4 last:mr-0 hover:shadow-lg transition-shadow"
      onClick={onClick}
    >
      <h3 className="font-semibold text-md text-[#14213D] mb-2 truncate">{name}</h3>
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
        <div
          className="bg-[#00C896] h-2.5 rounded-full"
          style={{ width: `${progressPercent}%` }}
        ></div>
      </div>
      <div className="text-xs text-[#333333] mb-2 flex justify-between">
        <span>{progressPercent}% ({progressAmount})</span>
        <span>{daysRemaining} days left</span>
      </div>
      <div className="text-xs text-gray-500">
        {participants} participants
      </div>
    </div>
  );
};
