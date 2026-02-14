
import React from 'react';

export type BellType = 'temple' | 'hand' | 'tibetan' | 'zen';

interface BellTypeOption {
  id: BellType;
  label: string;
  icon: string;
}

const BELL_OPTIONS: BellTypeOption[] = [
  { id: 'temple', label: 'Temple Ghanti', icon: '🛕' },
  { id: 'hand', label: 'Ritual Bell', icon: '🔱' },
  { id: 'tibetan', label: 'Sacred Bowl', icon: '🥣' },
  { id: 'zen', label: 'Brass Bell', icon: '🔔' },
];

interface BellSelectorProps {
  selected: BellType;
  onSelect: (type: BellType) => void;
}

const BellSelector: React.FC<BellSelectorProps> = ({ selected, onSelect }) => {
  return (
    <div className="flex flex-wrap justify-center gap-4 mt-12 p-4">
      {BELL_OPTIONS.map((option) => (
        <button
          key={option.id}
          onClick={() => onSelect(option.id)}
          className={`px-6 py-3 rounded-2xl transition-all duration-300 flex items-center space-x-2 border-2 ${
            selected === option.id
              ? 'bg-white text-[#0099db] border-white scale-105 shadow-lg'
              : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
          }`}
        >
          <span className="text-xl">{option.icon}</span>
          <span className="font-bold text-xs uppercase tracking-widest">{option.label}</span>
        </button>
      ))}
    </div>
  );
};

export default BellSelector;
