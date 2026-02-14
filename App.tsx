
import React, { useState, useCallback } from 'react';
import Bell from './components/Bell';
import Navigation from './components/Navigation';
import { BellType } from './components/BellSelector';

const App: React.FC = () => {
  const [selectedBellType, setSelectedBellType] = useState<BellType>('temple');
  const [totalRings, setTotalRings] = useState<number>(0);

  const handleRing = useCallback(() => {
    setTotalRings(prev => prev + 1);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0099db] text-white overflow-hidden">
      
      {/* Centered Minimal Header */}
      <div className="absolute top-12 flex flex-col items-center w-full px-6">
        <h1 className="text-4xl font-black tracking-[0.2em] text-white drop-shadow-md">JAY GHANTI</h1>
        <p className="mt-2 text-[10px] uppercase font-bold tracking-[0.3em] text-white/60">
          Total Rings: {totalRings}
        </p>
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
