import { useEffect, useRef, useState } from 'react';
import { parseGIF, decompressFrames } from 'gifuct-js';

interface AvatarGifCanvasProps {
  scrollProgress: number;
  opacity?: number;
  className?: string;
}

export default function AvatarGifCanvas({ scrollProgress, opacity = 1, className = "" }: AvatarGifCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const framesRef = useRef<HTMLCanvasElement[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Load and decode GIF into pre-rendered offscreen frame canvases
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

        const frameCanvases: HTMLCanvasElement[] = [];
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

            const patchCanvas = document.createElement('canvas');
            patchCanvas.width = dims.width;
            patchCanvas.height = dims.height;
            const patchCtx = patchCanvas.getContext('2d')!;
            patchCtx.putImageData(framePatch, 0, 0);

            if (frame.disposalType === 2) {
              tempCtx.clearRect(dims.left, dims.top, dims.width, dims.height);
            }
            tempCtx.drawImage(patchCanvas, dims.left, dims.top);
          }

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

  // Main canvas render loop — perfectly aligned with PortraitReveal canvas math + cyber flicker
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set full screen resolution
    const w = window.innerWidth;
    const h = window.innerHeight;

    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }

    ctx.clearRect(0, 0, w, h);

    const frames = framesRef.current;
    if (frames.length === 0) return;

    const totalFrames = frames.length;
    const clampedProgress = Math.min(1, Math.max(0, scrollProgress));
    const frameIndex = Math.min(totalFrames - 1, Math.floor(clampedProgress * totalFrames));
    const currentFrameCanvas = frames[frameIndex];

    if (!currentFrameCanvas) return;

    // EXACT positioning math matching PortraitReveal.tsx
    const isMobile = w < 768;
    const baseAspect = currentFrameCanvas.width / currentFrameCanvas.height;

    let drawH = isMobile ? h * 0.85 : h;
    let drawW = drawH * baseAspect;
    let drawX = isMobile ? (w - drawW) / 2 : (w * 0.45 - drawW) / 2;
    if (!isMobile && drawX < 0) drawX = 0;
    let drawY = isMobile ? h - drawH : (h - drawH) / 2;

    ctx.save();

    // 1. Cyber Opacity Noise Flicker Effect (0.85 to 1.0 noise on activation/scrolling)
    const isFlickering = Math.random() > 0.65;
    const flickerAlpha = isFlickering ? (0.85 + Math.random() * 0.15) : 1.0;
    ctx.globalAlpha = opacity * flickerAlpha;

    // 2. Draw base GIF frame in exact aligned position
    ctx.drawImage(currentFrameCanvas, drawX, drawY, drawW, drawH);

    // 3. Cyber Chromatic Glitch Shift (RGB split flicker effect)
    if (isFlickering && Math.random() > 0.70) {
      const glitchOffset = (Math.random() - 0.5) * 8;
      const sliceY = drawY + Math.random() * (drawH * 0.6);
      const sliceH = 15 + Math.random() * 30;

      ctx.save();
      ctx.globalAlpha = opacity * 0.75;
      ctx.globalCompositeOperation = 'screen';
      // Red shift slice
      ctx.drawImage(
        currentFrameCanvas,
        0, (sliceY - drawY) * (currentFrameCanvas.height / drawH),
        currentFrameCanvas.width, sliceH * (currentFrameCanvas.height / drawH),
        drawX + glitchOffset, sliceY,
        drawW, sliceH
      );
      ctx.restore();
    }

    // 4. Cyber Scanlines Overlay
    ctx.save();
    ctx.globalAlpha = opacity * 0.12;
    ctx.fillStyle = '#4DA3FF';
    for (let y = drawY; y < drawY + drawH; y += 4) {
      ctx.fillRect(drawX, y, drawW, 1);
    }
    ctx.restore();

    ctx.restore();

  }, [scrollProgress, opacity, loaded]);

  return (
    <div className={`fixed inset-0 w-full h-full pointer-events-none ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
      />
    </div>
  );
}
