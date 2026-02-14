
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { BellType } from './BellSelector';

interface BellProps {
  type: BellType;
  onRing: () => void;
}

const SOUND_URLS: Record<BellType, string> = {
  // Using Mixkit URLs which generally have permissive CORS headers for fetch/Web Audio API
  temple: "https://assets.mixkit.co/active_storage/sfx/2042/2042-preview.mp3",
  hand: "https://assets.mixkit.co/active_storage/sfx/2041/2041-preview.mp3",
  tibetan: "https://assets.mixkit.co/active_storage/sfx/2040/2040-preview.mp3",
  church: "https://assets.mixkit.co/active_storage/sfx/2039/2039-preview.mp3"
};

const Bell: React.FC<BellProps> = ({ type, onRing }) => {
  const [animationKey, setAnimationKey] = useState(0);
  const [motionPermission, setMotionPermission] = useState<'default' | 'granted' | 'denied'>('default');
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioBuffers = useRef<Map<BellType, AudioBuffer>>(new Map());
  const lastShakeTime = useRef<number>(0);

  // Initialize Web Audio Context and pre-load buffers
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
      const threshold = 18;
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

    // Resume context if suspended (browser security)
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    // Immediate Animation Trigger
    setAnimationKey(prev => prev + 1);

    // Haptic Feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(15);
    }

    // Web Audio Playback (Ultra Low Latency)
    const buffer = audioBuffers.current.get(type);
    if (buffer) {
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      
      const gainNode = ctx.createGain();
      // Slight variation in volume and pitch for a more natural feel during rapid fire
      gainNode.gain.setValueAtTime(0.8 + Math.random() * 0.2, ctx.currentTime);
      source.playbackRate.setValueAtTime(0.98 + Math.random() * 0.04, ctx.currentTime);
      
      source.connect(gainNode);
      gainNode.connect(ctx.destination);
      source.start(0);
    }

    // Notify parent (increment counter)
    onRing();
  }, [onRing, type]);

  const renderBellIcon = () => {
    return (
      <svg viewBox="0 0 200 240" fill="none" className="w-full h-full bell-shadow text-[#0099db]">
        <rect x="97" y="0" width="6" height="15" rx="1" fill="currentColor" />
        <rect x="97" y="18" width="6" height="15" rx="1" fill="currentColor" />
        <rect x="97" y="36" width="6" height="15" rx="1" fill="currentColor" />
        <path d="M88 56c0-10 24-10 24 0v6h-24v-6z" fill="currentColor" />
        <path d="M91 56c0-6 18-6 18 0v6h-18v-6z" fill="white" />
        <path d="M82 62h36l4 10h-44l4-10z" fill="currentColor" />
        <path d="M80 72h40v6H80v-6z" fill="currentColor" />
        <path d="M72 78c5-4 51-4 56 0 12 4 18 18 18 28l28 85c2 10-6 20-16 20H42c-10 0-18-10-16-20l28-85c0-10 6-24 18-28z" fill="currentColor" />
        <path d="M66 108h68" stroke="white" strokeWidth="4" strokeLinecap="round" />
        <path d="M62 125h76" stroke="white" strokeWidth="4" strokeLinecap="round" />
        <rect x="92" y="211" width="16" height="28" rx="8" fill="currentColor" />
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
