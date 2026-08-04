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
  const lastSeekTimeRef = useRef(0);
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
    targetTimeRef.current = clampedProgress * video.duration;
  }, [scrollProgress, isLoaded]);

  // SAFARI & MOBILE MEDIA ENGINE HOT FIX:
  // Check !video.seeking and throttle seeks to prevent AVPlayer queue overflow crash on mobile iOS/Chrome
  useEffect(() => {
    let active = true;

    const updateVideoSeek = () => {
      const video = videoRef.current;
      const now = Date.now();

      // Ensure video is valid, metadata loaded, NOT currently seeking, and throttled to max ~20 seeks/sec
      if (
        video && 
        video.duration && 
        !video.seeking && 
        now - lastSeekTimeRef.current > 40
      ) {
        const diff = targetTimeRef.current - video.currentTime;
        if (Math.abs(diff) > 0.04) {
          try {
            video.currentTime += diff * 0.25;
            lastSeekTimeRef.current = now;
          } catch (e) {
            // Ignore temporary media seeking exceptions
          }
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
      className={`fixed top-0 left-0 w-full md:w-[45%] h-full pointer-events-none transition-opacity duration-300 ${className}`}
      style={{ opacity }}
    >
      <div className="w-full h-full relative flex items-center justify-center">
        <video
          ref={videoRef}
          src="/avatar.mp4"
          muted
          playsInline
          preload="auto"
          className="w-full h-full object-cover object-top mix-blend-screen pointer-events-none"
        />
        {/* Subtle Cyber Scanlines Overlay */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-15 bg-[linear-gradient(rgba(77,163,255,0.15)_1px,transparent_1px)]"
          style={{ backgroundSize: '100% 4px' }}
        />
      </div>
    </div>
  );
}
