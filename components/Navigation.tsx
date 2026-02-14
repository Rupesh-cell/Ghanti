
import React from 'react';
import { BellType } from './BellSelector';

interface NavOption {
  id: BellType;
  label: string;
  icon: string;
}

const NAV_OPTIONS: NavOption[] = [
  { id: 'temple', label: 'Temple', icon: '🔱' },
  { id: 'hand', label: 'Ritual', icon: '🔔' },
  { id: 'tibetan', label: 'Sacred', icon: '🥣' },
  { id: 'church', label: 'Steeple', icon: '⛪' },
];

interface NavigationProps {
  selected: BellType;
  onSelect: (type: BellType) => void;
}

const Navigation: React.FC<NavigationProps> = ({ selected, onSelect }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/10 backdrop-blur-lg border-t border-white/10 px-4 py-3 pb-8 md:pb-4 shadow-[0_-10px_30px_rgba(0,0,0,0.1)] z-50">
      <div className="max-w-md mx-auto flex justify-between items-center">
        {NAV_OPTIONS.map((option) => (
          <button
            key={option.id}
            onClick={() => onSelect(option.id)}
            className="flex flex-col items-center justify-center flex-1 transition-all duration-300 relative group"
          >
            <div className={`
              w-12 h-12 rounded-2xl flex items-center justify-center text-2xl transition-all duration-300
              ${selected === option.id 
                ? 'bg-white text-[#0099db] scale-110 shadow-lg -translate-y-2' 
                : 'text-white/60 hover:text-white hover:bg-white/5'
              }
            `}>
              {option.icon}
            </div>
            <span className={`
              text-[8px] uppercase font-black tracking-widest mt-1 transition-all duration-300
              ${selected === option.id ? 'text-white opacity-100' : 'text-white/40 opacity-0 group-hover:opacity-100'}
            `}>
              {option.label}
            </span>
            
            {/* Active Indicator Dot */}
            {selected === option.id && (
              <div className="absolute -bottom-1 w-1 h-1 bg-white rounded-full shadow-[0_0_10px_white]"></div>
            )}
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;
