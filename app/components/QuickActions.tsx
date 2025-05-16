import Link from 'next/link';
import React from 'react';

interface QuickActionsProps {
  onActionClick: (action: string) => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onActionClick }) => {
  return (
    <section className="my-6 grid grid-cols-3 gap-3">
      <Link href="/goals/start">
        <button
          // onClick={() => onActionClick('Start New Goal')}
          className="bg-[#00C896] text-white py-3 px-2 rounded-lg text-sm font-semibold shadow-md hover:bg-opacity-90 transition-colors"
        >
          Start New Goal
        </button>
      
      </Link>
      
      <button
        onClick={() => onActionClick('Join Challenge')}
        className="bg-white text-[#14213D] border border-gray-300 py-3 px-2 rounded-lg text-sm font-semibold shadow-sm hover:bg-gray-50 transition-colors"
      >
        Join Challenge
      </button>
      <button
        onClick={() => onActionClick('Invite Friends')}
        className="bg-white text-[#14213D] border border-gray-300 py-3 px-2 rounded-lg text-sm font-semibold shadow-sm hover:bg-gray-50 transition-colors"
      >
        Invite Friends
      </button>
    </section>
  );
};
