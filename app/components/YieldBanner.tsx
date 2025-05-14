import React from 'react';

interface YieldBannerProps {
  earnedYield: string | null | undefined;
}

export const YieldBanner: React.FC<YieldBannerProps> = ({ earnedYield }) => {
  if (!earnedYield) {
    return null;
  }

  return (
    <section className="my-6 p-4 bg-gradient-to-r from-[#00C896] to-[#00A078] rounded-lg shadow text-white text-center">
      <p className="font-semibold">You’ve earned <span className="font-bold">{earnedYield}</span> in DeFi rewards!</p>
    </section>
  );
};
