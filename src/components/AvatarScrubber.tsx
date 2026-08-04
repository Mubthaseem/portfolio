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

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !video.duration) return;

    const clampedProgress = Math.min(1, Math.max(0, scrollProgress));
    const target = clampedProgress * video.duration;
    targetTimeRef.current = target;

    // Instant update if fast scroll or initial mount
    if (Math.abs(video.currentTime - target) > 0.5) {
      video.currentTime = target;
    }
  }, [scrollProgress, isLoaded]);

  // Smooth 60 FPS GPU lerp seeking loop
  useEffect(() => {
    let active = true;

    const updateVideoSeek = () => {
      const video = videoRef.current;
      if (video && video.duration) {
        const diff = targetTimeRef.current - video.currentTime;
        if (Math.abs(diff) > 0.002) {
          video.currentTime += diff * 0.4; // Instant smooth seek interpolation
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
      className={`fixed top-0 left-0 w-full md:w-[48%] h-full pointer-events-none transition-opacity duration-300 ${className}`}
      style={{ opacity }}
    >
      <div className="w-full h-full relative flex items-center justify-center">
        <video
          ref={videoRef}
          src="/avatar.mp4"
          muted
          playsInline
          preload="auto"
          className="w-full h-full object-cover object-top mix-blend-screen"
          style={{
            WebkitMaskImage: 'radial-gradient(ellipse 90% 90% at 50% 50%, black 60%, transparent 100%)',
            maskImage: 'radial-gradient(ellipse 90% 90% at 50% 50%, black 60%, transparent 100%)'
          }}
        />
      </div>
    </div>
  );
}
