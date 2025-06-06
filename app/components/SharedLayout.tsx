'use client'; // Moved directive here

import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  useMiniKit,
  useAddFrame,
  useOpenUrl,
} from "@coinbase/onchainkit/minikit";
import {
  Name,
  Identity,
  Address,
  Avatar,
  EthBalance,
} from "@coinbase/onchainkit/identity";
import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownDisconnect
} from "@coinbase/onchainkit/wallet";
import { Button } from "./DemoComponents"; // Assuming Button is in DemoComponents
import { Icon } from "./DemoComponents"; // Assuming Icon is in DemoComponents
import { useAccount } from "wagmi";

export function SharedLayout({ children }: { children: React.ReactNode }) {

  const { address } = useAccount();
  const { setFrameReady, isFrameReady, context } = useMiniKit();
  const [frameAdded, setFrameAdded] = useState(false);
  const addFrame = useAddFrame();
  const openUrl = useOpenUrl();

  

  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  const handleAddFrame = useCallback(async () => {
    const frameAdded = await addFrame();
    setFrameAdded(Boolean(frameAdded));
  }, [addFrame]);

  const saveFrameButton = useMemo(() => {
    if (context && !context.client.added) {
      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleAddFrame}
          className="text-[var(--app-accent)] p-4"
          icon={<Icon name="plus" size="sm" />}
        >
          Save Frame
        </Button>
      );
    }

    if (frameAdded) {
      return (
        <div className="flex items-center space-x-1 text-sm font-medium text-[#0052FF] animate-fade-out">
          <Icon name="check" size="sm" className="text-[#0052FF]" />
          <span>Saved</span>
        </div>
      );
    }

    return null;
  }, [context, frameAdded, handleAddFrame]);


  
  

  return (
     <div className="flex flex-col min-h-screen font-sans text-[var(--app-foreground)] mini-app-theme from-[var(--app-background)] to-[var(--app-gray)]">
      <div className="w-full max-w-md mx-auto px-4 py-3 flex flex-col flex-1">
        <header className="flex justify-between items-center mb-3 h-11">
          <div>
            <div className="flex items-center space-x-2">
              <Wallet className="z-10">
                <ConnectWallet>
                  <Name className="text-inherit" />
                </ConnectWallet>
                <WalletDropdown>
                  <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
                    <Avatar />
                    <Name />
                    <Address />
                    <EthBalance />
                  </Identity>
                  <WalletDropdownDisconnect />
                </WalletDropdown>
              </Wallet>
            </div>
          </div>
          <div>{saveFrameButton}</div>
        </header>

        <main className="flex-1">
        
          {!address ? (
            <div className="flex items-center justify-center min-h-screen bg-[#F9FAFB]">
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="mb-4 text-[#FF6B6B] text-4xl">🔒</div>
                <h2 className="text-xl font-bold text-[#14213D] mb-2">Connect Wallet to Continue</h2>
                <p className="text-[#333333] mb-4">Please connect your wallet to access SaveUp features</p>
                <div className="w-full max-w-xs mx-auto">
                  <Wallet>
                    <ConnectWallet >
                      <Name className="text-inherit" />
                    </ConnectWallet>
                  </Wallet>
                </div>
              </div>
            </div>
          ) : (
            children
          )}

        </main>

        <footer className="mt-auto pt-4 text-center"> {/* Use mt-auto to push footer down */}
          <Button
            variant="ghost"
            size="sm"
            className="text-[var(--ock-text-foreground-muted)] text-xs"
            onClick={() => openUrl("https://base.org/builders/minikit")}
          >
            Built on Base with MiniKit
          </Button>
          
          <div className="text-xs text-[var(--ock-text-foreground-muted)]">SaveUp - alpha.0.0.1 - Test Stage</div>
          
          <Button
            variant="ghost"
            size="sm"
            className="text-[var(--ock-text-foreground-muted)] text-xs"
            onClick={() => openUrl("https://basescan.org/address/0xa253f38547a0a702eb4ab22a5564be317b9a7eb7#writeContract")}
          >
            Currently using Mock USDT Contract - Mint Now
          </Button>
        </footer>
      </div>
    </div>
  )
}
