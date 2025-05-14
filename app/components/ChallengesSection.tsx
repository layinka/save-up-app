import React from 'react';
import { ChallengeCard, ChallengeCardProps } from './ChallengeCard'; // Assuming ChallengeCard.tsx is in the same directory

interface ChallengesSectionProps {
  challenges: ChallengeCardProps[]; // Use Omit to exclude onClick from the array type
  onChallengeClick: (id: string) => void;
}

export const ChallengesSection: React.FC<ChallengesSectionProps> = ({ challenges, onChallengeClick }) => {
  return (
    <section className="my-3">
      <h2 className="text-lg font-semibold text-[#14213D] mb-3">Your Active Challenges</h2>
      <div className="flex overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
        {challenges.map((challenge) => (
          <ChallengeCard
            key={challenge.id}
            id={challenge.id}
            name={challenge.name}
            progressPercent={challenge.progressPercent}
            progressAmount={challenge.progressAmount}
            daysRemaining={challenge.daysRemaining}
            participants={challenge.participants}
            onClick={() => onChallengeClick(challenge.id)}
          />
        ))}
        {challenges.length === 0 && <p className="text-gray-500 italic">No active challenges yet.</p>}
      </div>
    </section>
  );
};
