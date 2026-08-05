import { useEffect, useRef, useState } from 'react';

interface AvatarVideoScrubberProps {
  scrollProgress: number;
  opacity?: number;
  className?: string;
}

export default function AvatarVideoScrubber({ scrollProgress, opacity = 1, className = "" }: AvatarVideoScrubberProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const targetTimeRef = useRef(0);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  const DURATION = 10.0;

  // Detect iOS / Safari on mount to avoid loading WebM with unsupported alpha (which iOS renders as solid white)
  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    const isApple = /iphone|ipad|ipod|macintosh/.test(ua) && ('ontouchend' in document || navigator.maxTouchPoints > 0);
    const isSafari = ua.includes('safari') && !ua.includes('chrome') && !ua.includes('android');
    setIsIOS(isApple || isSafari);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    targetTimeRef.current = 0;

    const warmUpDecoder = async () => {
      try {
        video.muted = true;
        video.playsInline = true;
        await video.play();
        video.pause();
        setVideoLoaded(true);
      } catch (err) {
        console.warn("Video decoder warmup failed:", err);
        setVideoLoaded(true);
      }
    };

    const handleLoadedMetadata = () => {
      warmUpDecoder();
    };

    if (video.readyState >= 1) {
      warmUpDecoder();
    } else {
      video.addEventListener('loadedmetadata', handleLoadedMetadata);
    }

    let animationFrameId: number;
    const updateTime = () => {
      if (video && video.readyState >= 1) {
        const current = video.currentTime;
        const target = targetTimeRef.current;
        const diff = target - current;

        // Smoothly interpolate time with inertia
        if (Math.abs(diff) > 0.005) {
          video.currentTime = current + diff * 0.18;
        } else if (current !== target) {
          video.currentTime = target;
        }
      }
      animationFrameId = requestAnimationFrame(updateTime);
    };

    animationFrameId = requestAnimationFrame(updateTime);

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (video) {
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      }
    };
  }, [isIOS]); // Re-run when detection completes

  // Sync scrollProgress to target time
  useEffect(() => {
    const video = videoRef.current;
    const duration = video ? (video.duration || DURATION) : DURATION;
    targetTimeRef.current = Math.min(duration - 0.05, Math.max(0, scrollProgress * duration));
  }, [scrollProgress]);

  return (
    <div 
      className={`fixed top-0 left-0 w-full md:w-[48%] h-full pointer-events-none transition-opacity duration-500 ${className}`}
      style={{ opacity: videoLoaded ? opacity : 0 }}
    >
      <div 
        className="w-full h-full relative flex items-center justify-center"
        style={{
          WebkitMaskImage: 'radial-gradient(ellipse 90% 90% at 50% 50%, black 60%, transparent 100%)',
          maskImage: 'radial-gradient(ellipse 90% 90% at 50% 50%, black 60%, transparent 100%)'
        }}
      >
        <video
          ref={videoRef}
          key={isIOS ? "ios-video" : "webm-video"}
          muted
          playsInline
          preload="auto"
          className="w-full h-full object-cover object-top"
          style={{
            display: 'block',
            backgroundColor: 'transparent'
          }}
        >
          {isIOS ? (
            <source src="/avatar_clean.mp4" type="video/mp4" />
          ) : (
            <>
              <source src="/avatar.webm" type="video/webm" />
              <source src="/avatar_clean.mp4" type="video/mp4" />
            </>
          )}
        </video>
      </div>
    </div>
  );
}
