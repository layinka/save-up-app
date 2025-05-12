import React from 'react';

// Placeholder Icon Components (replace with actual icons later)
const PlaceholderIcon = ({ className = '' }: { className?: string }) => (
  <svg className={`w-6 h-6 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
);
const UserIcon = ({ className = '' }: { className?: string }) => (
    <svg className={`w-8 h-8 ${className}`} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path></svg>
);
const HomeIcon = ({ className = '' }: { className?: string }) => <PlaceholderIcon className={className} />; // Replace
const FeedIcon = ({ className = '' }: { className?: string }) => <PlaceholderIcon className={className} />; // Replace
const WalletIcon = ({ className = '' }: { className?: string }) => <PlaceholderIcon className={className} />; // Replace
const SettingsIcon = ({ className = '' }: { className?: string }) => <PlaceholderIcon className={className} />; // Replace

interface ChallengeCardProps {
  name: string;
  progressPercent: number;
  progressAmount: string;
  daysRemaining: number;
  participants: number;
  onClick: () => void;
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({
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

const LandingComponent: React.FC = () => {
  // Placeholder data
  const challenges = [
    { id: 1, name: "Save $100 with Friends", progressPercent: 75, progressAmount: "$75", daysRemaining: 10, participants: 5 },
    { id: 2, name: "Vacation Fund Challenge", progressPercent: 30, progressAmount: "$300", daysRemaining: 45, participants: 3 },
    { id: 3, name: "Emergency Fund Boost", progressPercent: 90, progressAmount: "$450", daysRemaining: 5, participants: 8 },
    { id: 4, name: "Down Payment Drive", progressPercent: 15, progressAmount: "$1500", daysRemaining: 120, participants: 2 },
  ];

  const handleChallengeClick = (id: number) => {
    console.log(`Challenge ${id} clicked`);
    // Navigate to challenge details page
  };

  const handleActionClick = (action: string) => {
    console.log(`${action} clicked`);
    // Handle action
  };

  const handleNavClick = (tab: string) => {
      console.log(`Navigated to ${tab}`);
      // Handle navigation
  }

  const earnedYield = "$12.34"; // Placeholder

  return (
    <div className="flex flex-col min-h-screen bg-[#F9FAFB]">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-10 bg-[#F9FAFB] shadow-sm flex justify-between items-center p-4 h-[60px]">
        <h1 className="text-xl font-bold text-[#14213D]">SaveUp</h1>
        <UserIcon className="text-gray-500 cursor-pointer" />
      </header>

      {/* Main Content Area (scrollable) */}
      <main className="flex-1 overflow-y-auto pt-[60px] pb-[60px] px-4"> {/* Adjust padding top/bottom for fixed header/nav */}
        {/* Active Challenges Section */}
        <section className="my-6">
          <h2 className="text-lg font-semibold text-[#14213D] mb-3">Your Active Challenges</h2>
          <div className="flex overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
            {challenges.map((challenge) => (
              <ChallengeCard
                key={challenge.id}
                name={challenge.name}
                progressPercent={challenge.progressPercent}
                progressAmount={challenge.progressAmount}
                daysRemaining={challenge.daysRemaining}
                participants={challenge.participants}
                onClick={() => handleChallengeClick(challenge.id)}
              />
            ))}
            {challenges.length === 0 && <p className="text-gray-500 italic">No active challenges yet.</p>}
          </div>
        </section>

        {/* Quick Action Buttons */}
        <section className="my-6 grid grid-cols-3 gap-3">
          <button
            onClick={() => handleActionClick('Start New Goal')}
            className="bg-[#00C896] text-white py-3 px-2 rounded-lg text-sm font-semibold shadow-md hover:bg-opacity-90 transition-colors"
          >
            Start New Goal
          </button>
          <button
            onClick={() => handleActionClick('Join Challenge')}
            className="bg-white text-[#14213D] border border-gray-300 py-3 px-2 rounded-lg text-sm font-semibold shadow-sm hover:bg-gray-50 transition-colors"
          >
            Join Challenge
          </button>
          <button
            onClick={() => handleActionClick('Invite Friends')}
            className="bg-white text-[#14213D] border border-gray-300 py-3 px-2 rounded-lg text-sm font-semibold shadow-sm hover:bg-gray-50 transition-colors"
          >
            Invite Friends
          </button>
        </section>

        {/* Optional: Yield Banner */}
        {earnedYield && (
           <section className="my-6 p-4 bg-gradient-to-r from-[#00C896] to-[#00A078] rounded-lg shadow text-white text-center">
              <p className="font-semibold">You’ve earned <span className="font-bold">{earnedYield}</span> in DeFi rewards!</p>
           </section>
        )}

        {/* Optional: Social Feed Preview */}
        <section className="my-6">
          <h3 className="text-md font-semibold text-[#14213D] mb-2">Activity Feed</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p>Alice saved $50 towards "Vacation Fund".</p>
            <p>Bob joined the "Emergency Fund Boost" challenge.</p>
            <p>Charlie invited 3 friends.</p>
            {/* Add more feed items */}
          </div>
        </section>

      </main>

      {/* Fixed Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-10 bg-white border-t border-gray-200 flex justify-around items-center h-[60px]">
        <button onClick={() => handleNavClick('Home')} className="flex flex-col items-center text-[#00C896]"> {/* Active Tab Example */}
            <HomeIcon className="w-6 h-6 mb-1"/>
            <span className="text-xs">Home</span>
        </button>
        <button onClick={() => handleNavClick('Feed')} className="flex flex-col items-center text-gray-500 hover:text-[#14213D]">
            <FeedIcon className="w-6 h-6 mb-1"/>
            <span className="text-xs">Feed</span>
        </button>
        <button onClick={() => handleNavClick('Wallet')} className="flex flex-col items-center text-gray-500 hover:text-[#14213D]">
            <WalletIcon className="w-6 h-6 mb-1"/>
            <span className="text-xs">Wallet</span>
        </button>
        <button onClick={() => handleNavClick('Settings')} className="flex flex-col items-center text-gray-500 hover:text-[#14213D]">
            <SettingsIcon className="w-6 h-6 mb-1"/>
            <span className="text-xs">Settings</span>
        </button>
      </nav>
    </div>
  );
};

export default LandingComponent;
