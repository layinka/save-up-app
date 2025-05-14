import { useViewProfile } from '@coinbase/onchainkit/minikit';
import React from 'react';

// Generic Placeholder
export const PlaceholderIcon = ({ className = '' }: { className?: string }) => (
  <svg className={`w-6 h-6 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
);

// Specific Icons
export const UserIcon = ({ className = '' }: { className?: string }) => (
    <svg className={`w-8 h-8 ${className}`} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path></svg>
);

// Placeholder implementations for other icons (replace later)
export const HomeIcon = ({ className = '' }: { className?: string }) => <PlaceholderIcon className={className} />;
export const FeedIcon = ({ className = '' }: { className?: string }) => <PlaceholderIcon className={className} />;
export const WalletIcon = ({ className = '' }: { className?: string }) => <PlaceholderIcon className={className} />;
export const SettingsIcon = ({ className = '' }: { className?: string }) => <PlaceholderIcon className={className} />;

export const UserProfileIcon = ({ className = '' }: { className?: string }) => {
  const viewMyProfile = useViewProfile();
  return ( 
    <button onClick={() => viewMyProfile()}>
      <svg className={`w-8 h-8 ${className}`} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path></svg>
    </button>
  )
  
}; 