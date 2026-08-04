import { useEffect, useRef, useState } from 'react';

interface AvatarSequenceScrubberProps {
  scrollProgress: number;
  opacity?: number;
  className?: string;
}

const TOTAL_FRAMES = 300;

export default function AvatarSequenceScrubber({ scrollProgress, opacity = 1, className = "" }: AvatarSequenceScrubberProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [loadedCount, setLoadedCount] = useState(0);

  // Pre-load all 300 WebP frames into memory as HTMLImageElement objects
  useEffect(() => {
    let active = true;
    const loadedImages: HTMLImageElement[] = [];
    let count = 0;

    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image();
      const numStr = String(i).padStart(3, '0');
      img.src = `/frames/frame_${numStr}.webp`;
      img.onload = () => {
        if (!active) return;
        count++;
        if (count % 30 === 0 || count === TOTAL_FRAMES) {
          setLoadedCount(count);
        }
      };
      loadedImages.push(img);
    }
    imagesRef.current = loadedImages;

    return () => {
      active = false;
    };
  }, []);

  // Update active frame index based on scrollProgress
  useEffect(() => {
    const clampedProgress = Math.min(1, Math.max(0, scrollProgress));
    const frameIdx = Math.min(TOTAL_FRAMES - 1, Math.floor(clampedProgress * TOTAL_FRAMES));
    setCurrentFrameIndex(frameIdx);
  }, [scrollProgress]);

  // Render loop — draws pre-loaded frame onto full-screen canvas with 100% alpha transparency
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = window.innerWidth;
    const h = window.innerHeight;

    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }

    ctx.clearRect(0, 0, w, h);

    const img = imagesRef.current[currentFrameIndex];
    if (!img) return;

    // Position math matching site layout
    const isMobile = w < 768;
    const baseAspect = (img.naturalWidth || 960) / (img.naturalHeight || 720);

    let drawH = isMobile ? h * 0.85 : h;
    let drawW = drawH * baseAspect;
    let drawX = isMobile ? (w - drawW) / 2 : (w * 0.48 - drawW) / 2;
    if (!isMobile && drawX < 0) drawX = 0;
    let drawY = isMobile ? h - drawH : (h - drawH) / 2;

    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.drawImage(img, drawX, drawY, drawW, drawH);
    ctx.restore();

  }, [currentFrameIndex, opacity, loadedCount]);

  return (
    <div className={`fixed inset-0 w-full h-full pointer-events-none ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
      />
    </div>
  );
}
