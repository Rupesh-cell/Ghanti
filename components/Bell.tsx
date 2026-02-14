
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { BellType } from './BellSelector';

interface BellProps {
  type: BellType;
  onRing: () => void;
}

const SOUND_URLS: Record<BellType, string> = {
  temple: "https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3",
  hand: "https://www.soundjay.com/misc/sounds/bell-ringing-04.mp3",
  tibetan: "https://www.soundjay.com/misc/sounds/bell-ringing-01.mp3",
  church: "https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3"
};

const Bell: React.FC<BellProps> = ({ type, onRing }) => {
  const [isSwinging, setIsSwinging] = useState(false);
  const [motionPermission, setMotionPermission] = useState<'default' | 'granted' | 'denied'>('default');
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioRefs = useRef<Record<string, HTMLAudioElement>>({});
  const lastShakeTime = useRef<number>(0);

  // Initialize Audio and Shake Detection
  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    Object.entries(SOUND_URLS).forEach(([key, url]) => {
      const audio = new Audio(url);
      audio.preload = "auto";
      audioRefs.current[key] = audio;
    });

    const handleMotion = (event: DeviceMotionEvent) => {
      const accel = event.accelerationIncludingGravity;
      if (!accel) return;

      const threshold = 15; // Sensitivity of the shake
      const curTime = Date.now();

      if ((curTime - lastShakeTime.current) > 700) { // Cooldown
        const totalAccel = Math.abs(accel.x || 0) + Math.abs(accel.y || 0) + Math.abs(accel.z || 0);
        if (totalAccel > threshold) {
          lastShakeTime.current = curTime;
          handleRing();
        }
      }
    };

    window.addEventListener('devicemotion', handleMotion);

    return () => {
      window.removeEventListener('devicemotion', handleMotion);
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, [type]);

  const requestMotionPermission = async () => {
    if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      try {
        const permissionState = await (DeviceMotionEvent as any).requestPermission();
        setMotionPermission(permissionState);
      } catch (e) {
        console.error("Error requesting motion permission:", e);
      }
    } else {
      // Browser doesn't need explicit request (Android/Desktop)
      setMotionPermission('granted');
    }
  };

  const playSyntheticBell = (frequency: number = 440) => {
    if (!audioContextRef.current) return;
    const ctx = audioContextRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    
    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(frequency * 1.5, ctx.currentTime);
    const gain2 = ctx.createGain();
    
    osc.connect(gain);
    osc2.connect(gain2);
    gain.connect(ctx.destination);
    gain2.connect(ctx.destination);

    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);

    gain2.gain.setValueAtTime(0, ctx.currentTime);
    gain2.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.01);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.0);

    osc.start();
    osc2.start();
    osc.stop(ctx.currentTime + 1.5);
    osc2.stop(ctx.currentTime + 1.5);
  };

  const handleRing = useCallback(() => {
    setIsSwinging(true);
    onRing();

    const audio = audioRefs.current[type];
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(() => {
        const frequencies: Record<BellType, number> = { temple: 330, hand: 880, tibetan: 220, church: 180 };
        playSyntheticBell(frequencies[type]);
      });
    }

    setTimeout(() => setIsSwinging(false), 600);
  }, [onRing, type]);

  const renderBellIcon = () => {
    switch(type) {
      case 'temple':
        // Traditional Hindu Hand Ghanti
        return (
          <svg viewBox="0 0 100 120" fill="none" className="w-full h-full bell-shadow text-[#0099db]">
            {/* Long Handle */}
            <path d="M50 5C47 5 45 7 45 10V45C45 48 47 50 50 50C53 50 55 48 55 45V10C55 7 53 5 50 5Z" fill="currentColor" />
            <circle cx="50" cy="8" r="4" fill="currentColor" />
            {/* Bell Body */}
            <path d="M50 50C35 50 25 60 25 75V90H75V75C75 60 65 50 50 50Z" fill="currentColor" />
            <path d="M20 90C20 88 22 87 24 87H76C78 87 80 88 80 90V94C80 98 76 102 72 102H28C24 102 20 98 20 94V90Z" fill="currentColor" />
            {/* Clapper */}
            <circle cx="50" cy="105" r="5" fill="currentColor" />
            <path d="M48 102L48 95H52L52 102H48Z" fill="currentColor" />
          </svg>
        );
      case 'hand':
        return (
          <svg viewBox="0 0 100 100" fill="none" className="w-full h-full bell-shadow text-[#0099db]">
            <path d="M50 10C44.4772 10 40 14.4772 40 20V40C40 40 25 45 25 60V75H75V60C75 45 60 40 60 40V20C60 14.4772 55.5228 10 50 10Z" fill="currentColor" />
            <circle cx="50" cy="80" r="5" fill="currentColor" />
          </svg>
        );
      case 'tibetan':
        return (
          <svg viewBox="0 0 100 100" fill="none" className="w-full h-full bell-shadow text-[#0099db]">
            <path d="M10 40C10 60 25 80 50 80C75 80 90 60 90 40H10Z" fill="currentColor" />
            <rect x="15" y="45" width="70" height="2" fill="white" opacity="0.5" />
          </svg>
        );
      case 'church':
        return (
          <svg viewBox="0 0 100 100" fill="none" className="w-full h-full bell-shadow text-[#0099db]">
             <path d="M50 5C30 5 15 25 15 50V75H85V50C85 25 70 5 50 5Z" fill="currentColor" />
             <path d="M10 75H90V85H10V75Z" fill="currentColor" />
             <circle cx="50" cy="88" r="4" fill="currentColor" />
          </svg>
        );
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center">
      <button 
        onClick={handleRing}
        className="relative w-64 h-64 md:w-80 md:h-80 bg-white rounded-full flex items-center justify-center shadow-2xl transition-transform active:scale-95 focus:outline-none overflow-hidden"
      >
        <div className={`w-32 h-32 md:w-40 md:h-40 flex items-center justify-center transition-all duration-300 ${isSwinging ? 'animate-swing' : ''}`}>
          {renderBellIcon()}
        </div>
      </button>
      
      <div className="mt-8 flex flex-col items-center gap-4">
        <p className="text-white/80 uppercase tracking-[0.4em] text-xs font-bold">Tap or Shake to Ring</p>
        
        {motionPermission === 'default' && typeof (DeviceMotionEvent as any).requestPermission === 'function' && (
          <button 
            onClick={requestMotionPermission}
            className="text-[9px] text-white/50 border border-white/20 px-3 py-1 rounded-full uppercase tracking-widest hover:bg-white/10"
          >
            Enable Shake Sensing
          </button>
        )}
      </div>
    </div>
  );
};

export default Bell;
