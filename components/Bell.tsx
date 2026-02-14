
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { BellType } from './BellSelector';
import Platform from '../utils/Platform';

interface BellProps {
  type: BellType;
  onRing: () => void;
}

const SOUND_URLS: Record<BellType, string> = {
  temple: "https://assets.mixkit.co/active_storage/sfx/2042/2042-preview.mp3",
  hand: "https://assets.mixkit.co/active_storage/sfx/2041/2041-preview.mp3",
  tibetan: "https://assets.mixkit.co/active_storage/sfx/2040/2040-preview.mp3",
  zen: "https://assets.mixkit.co/active_storage/sfx/2037/2037-preview.mp3" 
};

const Bell: React.FC<BellProps> = ({ type, onRing }) => {
  const [animationKey, setAnimationKey] = useState(0);
  const [motionPermission, setMotionPermission] = useState<'default' | 'granted' | 'denied'>('default');
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioBuffers = useRef<Map<BellType, AudioBuffer>>(new Map());
  const lastShakeTime = useRef<number>(0);

  useEffect(() => {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioCtx();
    audioContextRef.current = ctx;

    const loadSounds = async () => {
      const loadPromises = Object.entries(SOUND_URLS).map(async ([key, url]) => {
        try {
          const response = await fetch(url, { mode: 'cors' });
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          const arrayBuffer = await response.arrayBuffer();
          const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
          audioBuffers.current.set(key as BellType, audioBuffer);
        } catch (error) {
          console.error(`Failed to load sound: ${key}`, error);
        }
      });
      await Promise.all(loadPromises);
    };

    loadSounds();

    const handleMotion = (event: DeviceMotionEvent) => {
      const accel = event.accelerationIncludingGravity;
      if (!accel) return;
      const threshold = Platform.select({ ios: 15, android: 18, default: 18 }) || 18;
      const curTime = Date.now();
      if ((curTime - lastShakeTime.current) > 150) { 
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
  }, []);

  const requestMotionPermission = async () => {
    if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      try {
        const permissionState = await (DeviceMotionEvent as any).requestPermission();
        setMotionPermission(permissionState);
      } catch (e) {
        console.error("Error requesting motion permission:", e);
      }
    } else {
      setMotionPermission('granted');
    }
  };

  const handleRing = useCallback(() => {
    const ctx = audioContextRef.current;
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    setAnimationKey(prev => prev + 1);

    // Haptic Feedback tailored by platform
    if ('vibrate' in navigator) {
      const vibrationPattern = Platform.select({
        android: 20,
        ios: 10, // iOS web support is limited but standard is lighter
        default: 15
      });
      navigator.vibrate(vibrationPattern || 15);
    }

    const buffer = audioBuffers.current.get(type);
    if (buffer) {
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0.8 + Math.random() * 0.2, ctx.currentTime);
      source.playbackRate.setValueAtTime(0.98 + Math.random() * 0.04, ctx.currentTime);
      source.connect(gainNode);
      gainNode.connect(ctx.destination);
      source.start(0);
    }

    onRing();
  }, [onRing, type]);

  const renderBellIcon = () => {
    return (
      <svg viewBox="0 0 200 240" fill="none" className="w-full h-full bell-shadow text-[#0099db]">
        <path d="M92 20c0-10 16-10 16 0s-16 10-16 0z" stroke="currentColor" strokeWidth="4" />
        <rect x="97" y="0" width="6" height="40" rx="1" fill="currentColor" />
        <path d="M60 60h80l10 20H50l10-20z" fill="currentColor" />
        <path d="M50 80h100v10H50V80z" fill="currentColor" />
        <path d="M70 90c-15 0-30 20-35 50-5 30-5 60 5 70h120c10-10 10-40 5-70s-20-50-35-50H70z" fill="currentColor" />
        <path d="M45 140h110" stroke="white" strokeWidth="2" opacity="0.4" />
        <path d="M40 180h120" stroke="white" strokeWidth="3" opacity="0.6" />
        <path d="M35 210c0 5 130 5 130 0l5 15c0 10-140 10-140 0l5-15z" fill="currentColor" />
        <circle cx="100" cy="225" r="10" fill="currentColor" />
        <rect x="98" cy="200" width="4" height="25" fill="currentColor" />
      </svg>
    );
  };

  return (
    <div className="relative flex flex-col items-center justify-center">
      <button 
        onPointerDown={handleRing} 
        aria-label="Ring the bell"
        className="relative w-64 h-64 md:w-80 md:h-80 bg-white rounded-full flex items-center justify-center shadow-2xl transition-transform active:scale-95 focus:outline-none overflow-hidden touch-none"
      >
        <div 
          key={animationKey}
          className={`w-32 h-32 md:w-44 md:h-44 flex items-center justify-center ${animationKey > 0 ? 'animate-swing' : ''}`}
        >
          {renderBellIcon()}
        </div>
      </button>
      
      <div className="mt-8 flex flex-col items-center gap-4">
        <p className="text-white/80 uppercase tracking-[0.4em] text-xs font-bold">Tap or Shake to Ring</p>
        
        {motionPermission === 'default' && typeof (DeviceMotionEvent as any).requestPermission === 'function' && (
          <button 
            onClick={requestMotionPermission}
            className="text-[9px] text-white/50 border border-white/20 px-3 py-1 rounded-full uppercase tracking-widest hover:bg-white/10 active:bg-white/20 transition-colors"
          >
            Enable Shake Sensing
          </button>
        )}
      </div>
    </div>
  );
};

export default Bell;
