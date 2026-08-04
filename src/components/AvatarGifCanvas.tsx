import { useEffect, useRef, useState } from 'react';
import { parseGIF, decompressFrames } from 'gifuct-js';

interface AvatarGifCanvasProps {
  scrollProgress: number;
  className?: string;
}

export default function AvatarGifCanvas({ scrollProgress, className = "" }: AvatarGifCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const framesRef = useRef<HTMLCanvasElement[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;

    fetch('/avatar.gif')
      .then((res) => res.arrayBuffer())
      .then((buffer) => {
        const gif = parseGIF(buffer);
        const rawFrames = decompressFrames(gif, true);

        if (!rawFrames || rawFrames.length === 0) return;

        const width = gif.lsd.width;
        const height = gif.lsd.height;

        // Composite frames onto offscreen canvases
        const frameCanvases: HTMLCanvasElement[] = [];
        
        // Canvas to hold cumulative frame state
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = width;
        tempCanvas.height = height;
        const tempCtx = tempCanvas.getContext('2d')!;

        rawFrames.forEach((frame) => {
          const dims = frame.dims;
          if (dims) {
            const framePatch = new ImageData(
              new Uint8ClampedArray(frame.patch),
              dims.width,
              dims.height
            );

            // Create temporary canvas for patch
            const patchCanvas = document.createElement('canvas');
            patchCanvas.width = dims.width;
            patchCanvas.height = dims.height;
            const patchCtx = patchCanvas.getContext('2d')!;
            patchCtx.putImageData(framePatch, 0, 0);

            // Handle disposal if required, otherwise draw patch
            if (frame.disposalType === 2) {
              tempCtx.clearRect(dims.left, dims.top, dims.width, dims.height);
            }
            tempCtx.drawImage(patchCanvas, dims.left, dims.top);
          }

          // Save copy of current composite frame
          const frameCanvas = document.createElement('canvas');
          frameCanvas.width = width;
          frameCanvas.height = height;
          const frameCtx = frameCanvas.getContext('2d')!;
          frameCtx.drawImage(tempCanvas, 0, 0);
          frameCanvases.push(frameCanvas);
        });

        if (active) {
          framesRef.current = frameCanvases;
          setLoaded(true);
        }
      })
      .catch((err) => console.error("Error decoding GIF frames:", err));

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const frames = framesRef.current;
    if (frames.length === 0) return;

    const totalFrames = frames.length;
    // Map scrollProgress (0 to 1) to frame index
    const clampedProgress = Math.min(1, Math.max(0, scrollProgress));
    const frameIndex = Math.min(totalFrames - 1, Math.floor(clampedProgress * totalFrames));

    const currentFrameCanvas = frames[frameIndex];
    if (currentFrameCanvas) {
      if (canvas.width !== currentFrameCanvas.width || canvas.height !== currentFrameCanvas.height) {
        canvas.width = currentFrameCanvas.width;
        canvas.height = currentFrameCanvas.height;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(currentFrameCanvas, 0, 0);
    }
  }, [scrollProgress, loaded]);

  return (
    <div className={`relative ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full object-cover object-top"
      />
      {!loaded && (
        <img
          src="/avatar.gif"
          alt="Avatar Transformation"
          className="w-full h-full object-cover object-top absolute inset-0"
        />
      )}
    </div>
  );
}
