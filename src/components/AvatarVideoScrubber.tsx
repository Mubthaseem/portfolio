import { useEffect, useRef, useState } from 'react';

interface AvatarVideoScrubberProps {
  scrollProgress: number;
  className?: string;
}

export default function AvatarVideoScrubber({ scrollProgress, className = "" }: AvatarVideoScrubberProps) {
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
    targetTimeRef.current = clampedProgress * video.duration;
  }, [scrollProgress, isLoaded]);

  // Smooth lerp loop for 60fps video seeking
  useEffect(() => {
    let active = true;

    const updateVideoSeek = () => {
      const video = videoRef.current;
      if (video && video.duration) {
        const diff = targetTimeRef.current - video.currentTime;
        if (Math.abs(diff) > 0.005) {
          video.currentTime += diff * 0.3; // Smooth lerp easing
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
    <video
      ref={videoRef}
      src="/avatar.mp4"
      muted
      playsInline
      preload="auto"
      className={`w-full h-full object-cover object-top ${className}`}
    />
  );
}
