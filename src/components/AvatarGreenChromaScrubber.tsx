import { useEffect, useRef, useState } from 'react';

interface AvatarGreenChromaScrubberProps {
  scrollProgress: number;
  opacity?: number;
  className?: string;
}

export default function AvatarGreenChromaScrubber({ scrollProgress, opacity = 1, className = "" }: AvatarGreenChromaScrubberProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const targetTimeRef = useRef(0);
  const animFrameRef = useRef<number | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Hidden offscreen canvas for green screen pixel keying
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    offscreenCanvasRef.current = document.createElement('canvas');

    const handleLoadedMetadata = () => {
      setIsLoaded(true);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    if (video.readyState >= 1) {
      setIsLoaded(true);
    }

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, []);

  // Update target seek time from scrollProgress
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !video.duration) return;

    const clampedProgress = Math.min(1, Math.max(0, scrollProgress));
    targetTimeRef.current = clampedProgress * video.duration;
  }, [scrollProgress, isLoaded]);

  // Main 60 FPS Chroma-Key Render Loop
  useEffect(() => {
    let active = true;

    const renderChromaFrame = () => {
      const video = videoRef.current;
      const displayCanvas = canvasRef.current;
      const offCanvas = offscreenCanvasRef.current;

      if (video && displayCanvas && offCanvas && video.duration) {
        // Smooth lerp seek interpolation
        const diff = targetTimeRef.current - video.currentTime;
        if (Math.abs(diff) > 0.002) {
          video.currentTime += diff * 0.45;
        }

        const w = window.innerWidth;
        const h = window.innerHeight;

        if (displayCanvas.width !== w || displayCanvas.height !== h) {
          displayCanvas.width = w;
          displayCanvas.height = h;
        }

        const displayCtx = displayCanvas.getContext('2d', { willReadFrequently: true });
        if (displayCtx) {
          displayCtx.clearRect(0, 0, w, h);

          const vw = video.videoWidth || 1080;
          const vh = video.videoHeight || 1920;

          if (offCanvas.width !== vw || offCanvas.height !== vh) {
            offCanvas.width = vw;
            offCanvas.height = vh;
          }

          const offCtx = offCanvas.getContext('2d', { willReadFrequently: true });
          if (offCtx) {
            // Draw video frame to offscreen canvas
            offCtx.drawImage(video, 0, 0, vw, vh);

            // Fetch pixel data for green screen keying
            const frameImageData = offCtx.getImageData(0, 0, vw, vh);
            const data = frameImageData.data;
            const len = data.length;

            // Green Screen Chroma Keying Algorithm
            for (let i = 0; i < len; i += 4) {
              const r = data[i];
              const g = data[i + 1];
              const b = data[i + 2];

              // Key out green background pixels
              if (g > 80 && g > r * 1.2 && g > b * 1.2) {
                // Smooth alpha spill suppression / anti-aliased edge keying
                const maxRB = Math.max(r, b);
                const greenDiff = g - maxRB;
                if (greenDiff > 35) {
                  data[i + 3] = 0; // 100% Transparent
                } else {
                  // Semi-transparent edge feathering
                  const alpha = Math.max(0, Math.min(255, 255 - (greenDiff / 35) * 255));
                  data[i + 3] = alpha;
                }
              }
            }

            // Put keyed frame back into offscreen canvas
            offCtx.putImageData(frameImageData, 0, 0);

            // Layout math matching site design
            const isMobile = w < 768;
            const baseAspect = vw / vh;

            let drawH = isMobile ? h * 0.85 : h;
            let drawW = drawH * baseAspect;
            let drawX = isMobile ? (w - drawW) / 2 : (w * 0.48 - drawW) / 2;
            if (!isMobile && drawX < 0) drawX = 0;
            let drawY = isMobile ? h - drawH : (h - drawH) / 2;

            displayCtx.save();
            displayCtx.globalAlpha = opacity;
            displayCtx.drawImage(offCanvas, drawX, drawY, drawW, drawH);
            displayCtx.restore();
          }
        }
      }

      if (active) {
        animFrameRef.current = requestAnimationFrame(renderChromaFrame);
      }
    };

    animFrameRef.current = requestAnimationFrame(renderChromaFrame);

    return () => {
      active = false;
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [opacity]);

  return (
    <div className={`fixed inset-0 w-full h-full pointer-events-none ${className}`}>
      {/* Hidden offscreen HTML5 video element */}
      <video
        ref={videoRef}
        src="/avatar_green.mp4"
        muted
        playsInline
        preload="auto"
        className="hidden"
      />

      {/* Real-time Chroma-Keyed Display Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
      />
    </div>
  );
}
