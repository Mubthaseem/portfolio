import { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';

interface DecryptionEngineProps {
  onLetterLock: (x: number, y: number) => void;
  onSequenceComplete: () => void;
}

const TARGET_WORD = "MUBTHASEEM";
const CHARS_POOL = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#@%&+*/?<>";

interface LetterState {
  char: string;
  isLocked: boolean;
  flash: boolean;
  scan: boolean;
}

export default function DecryptionEngine({ onLetterLock, onSequenceComplete }: DecryptionEngineProps) {
  const [letters, setLetters] = useState<LetterState[]>(
    Array.from({ length: TARGET_WORD.length }, () => ({
      char: '',
      isLocked: false,
      flash: false,
      scan: false,
    }))
  );

  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const wordRef = useRef<HTMLDivElement>(null);
  const letterRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const scanBeamRef = useRef<HTMLDivElement>(null);
  
  // Keep mutable reference of letters for the animation frame loop
  const lettersStateRef = useRef<LetterState[]>([]);
  lettersStateRef.current = letters;

  // 1. Scramble Loop
  useEffect(() => {
    let animFrameId: number;

    const updateScramble = () => {
      if (isVisible) {
        setLetters((prev) =>
          prev.map((item) => {
            if (item.isLocked) return item;
            
            // Random character from pool
            const randomChar = CHARS_POOL[Math.floor(Math.random() * CHARS_POOL.length)];
            return { ...item, char: randomChar };
          })
        );
      }
      animFrameId = requestAnimationFrame(updateScramble);
    };

    updateScramble();

    return () => cancelAnimationFrame(animFrameId);
  }, [isVisible]);

  // 2. Sequential locking using GSAP timeline matching requested timing
  useEffect(() => {
    const tl = gsap.timeline();

    // 0.00s — Screen black (hidden)
    
    // 0.30s — Random characters appear
    tl.to({}, {
      duration: 0.3,
      onComplete: () => {
        setIsVisible(true);
        // Fade in container
        gsap.to(containerRef.current, { opacity: 1, duration: 0.2 });
      }
    });

    // Sequential locks (letters lock 60% faster, every 0.16 seconds)
    // 0.50s: 'M' locks (index 0)
    TARGET_WORD.split('').forEach((char, idx) => {
      const lockTime = 0.5 + idx * 0.16;
      
      tl.to({}, {
        duration: 0.05, // spacer
        onComplete: () => {
          lockLetter(idx, char);
        }
      }, lockTime);
    });

    // 2.10s - all letters are locked, start full swipe scanline beam
    tl.to({}, {
      onComplete: () => {
        // Trigger left-to-right scan beam
        if (scanBeamRef.current) {
          gsap.fromTo(scanBeamRef.current, 
            { left: '0%', opacity: 0.85 },
            { left: '100%', opacity: 0, duration: 0.4, ease: 'power2.inOut' }
          );
        }
      }
    }, 2.1);

    // Drifting particles from letters
    let particleDriftInterval: number;
    tl.to({}, {
      onComplete: () => {
        particleDriftInterval = window.setInterval(() => {
          const randIdx = Math.floor(Math.random() * TARGET_WORD.length);
          const el = letterRefs.current[randIdx];
          if (el) {
            const rect = el.getBoundingClientRect();
            const x = rect.left + rect.width / 2 + (Math.random() - 0.5) * 20;
            const y = rect.top + rect.height / 2 + (Math.random() - 0.5) * 15;
            onLetterLock(x, y);
          }
        }, 50);
      }
    }, 2.15);

    // 2.50s — Text gently fades out into Coming Soon page (approx 0.4s duration)
    tl.to({}, {
      onComplete: () => {
        clearInterval(particleDriftInterval);
        gsap.to(wordRef.current, {
          opacity: 0,
          filter: 'blur(12px)',
          duration: 0.4,
          ease: 'power2.inOut',
          onComplete: onSequenceComplete
        });
      }
    }, 2.5);

    return () => {
      tl.kill();
      clearInterval(particleDriftInterval);
    };
  }, [onSequenceComplete]);

  // Lock a letter and trigger effects
  const lockLetter = (idx: number, finalChar: string) => {
    setLetters((prev) =>
      prev.map((item, i) => {
        if (i === idx) {
          return {
            ...item,
            char: finalChar,
            isLocked: true,
            flash: true,
            scan: true,
          };
        }
        return item;
      })
    );

    // Trigger canvas particle burst at coordinates after state update
    setTimeout(() => {
      const el = letterRefs.current[idx];
      if (el) {
        const rect = el.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        onLetterLock(x, y);
      }
    }, 10);

    // Turn off individual letter animations after they finish playing
    setTimeout(() => {
      setLetters((prev) =>
        prev.map((item, i) => {
          if (i === idx) {
            return { ...item, flash: false, scan: false };
          }
          return item;
        })
      );
    }, 400);
  };

  return (
    <div
      ref={containerRef}
      className="decryption-container"
      style={{ opacity: 0 }}
    >
      <div ref={wordRef} className="decryption-word">
        {letters.map((letter, idx) => (
          <span
            key={idx}
            ref={(el) => { letterRefs.current[idx] = el; }}
            className={`decryption-letter ${letter.isLocked ? 'locked' : 'scrambling'}`}
          >
            {letter.char || '_'}
            
            {/* Lock Flash Layer */}
            <span className={`letter-flash ${letter.flash ? 'letter-flash-active' : ''}`} />
            
            {/* Lock Scanline Layer */}
            <span className={`letter-scan-line ${letter.scan ? 'letter-scan-active' : ''}`} />
          </span>
        ))}

        {/* Scan Beam sweeping left-to-right across the entire word */}
        <div ref={scanBeamRef} className="scan-beam" />
      </div>
    </div>
  );
}
