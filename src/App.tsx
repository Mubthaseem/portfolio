import { useState, useRef, useCallback, useEffect } from 'react';
import BackgroundCanvas, { type BackgroundCanvasRef } from './components/BackgroundCanvas';
import DecryptionEngine from './components/DecryptionEngine';
import ComingSoon from './components/ComingSoon';
import AvatarVideo from './components/AvatarVideo';
import { Film, Layout } from 'lucide-react';

export default function App() {
  const [phase, setPhase] = useState<'booting' | 'coming-soon'>('booting');
  const [viewMode, setViewMode] = useState<'portfolio' | 'video'>('portfolio');
  const canvasRef = useRef<BackgroundCanvasRef>(null);

  useEffect(() => {
    // Check URL query or hash for video standalone mode
    if (window.location.hash.includes('video') || window.location.search.includes('video')) {
      setViewMode('video');
    }

    const handleHashChange = () => {
      if (window.location.hash.includes('video')) {
        setViewMode('video');
      } else {
        setViewMode('portfolio');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleLetterLock = useCallback((x: number, y: number) => {
    canvasRef.current?.triggerBurst(x, y);
  }, []);

  const handleSequenceComplete = useCallback(() => {
    setPhase('coming-soon');
  }, []);

  const toggleViewMode = () => {
    const newMode = viewMode === 'portfolio' ? 'video' : 'portfolio';
    setViewMode(newMode);
    window.location.hash = newMode === 'video' ? 'video' : 'home';
  };

  return (
    <div className="w-screen h-screen relative bg-black overflow-hidden select-none">
      
      {/* View Mode Toggle Switch (Top Right HUD) */}
      <div className="fixed top-4 right-4 z-50 pointer-events-auto">
        <button
          onClick={toggleViewMode}
          className="px-3.5 py-2 bg-black/80 hover:bg-black backdrop-blur-xl border border-primary/40 hover:border-primary text-primary font-mono text-[10px] sm:text-xs font-bold tracking-widest uppercase rounded-full shadow-[0_0_20px_rgba(77,163,255,0.3)] flex items-center gap-2 transition-all duration-300"
        >
          {viewMode === 'portfolio' ? (
            <>
              <Film size={14} className="animate-pulse" />
              <span>[ VIEW VIDEO COMPONENT ONLY ]</span>
            </>
          ) : (
            <>
              <Layout size={14} />
              <span>[ BACK TO FULL PORTFOLIO ]</span>
            </>
          )}
        </button>
      </div>

      {/* Standalone Video Mode */}
      {viewMode === 'video' ? (
        <div className="w-full h-full flex items-center justify-center p-4 sm:p-8 bg-black z-40 relative">
          <AvatarVideo autoPlay={true} />
        </div>
      ) : (
        <>
          {/* 1. Procedural Background Canvas */}
          <BackgroundCanvas ref={canvasRef} />

          {/* 2. Decryption Engine Layer */}
          {phase === 'booting' && (
            <DecryptionEngine 
              onLetterLock={handleLetterLock}
              onSequenceComplete={handleSequenceComplete}
            />
          )}

          {/* 3. Coming Soon Page Layer */}
          <ComingSoon isVisible={phase === 'coming-soon'} />
        </>
      )}

      {/* 4. Subtle CRT screen scanlines */}
      <div className="scanlines"></div>
    </div>
  );
}
