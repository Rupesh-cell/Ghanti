
import React, { useState, useCallback } from 'react';
import Bell from './components/Bell';
import BellSelector, { BellType } from './components/BellSelector';

const App: React.FC = () => {
  const [selectedBellType, setSelectedBellType] = useState<BellType>('temple');
  const [totalRings, setTotalRings] = useState<number>(0);

  const handleRing = useCallback(() => {
    setTotalRings(prev => prev + 1);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0099db] text-white px-6">
      
      {/* Centered Minimal Header */}
      <div className="mb-12 flex flex-col items-center">
        <h1 className="text-4xl font-black tracking-[0.2em] text-white drop-shadow-md">JAY GHANTI</h1>
        <p className="mt-2 text-[10px] uppercase font-bold tracking-[0.3em] text-white/60">
          Total Rings: {totalRings}
        </p>
      </div>

      {/* Main Bell Interaction */}
      <div className="relative flex flex-col items-center">
        <Bell type={selectedBellType} onRing={handleRing} />
        
        <div className="mt-12 min-h-[40px] w-full max-w-sm text-center">
          {/* Spacer to maintain layout consistency after removing blessings */}
        </div>
      </div>

      {/* Bell Type Selector Section */}
      <div className="w-full max-w-2xl">
        <div className="flex items-center justify-center space-x-4 mb-2">
          <div className="h-px w-8 bg-white/20"></div>
          <span className="text-[10px] uppercase font-black tracking-[0.5em] text-white/60">Bell Types</span>
          <div className="h-px w-8 bg-white/20"></div>
        </div>
        <BellSelector selected={selectedBellType} onSelect={setSelectedBellType} />
      </div>

      <footer className="mt-auto p-12 text-center">
        <p className="text-white/30 text-[9px] uppercase tracking-[0.3em] font-bold">
          Spiritual Tech Initiative • Minimalist Rituals
        </p>
      </footer>
    </div>
  );
};

export default App;
