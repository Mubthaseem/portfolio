import AvatarGreenChromaScrubber from './AvatarGreenChromaScrubber';

interface AvatarUnifiedScrubberProps {
  scrollProgress: number;
  opacity?: number;
  className?: string;
}

export default function AvatarUnifiedScrubber({ scrollProgress, opacity = 1, className = "" }: AvatarUnifiedScrubberProps) {
  return (
    <AvatarGreenChromaScrubber
      scrollProgress={scrollProgress}
      opacity={opacity}
      className={className}
    />
  );
}
