
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

  // Optimized padding for modern mobile displays with notches
  const topPadding = Platform.select({
    ios: 'pt-14',
    android: 'pt-12',
    default: 'pt-10',
  });

  return (
    <div className="flex-1 flex flex-col items-center justify-between bg-[#0099db] text-white selection:bg-white/20 touch-none">
      
      {/* Header Area */}
      <div className={`flex flex-col items-center w-full px-6 ${topPadding}`}>
        <h1 className="text-3xl md:text-4xl font-black tracking-[0.2em] text-white drop-shadow-lg">JAY GHANTI</h1>
        <div className="mt-2 flex items-center gap-3">
          <p className="text-[10px] uppercase font-bold tracking-[0.3em] text-white/70">
            Total Rings: {totalRings}
          </p>
        </div>
      </div>

      {/* Center Interaction - Takes remaining space */}
      <div className="flex-1 flex items-center justify-center w-full">
        <Bell type={selectedBellType} onRing={handleRing} />
      </div>

      {/* Footer Branding - Adjusted to sit above Navigation */}
      <div className="mb-32 w-full text-center pointer-events-none transition-opacity duration-1000">
         <p className="text-[8px] uppercase tracking-[0.4em] font-medium opacity-30">
          Sacred Sound • Digital Presence
        </p>
      </div>

      {/* Bottom Navigation */}
      <Navigation selected={selectedBellType} onSelect={setSelectedBellType} />
    </div>
  );
};

export default App;
