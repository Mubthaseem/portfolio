import AvatarVideoScrubber from './AvatarVideoScrubber';

interface AvatarUnifiedScrubberProps {
  scrollProgress: number;
  opacity?: number;
  className?: string;
}

export default function AvatarUnifiedScrubber({ scrollProgress, opacity = 1, className = "" }: AvatarUnifiedScrubberProps) {
  return (
    <AvatarVideoScrubber
      scrollProgress={scrollProgress}
      opacity={opacity}
      className={className}
    />
  );
}
