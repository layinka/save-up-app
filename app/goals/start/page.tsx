'use client';

import { useState } from 'react';
import { Button } from '../../components/DemoComponents';
import { SavingsDialog } from '../../components/SavingsDialog';

export default function StartGoalPage() {
  const [amount, setAmount] = useState(100);
  const [duration, setDuration] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSave = (newAmount: number, newDuration: number) => {
    setAmount(newAmount);
    setDuration(newDuration);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F9FAFB]">
      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        {/* Headline */}
        <h1 className="text-3xl font-bold text-[#14213D] mb-12">
          Set a savings goal
        </h1>

        {/* Goal Input Button */}
        <button
          className="w-full max-w-sm p-6 mb-8 bg-white rounded-full shadow-lg border-2 border-[#00C896] text-[#333333] text-xl font-medium hover:bg-[#00C896] hover:text-white transition-colors duration-200"
          onClick={() => setIsDialogOpen(true)}
        >
          Save ${amount} in {duration} month{duration > 1 ? 's' : ''}
        </button>

        {/* Continue Button */}
        <Button
          className="w-full max-w-sm bg-[#00C896] hover:bg-[#00B085] text-white py-6 rounded-xl text-lg font-semibold shadow-lg"
          onClick={async () => {
            // Create the challenge
            try {
              const response = await fetch('/api/challenges', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  name: `Save $${amount}`,
                  description: `Save $${amount} in ${duration} month${duration > 1 ? 's' : ''}`,
                  goalAmount: amount,
                  targetDate: new Date(Date.now() + duration * 30 * 24 * 60 * 60 * 1000).toISOString(),
                }),
              });

              if (!response.ok) {
                throw new Error('Failed to create challenge');
              }

              // TODO: Redirect to challenge page
              window.location.href = '/goals';
            } catch (error) {
              console.error('Error creating challenge:', error);
              // TODO: Show error toast
            }
          }}
        >
          Continue
        </Button>
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-white border-t border-gray-200 p-4">
        <div className="flex justify-around items-center max-w-md mx-auto">
          <button className="flex flex-col items-center text-[#14213D] opacity-50">
            <span className="text-sm">Home</span>
          </button>
          <button className="flex flex-col items-center text-[#00C896]">
            <span className="text-sm font-medium">Mini-App</span>
            <div className="w-1 h-1 bg-[#00C896] rounded-full mt-1"></div>
          </button>
          <button className="flex flex-col items-center text-[#14213D] opacity-50">
            <span className="text-sm">Profile</span>
          </button>
        </div>
      </nav>

      {/* Savings Dialog */}
      <SavingsDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSave}
        initialAmount={amount}
        initialDuration={duration}
      />
    </div>
  );
}
