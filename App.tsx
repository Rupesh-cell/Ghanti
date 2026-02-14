
import React, { useState, useCallback } from 'react';
import Bell from './components/Bell';
import Navigation from './components/Navigation';
import { BellType } from './components/BellSelector';
import Platform from './utils/Platform';

const App: React.FC = () => {
  const [selectedBellType, setSelectedBellType] = useState<BellType>('temple');
  const [totalRings, setTotalRings] = useState<number>(0);

  const handleRing = useCallback(() => {
    setTotalRings(prev => prev + 1);
  }, []);

  // Use Platform.select to define top padding for simulated status bars on mobile web
  const topPadding = Platform.select({
    ios: 'pt-16',
    android: 'pt-14',
    default: 'pt-12',
  });

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0099db] text-white overflow-hidden selection:bg-white/20">
      
      {/* Centered Header with Platform-aware padding */}
      <div className={`absolute top-0 flex flex-col items-center w-full px-6 ${topPadding}`}>
        <h1 className="text-4xl font-black tracking-[0.2em] text-white drop-shadow-md">JAY GHANTI</h1>
        <p className="mt-2 text-[10px] uppercase font-bold tracking-[0.3em] text-white/60">
          Total Rings: {totalRings}
        </p>
        
        {/* Environment Indicator for developer visibility in VS Code */}
        <div className="mt-2 px-2 py-0.5 rounded-full border border-white/10 bg-white/5">
           <span className="text-[8px] opacity-40 uppercase tracking-tighter">Running on: {Platform.OS}</span>
        </div>
      </div>

      {/* Main Bell Interaction */}
      <div className="flex-1 flex items-center justify-center w-full px-6">
        <Bell type={selectedBellType} onRing={handleRing} />
      </div>

      {/* Modern Bottom Navigation */}
      <Navigation selected={selectedBellType} onSelect={setSelectedBellType} />

      {/* Subtle Branding */}
      <div className="absolute bottom-24 w-full text-center pointer-events-none opacity-20">
         <p className="text-[9px] uppercase tracking-[0.3em] font-bold italic">
          Spiritual Tech Initiative
        </p>
      </div>
    </div>
  );
};

export default App;
