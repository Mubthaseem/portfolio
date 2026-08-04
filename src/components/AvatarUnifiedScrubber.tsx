import AvatarSequenceScrubber from './AvatarSequenceScrubber';

interface AvatarUnifiedScrubberProps {
  scrollProgress: number;
  opacity?: number;
  className?: string;
}

export default function AvatarUnifiedScrubber({ scrollProgress, opacity = 1, className = "" }: AvatarUnifiedScrubberProps) {
  return (
    <AvatarSequenceScrubber
      scrollProgress={scrollProgress}
      opacity={opacity}
      className={className}
    />
  );
}
