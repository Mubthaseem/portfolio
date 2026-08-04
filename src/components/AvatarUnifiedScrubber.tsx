import AvatarScrubber from './AvatarScrubber';

interface AvatarUnifiedScrubberProps {
  scrollProgress: number;
  opacity?: number;
  className?: string;
}

export default function AvatarUnifiedScrubber({ scrollProgress, opacity = 1, className = "" }: AvatarUnifiedScrubberProps) {
  return (
    <AvatarScrubber
      scrollProgress={scrollProgress}
      opacity={opacity}
      className={className}
    />
  );
}
