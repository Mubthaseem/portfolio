// @ts-ignore
import ScrollyVideo from 'scrolly-video/dist/ScrollyVideo.esm.jsx';

interface AvatarScrollyVideoScrubberProps {
  scrollProgress: number;
  opacity?: number;
  className?: string;
}

export default function AvatarScrollyVideoScrubber({ scrollProgress, opacity = 1, className = "" }: AvatarScrollyVideoScrubberProps) {
  return (
    <div 
      className={`fixed top-0 left-0 w-full md:w-[48%] h-full pointer-events-none transition-opacity duration-300 ${className}`}
      style={{ opacity }}
    >
      <div 
        className="w-full h-full relative flex items-center justify-center mix-blend-screen"
        style={{
          WebkitMaskImage: 'radial-gradient(ellipse 90% 90% at 50% 50%, black 60%, transparent 100%)',
          maskImage: 'radial-gradient(ellipse 90% 90% at 50% 50%, black 60%, transparent 100%)'
        }}
      >
        <ScrollyVideo
          src="/avatar.mp4"
          trackScroll={false}
          videoPercentage={scrollProgress}
          useWebCodecs={true}
          cover={true}
          full={true}
        />
      </div>
    </div>
  );
}
