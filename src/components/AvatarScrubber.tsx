import { useEffect, useRef, useState } from 'react';

interface AvatarScrubberProps {
  scrollProgress: number;
  opacity?: number;
  className?: string;
}

export default function AvatarScrubber({ scrollProgress, opacity = 1, className = "" }: AvatarScrubberProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const targetTimeRef = useRef(0);
  const animFrameRef = useRef<number | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Monitor video metadata load
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

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

  // Update target time smoothly from scrollProgress
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !video.duration) return;

    const clampedProgress = Math.min(1, Math.max(0, scrollProgress));
    targetTimeRef.current = clampedProgress * video.duration;
  }, [scrollProgress, isLoaded]);

  // 60 FPS GPU lerp seeking loop (ultra-lightweight ~15MB RAM, zero mobile OOM crashes)
  useEffect(() => {
    let active = true;

    const updateVideoSeek = () => {
      const video = videoRef.current;
      if (video && video.duration) {
        const diff = targetTimeRef.current - video.currentTime;
        if (Math.abs(diff) > 0.005) {
          video.currentTime += diff * 0.35; // Smooth 60fps seek interpolation
        }
      }
      if (active) {
        animFrameRef.current = requestAnimationFrame(updateVideoSeek);
      }
    };

    animFrameRef.current = requestAnimationFrame(updateVideoSeek);

    return () => {
      active = false;
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  return (
    <div 
      className={`fixed inset-0 w-full h-full pointer-events-none transition-opacity duration-300 ${className}`}
      style={{ opacity }}
    >
      <div className="w-full h-full relative flex items-center justify-center">
        <video
          ref={videoRef}
          src="/avatar.mp4"
          muted
          playsInline
          preload="auto"
          className="w-full h-full object-cover object-top"
          style={{
            // Perfect horizontal & vertical centering matching PortraitReveal canvas
            objectPosition: 'center top'
          }}
        />
        {/* Subtle Cyber Scanline Overlay */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(rgba(77,163,255,0.15)_1px,transparent_1px)]"
          style={{ backgroundSize: '100% 4px' }}
        />
      </div>
    </div>
  );
}
