import AvatarScrollyVideoScrubber from './AvatarScrollyVideoScrubber';

interface AvatarUnifiedScrubberProps {
  scrollProgress: number;
  opacity?: number;
  className?: string;
}

export default function AvatarUnifiedScrubber({ scrollProgress, opacity = 1, className = "" }: AvatarUnifiedScrubberProps) {
  return (
    <AvatarScrollyVideoScrubber
      scrollProgress={scrollProgress}
      opacity={opacity}
      className={className}
    />
  );
}
