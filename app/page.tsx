"use client";

// Removed MiniKit, Wallet, Identity imports as they are in layout.tsx
// Removed useEffect, useMemo, useState, useCallback for layout-specific logic
import { Home } from "./components/DemoComponents";
// If you want the new LandingComponent to be the default home page, import it instead:
// import LandingComponent from "./components/LandingComponent";

export default function AppPage() {
  // The activeTab logic and setFrameReady are removed as they are part of the shared layout now.
  // The openUrl and addFrame hooks might still be needed if specific pages use them directly,
  // but for now, assuming they were primarily for the layout.

  // If you want LandingComponent to be the default page:
  // return <LandingComponent />;

  // Otherwise, to keep the previous Home component as the default page content:
  // Note: The `setActiveTab` prop will be removed from `Home` component later.
  return <Home />;
}
