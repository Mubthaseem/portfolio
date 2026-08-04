import { useEffect, useState } from 'react';

interface AvatarSequenceScrubberProps {
  scrollProgress: number;
  opacity?: number;
  className?: string;
}

const TOTAL_FRAMES = 240;

export default function AvatarSequenceScrubber({ scrollProgress, opacity = 1, className = "" }: AvatarSequenceScrubberProps) {
  const [currentFrameIndex, setCurrentFrameIndex] = useState(1);

  // Pre-load all 240 green-screen-removed WebP frames into browser cache
  useEffect(() => {
    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      const numStr = String(i).padStart(3, '0');
      img.src = `/frames/frame_${numStr}.webp`;
    }
  }, []);

  // Map scrollProgress (0.0 to 1.0) directly to frame 1 -> 240
  useEffect(() => {
    const clampedProgress = Math.min(1, Math.max(0, scrollProgress));
    const frameIdx = Math.max(1, Math.min(TOTAL_FRAMES, Math.floor(clampedProgress * TOTAL_FRAMES) + 1));
    setCurrentFrameIndex(frameIdx);
  }, [scrollProgress]);

  const frameStr = String(currentFrameIndex).padStart(3, '0');
  const frameSrc = `/frames/frame_${frameStr}.webp`;

  return (
    <div 
      className={`fixed top-0 left-0 w-full md:w-[48%] h-full pointer-events-none transition-opacity duration-300 ${className}`}
      style={{ opacity }}
    >
      <div className="w-full h-full relative flex items-center justify-center">
        <img
          src={frameSrc}
          alt="Mubthaseem Animated Avatar"
          className="w-full h-full object-cover object-top"
          style={{
            display: 'block'
          }}
        />
      </div>
    </div>
  );
}
