import React, { useEffect, useState } from 'react';
import { PillStageRoot } from './components/PillStageRoot';
import { FullSettingsWindow } from './components/views/FullSettingsWindow';

export default function App() {
  const [isSettingsWindow, setIsSettingsWindow] = useState(false);

  useEffect(() => {
    const search = window.location.search;
    const hash = window.location.hash;
    setIsSettingsWindow(search.includes('settings') || hash.includes('settings'));
  }, []);

  // Standalone Settings Window Mode
  if (isSettingsWindow) {
    return (
      <div className="w-full h-full bg-[#090b10] flex items-center justify-center p-0 m-0 overflow-hidden">
        <FullSettingsWindow />
      </div>
    );
  }

  // Production Main Pill Window Mode (Transparent 720x520 Overlay)
  return <PillStageRoot />;
}
