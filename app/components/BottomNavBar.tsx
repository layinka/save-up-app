import React from 'react';
import { HomeIcon, FeedIcon, WalletIcon, SettingsIcon } from './Icons'; // Assuming Icons.tsx is in the same directory
import Link from 'next/link';
import { useViewProfile } from '@coinbase/onchainkit/minikit';

interface BottomNavBarProps {
  activeTab: string; // To highlight the active tab
  onNavClick: (tab: string) => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeTab, onNavClick }) => {
  const viewProfile= useViewProfile();
  const navItems = [
    { name: 'Home', icon: HomeIcon },
    { name: 'Feed', icon: FeedIcon },
    { name: 'Wallet', icon: WalletIcon },
    { name: 'Settings', icon: SettingsIcon },
  ];

  const handleViewProfile = () => {
    viewProfile();
  };

  return (
    // <nav className="fixed bottom-0 left-0 right-0 z-10 bg-white border-t border-gray-200 flex justify-around items-center h-[60px]">
    //   {navItems.map((item) => {
    //     const IconComponent = item.icon;
    //     const isActive = activeTab === item.name;
    //     return (
    //       <button
    //         key={item.name}
    //         onClick={() => onNavClick(item.name)}
    //         className={`flex flex-col items-center ${isActive ? 'text-[#00C896]' : 'text-gray-500 hover:text-[#14213D]'}`}
    //       >
    //         <IconComponent className="w-6 h-6 mb-1" />
    //         <span className="text-xs">{item.name}</span>
    //       </button>
    //     );
    //   })}
    // </nav>

    <nav className="bg-white border-t border-gray-200 p-4">
      <div className="flex justify-around items-center max-w-md mx-auto">
        <Link href="/landing" className={`${activeTab === 'Home' ? 'text-[#00C896]' : 'text-gray-500 hover:text-[#14213D]'}`}>
          <button className="flex flex-col items-center text-[#14213D] opacity-50">
            <HomeIcon/>

            <span className="text-sm">Home</span>
          </button>
        </Link>
        {/* <button className="flex flex-col items-center text-[#00C896]">
          <span className="text-sm font-medium">Mini-App</span>
          <div className="w-1 h-1 bg-[#00C896] rounded-full mt-1"></div>
        </button> */}
        <button className="flex flex-col items-center text-[#14213D] opacity-50" onClick={handleViewProfile}>
          <span className="text-sm">Profile</span>
        </button>
      </div>
    </nav>
  );
};
