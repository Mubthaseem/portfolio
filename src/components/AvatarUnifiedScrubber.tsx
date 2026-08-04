import AvatarGifCanvas from './AvatarGifCanvas';

interface AvatarUnifiedScrubberProps {
  scrollProgress: number;
  opacity?: number;
  className?: string;
}

export default function AvatarUnifiedScrubber({ scrollProgress, opacity = 1, className = "" }: AvatarUnifiedScrubberProps) {
  return (
    <AvatarGifCanvas
      scrollProgress={scrollProgress}
      opacity={opacity}
      className={className}
    />
  );
}
