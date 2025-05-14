'use client';
import React, { useState, useEffect } from 'react';

// Import extracted components
import { LandingHeader } from '../components/LandingHeader';
import { ChallengesSection } from '../components/ChallengesSection';
import { QuickActions } from '../components/QuickActions';
import { YieldBanner } from '../components/YieldBanner';
import { ActivityFeedPreview } from '../components/ActivityFeedPreview';
import { BottomNavBar } from '../components/BottomNavBar';
import { ChallengeCardProps } from '../components/ChallengeCard';

// Type definition for the data structure coming from the API (matches db/schema.ts)
type ChallengeFromAPI = {
  id: number;
  name: string;
  description: string | null;
  goalAmount: number;
  currentAmount: number;
  targetDate: string | null; // API will likely send dates as ISO strings
  participantsCount: number;
  creatorFid: string | null;
  createdAt: string;
  updatedAt: string;
};

// Keep the main LandingPage component structure
const LandingPage: React.FC = () => {
  // State for challenges, loading, and errors
  const [challenges, setChallenges] = useState<ChallengeCardProps[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChallenges = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/challenges');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: ChallengeFromAPI[] = await response.json();

        // Transform API data to ChallengeCardProps
        const transformedChallenges = data.map(transformChallengeData);

        setChallenges(transformedChallenges);
      } catch (e) {
        console.error("Failed to fetch challenges:", e);
        setError(e instanceof Error ? e.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchChallenges();
  }, []); // Empty dependency array ensures this runs only once on mount

  // State for earned yield (replace with actual data fetching later)
  const [earnedYield, setEarnedYield] = useState<string>("$12.34");

  // State for active navigation tab
  const [activeNavTab, setActiveNavTab] = useState('Home');

  // Handlers
  const handleChallengeClick = (id: string) => {
    console.log(`Challenge ${id} clicked`);
    // TODO: Navigate to challenge details page using the challenge ID (which is now string)
  };

  const handleActionClick = (action: string) => {
    console.log(`${action} clicked`);
    // TODO: Handle action (e.g., open modal, navigate)
  };

  const handleNavClick = (tab: string) => {
    console.log(`Navigated to ${tab}`);
    setActiveNavTab(tab);
    // TODO: Implement actual navigation if needed (e.g., using Link or router)
  }

  return (
    <div className="flex flex-col space-y-6 animate-fade-in bg-[#F9FAFB]">
      <LandingHeader />

      {/* Main Content Area (scrollable) - Adjust padding for fixed header/nav */}
      <main className="flex-1 overflow-y-auto pt-3 px-4"> 
        {isLoading && <p className="text-center text-[#14213D]">Loading challenges...</p>}
        {error && <p className="text-center text-red-500">Error loading challenges: {error}</p>}
        {!isLoading && !error && (
          <ChallengesSection challenges={challenges} onChallengeClick={handleChallengeClick} />
        )}
        <QuickActions onActionClick={handleActionClick} />
        <YieldBanner earnedYield={earnedYield} />
        <ActivityFeedPreview />
      </main>

    
    </div>
  );
};

// Helper function to transform API data to ChallengeCardProps
const transformChallengeData = (apiChallenge: ChallengeFromAPI): ChallengeCardProps => {
  const goal = apiChallenge.goalAmount / 100; // Convert cents to dollars
  const current = apiChallenge.currentAmount / 100; // Convert cents to dollars
  const progressPercent = goal > 0 ? Math.round((current / goal) * 100) : 0;
  const progressAmount = `$${current.toFixed(2)}`; // Format as currency string

  let daysRemaining = 0;
  if (apiChallenge.targetDate) {
    const target = new Date(apiChallenge.targetDate);
    const now = new Date();
    const diffTime = target.getTime() - now.getTime();
    daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24))); // Calculate remaining days
  }
  
  return {
    id: apiChallenge.id.toString(), // Convert numeric ID to string as expected by prop
    name: apiChallenge.name,
    progressPercent,
    progressAmount,
    daysRemaining,
    participants: apiChallenge.participantsCount,
    onClick: () => console.log(`Transformed challenge ${apiChallenge.id} clicked`), // Placeholder onClick
  };
};

export default LandingPage;
