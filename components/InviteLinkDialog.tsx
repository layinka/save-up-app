import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/app/components/DemoComponents';
import { ClipboardIcon, CheckIcon } from '@heroicons/react/24/outline';

interface InviteLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  challengeId: number;
  challengeName: string;
}

export function InviteLinkDialog({ open, onOpenChange, challengeId, challengeName }: InviteLinkDialogProps) {
  const [copied, setCopied] = useState(false);
  const inviteLink = `${window.location.origin}/invite/${challengeId}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#F9FAFB] sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#14213D]">
            Share Challenge Link
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-[#333333] mb-4">
            Share this link with friends to invite them to join your savings challenge:
          </p>
          <div className="flex items-center gap-2 mb-6">
            <div className="flex-1 bg-white p-3 rounded-lg border border-gray-200 text-[#14213D] break-all">
              {inviteLink}
            </div>
            <Button
              onClick={handleCopy}
              className={`p-3 rounded-lg transition-colors ${
                copied 
                  ? 'bg-[#1DB954] text-white text-[#1DB954]' 
                  : 'bg-white border border-[#00C896] text-[#00C896] hover:bg-[#00C896] hover:text-white'
              }`}
            >
              {copied ? (
                <CheckIcon className="h-5 w-5 text-[#14D13D]" />
              ) : (
                <ClipboardIcon className="h-5 w-5 text-[#14D13D]" />
              )}
            </Button>
          </div>
          <div className="bg-[#14213D]/5 p-4 rounded-lg">
            <h3 className="font-semibold text-[#14213D] mb-2">Quick Share</h3>
            <p className="text-sm text-[#333333]">
              You can also share this challenge directly on Farcaster:
            </p>
            <Button
              onClick={() => {
                // TODO: Implement Farcaster share
                window.open(
                  `https://warpcast.com/~/compose?text=Join my savings challenge: ${challengeName}! 💰\n\n${inviteLink}`,
                  '_blank'
                );
              }}
              className="w-full mt-3 bg-[#00C896] hover:bg-[#00B085] text-white py-2 rounded-lg"
            >
              Share on Farcaster
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
