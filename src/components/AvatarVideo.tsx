import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Sparkles } from 'lucide-react';

interface AvatarVideoProps {
  scrollProgress?: number;
  autoPlay?: boolean;
}

export default function AvatarVideo({ scrollProgress = 0, autoPlay = true }: AvatarVideoProps) {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [progress, setProgress] = useState(scrollProgress);

  useEffect(() => {
    setProgress(scrollProgress);
  }, [scrollProgress]);

  const togglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  const resetAnimation = () => {
    setProgress(0);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-black/80 backdrop-blur-xl border border-primary/40 rounded-2xl flex flex-col gap-5 shadow-[0_0_40px_rgba(77,163,255,0.3)] font-mono text-xs select-none">
      
      {/* Header telemetry ribbon */}
      <div className="flex justify-between items-center border-b border-white/10 pb-3">
        <div className="flex items-center gap-2 text-primary font-bold tracking-[0.2em] uppercase">
          <Sparkles size={16} className="animate-spin" />
          <span>[ 1080P AVATAR TRANSFORMATION COMPONENT ]</span>
        </div>
        <span className="text-highlight font-bold">{Math.round(progress * 100)}% TRANSFORMATION</span>
      </div>

      {/* 1080p Avatar Transformation Display */}
      <div className="relative w-full aspect-video bg-black/90 rounded-xl overflow-hidden border border-white/10 flex items-center justify-center group">
        <img 
          src="/avatar.gif" 
          alt="1080p Avatar Transformation" 
          className="w-full h-full object-cover"
        />

        {/* Cyber overlay HUD grid */}
        <div className="absolute inset-0 border border-primary/20 pointer-events-none flex flex-col justify-between p-4">
          <div className="flex justify-between items-center text-[9px] text-primary">
            <span>RES: 1920x1080 HD</span>
            <span>FPS: 60 FPS CHROMATIC</span>
          </div>

          <div className="flex justify-between items-center text-[9px] text-secondary">
            <span>[ SYSTEM ONLINE ]</span>
            <span>SEQUENCE: 10 SECONDS</span>
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex items-center justify-between gap-4 pt-2">
        <div className="flex items-center gap-3">
          <button 
            onClick={togglePlay}
            className="px-4 py-2 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/40 rounded-md font-bold tracking-wider flex items-center gap-2 transition-colors"
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
          </button>

          <button 
            onClick={resetAnimation}
            className="p-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-md transition-colors"
          >
            <RotateCcw size={14} />
          </button>
        </div>

        {/* Scrub bar */}
        <div className="flex-1 flex items-center gap-3 pl-4">
          <span className="text-[10px] text-secondary">PROGRESS</span>
          <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden relative cursor-pointer">
            <div 
              className="h-full bg-primary shadow-[0_0_8px_#4DA3FF] transition-all duration-300"
              style={{ width: `${Math.round(progress * 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

    </div>
  );
}
