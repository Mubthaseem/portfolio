import { useState, useRef, useCallback } from 'react';
import BackgroundCanvas, { type BackgroundCanvasRef } from './components/BackgroundCanvas';
import DecryptionEngine from './components/DecryptionEngine';
import ComingSoon from './components/ComingSoon';

export default function App() {
  const [phase, setPhase] = useState<'booting' | 'coming-soon'>('booting');
  const canvasRef = useRef<BackgroundCanvasRef>(null);

  const handleLetterLock = useCallback((x: number, y: number) => {
    canvasRef.current?.triggerBurst(x, y);
  }, []);

  const handleSequenceComplete = useCallback(() => {
    setPhase('coming-soon');
  }, []);

  return (
    <div className="w-screen h-screen relative bg-black overflow-hidden select-none">
      
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

      {/* 4. Subtle CRT screen scanlines */}
      <div className="scanlines"></div>
    </div>
  );
}
