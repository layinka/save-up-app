'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";

interface SavingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (amount: number, duration: number) => void;
  initialAmount: number;
  initialDuration: number;
}

export function SavingsDialog({
  isOpen,
  onClose,
  onSave,
  initialAmount,
  initialDuration,
}: SavingsDialogProps) {
  const [amount, setAmount] = React.useState(initialAmount);
  const [duration, setDuration] = React.useState(initialDuration);

  const handleSave = () => {
    onSave(amount, duration);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#F9FAFB] sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#14213D]">
            Adjust your goal
          </DialogTitle>
        </DialogHeader>
        <div className="py-6 space-y-8">
          {/* Amount Slider */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-[#333333]">
                Amount to save
              </label>
              <span className="text-lg font-bold text-[#00C896]">
                ${amount}
              </span>
            </div>
            <Slider
              value={[amount]}
              onValueChange={(value) => setAmount(value[0])}
              min={10}
              max={1000}
              step={10}
              className="[&_[role=slider]]:bg-[#00C896]"
            />
          </div>

          {/* Duration Slider */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-[#333333]">
                Duration (months)
              </label>
              <span className="text-lg font-bold text-[#00C896]">
                {duration} month{duration > 1 ? 's' : ''}
              </span>
            </div>
            <Slider
              value={[duration]}
              onValueChange={(value) => setDuration(value[0])}
              min={1}
              max={12}
              step={1}
              className="[&_[role=slider]]:bg-[#00C896]"
            />
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            className="w-full bg-[#00C896] hover:bg-[#00B085] text-white py-3 rounded-xl text-lg font-semibold transition-colors duration-200"
          >
            Set Goal
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
