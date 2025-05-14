import React from 'react';
import { UserIcon, UserProfileIcon } from './Icons'; // Assuming Icons.tsx is in the same directory

interface LandingHeaderProps {
  // Add any necessary props, e.g., user profile info, notification count
}

export const LandingHeader: React.FC<LandingHeaderProps> = () => {
  return (
    <header className="z-10 bg-[#F9FAFB] shadow-sm flex justify-between items-center p-4 h-[60px]">
      <h1 className="text-xl font-bold text-[#14213D]">SaveUp</h1>
      {/* <UserIcon className="text-gray-500 cursor-pointer" /> */}
      <UserProfileIcon className="text-gray-500 cursor-pointer"  />
      {/* Add profile link/dropdown logic here if needed */}
    </header>
  );
};
