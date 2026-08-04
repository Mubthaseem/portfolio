import { useEffect, useRef, useState } from 'react';

interface AvatarSequenceScrubberProps {
  scrollProgress: number;
  opacity?: number;
  className?: string;
}

const TOTAL_FRAMES = 300;

export default function AvatarSequenceScrubber({ scrollProgress, opacity = 1, className = "" }: AvatarSequenceScrubberProps) {
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const imagesRef = useRef<HTMLImageElement[]>([]);

  // Pre-load frame images in background so frame swapping is instant
  useEffect(() => {
    const loadedImages: HTMLImageElement[] = [];

    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image();
      const numStr = String(i).padStart(3, '0');
      img.src = `/frames/frame_${numStr}.webp`;
      loadedImages.push(img);
    }
    imagesRef.current = loadedImages;
  }, []);

  // Update active frame index based on scrollProgress
  useEffect(() => {
    const clampedProgress = Math.min(1, Math.max(0, scrollProgress));
    const frameIdx = Math.min(TOTAL_FRAMES - 1, Math.floor(clampedProgress * TOTAL_FRAMES));
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
            // 100% True Alpha Transparency — space background shines right through with zero black background!
            display: 'block'
          }}
        />
      </div>
    </div>
  );
}
