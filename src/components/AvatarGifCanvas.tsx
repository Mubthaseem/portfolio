import { useEffect, useRef, useState } from 'react';
import { parseGIF, decompressFrames } from 'gifuct-js';

interface AvatarGifCanvasProps {
  scrollProgress: number;
  opacity?: number;
  className?: string;
}

const CACHE_NAME = 'mubthaseem-avatar-v2';
const GIF_URL = '/avatar.gif';
const TOTAL_EXPECTED_BYTES = 46094682; // ~46MB

export default function AvatarGifCanvas({ scrollProgress, opacity = 1, className = "" }: AvatarGifCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const framesRef = useRef<HTMLCanvasElement[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadStateText, setDownloadStateText] = useState('INITIALIZING ASSET FETCH...');
  const [loadedMB, setLoadedMB] = useState('0.0');
  const [totalMB, setTotalMB] = useState('46.0');

  useEffect(() => {
    let active = true;

    const fetchWithProgress = async (): Promise<ArrayBuffer> => {
      if (typeof window !== 'undefined' && 'caches' in window) {
        try {
          const cache = await caches.open(CACHE_NAME);
          const cachedResponse = await cache.match(GIF_URL);
          if (cachedResponse) {
            const buf = await cachedResponse.arrayBuffer();
            if (buf && buf.byteLength > 1000000) {
              setDownloadStateText('CACHED ASSET DETECTED — LOADING FROM MEMORY');
              setDownloadProgress(100);
              return buf;
            } else {
              await cache.delete(GIF_URL);
            }
          }
        } catch (e) {
          console.warn("CacheStorage read error:", e);
        }
      }

      return new Promise<ArrayBuffer>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', GIF_URL);
        xhr.responseType = 'arraybuffer';

        xhr.onprogress = (e) => {
          if (!active) return;
          const total = e.lengthComputable && e.total > 0 ? e.total : TOTAL_EXPECTED_BYTES;
          const loadedBytes = e.loaded;
          const percent = Math.min(99, Math.round((loadedBytes / total) * 100));

          setDownloadProgress(percent);
          setLoadedMB((loadedBytes / (1024 * 1024)).toFixed(1));
          setTotalMB((total / (1024 * 1024)).toFixed(1));
          setDownloadStateText(`DOWNLOADING AVATAR TRANSFORMATION [ ${percent}% ]`);
        };

        xhr.onload = () => {
          if (!active) return;
          if (xhr.status >= 200 && xhr.status < 300 && xhr.response) {
            setDownloadProgress(100);
            setDownloadStateText('DECODING FRAME SEQUENCES...');
            
            // Make a copy of ArrayBuffer before passing to Response to prevent detachment
            const bufferCopy = xhr.response.slice(0);

            if (typeof window !== 'undefined' && 'caches' in window) {
              caches.open(CACHE_NAME).then((cache) => {
                const response = new Response(bufferCopy, {
                  headers: { 'Content-Type': 'image/gif' }
                });
                cache.put(GIF_URL, response);
              }).catch(() => {});
            }

            resolve(xhr.response as ArrayBuffer);
          } else {
            reject(new Error(`Fetch failed with status ${xhr.status}`));
          }
        };

        xhr.onerror = () => reject(new Error('Network error downloading avatar.gif'));
        xhr.send();
      });
    };

    const startAsyncProcess = () => {
      fetchWithProgress()
        .then((buffer) => {
          if (!active) return;
          const gif = parseGIF(buffer);
          const rawFrames = decompressFrames(gif, true);

          if (!rawFrames || rawFrames.length === 0) {
            console.error("No frames decoded from GIF buffer");
            return;
          }

          const width = gif.lsd.width;
          const height = gif.lsd.height;

          const frameCanvases: HTMLCanvasElement[] = [];
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = width;
          tempCanvas.height = height;
          const tempCtx = tempCanvas.getContext('2d')!;

          let index = 0;
          const total = rawFrames.length;

          const processBatch = () => {
            if (!active) return;
            const batchSize = 20;
            const end = Math.min(index + batchSize, total);

            for (; index < end; index++) {
              const frame = rawFrames[index];
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
            }

            if (index < total) {
              if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
                (window as any).requestIdleCallback(processBatch);
              } else {
                setTimeout(processBatch, 10);
              }
            } else {
              if (active) {
                framesRef.current = frameCanvases;
                setLoaded(true);
              }
            }
          };

          processBatch();
        })
        .catch((err) => {
          console.error("Error downloading/decoding GIF:", err);
          setDownloadStateText('DOWNLOAD ERROR — TAP TO RETRY');
        });
    };

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      (window as any).requestIdleCallback(startAsyncProcess);
    } else {
      setTimeout(startAsyncProcess, 50);
    }

    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

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

    const isMobile = w < 768;
    const baseAspect = currentFrameCanvas.width / currentFrameCanvas.height;

    let drawH = isMobile ? h * 0.85 : h;
    let drawW = drawH * baseAspect;
    let drawX = isMobile ? (w - drawW) / 2 : (w * 0.45 - drawW) / 2;
    if (!isMobile && drawX < 0) drawX = 0;
    let drawY = isMobile ? h - drawH : (h - drawH) / 2;

    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.drawImage(currentFrameCanvas, drawX, drawY, drawW, drawH);
    ctx.restore();

  }, [scrollProgress, opacity, loaded]);

  return (
    <div className={`fixed inset-0 w-full h-full pointer-events-none ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
      />

      {/* Cyber Real-Time Download Progress Telemetry */}
      {!loaded && (
        <div className="fixed top-0 left-0 w-full md:w-[48%] h-full z-30 flex flex-col items-center justify-center p-6 select-none pointer-events-none">
          <div className="bg-black/80 backdrop-blur-xl border border-primary/40 p-6 rounded-2xl max-w-sm w-full flex flex-col gap-4 shadow-[0_0_30px_rgba(77,163,255,0.25)] font-mono text-xs">
            <div className="flex justify-between items-center border-b border-white/10 pb-2.5">
              <div className="flex items-center gap-2 text-primary font-bold tracking-wider">
                <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
                <span>[ ASSET TELEMETRY ]</span>
              </div>
              <span className="text-highlight font-bold">{downloadProgress}%</span>
            </div>

            <p className="text-[10px] text-secondary tracking-widest uppercase">
              {downloadStateText}
            </p>

            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden relative">
              <div 
                className="h-full bg-primary shadow-[0_0_10px_#4DA3FF] transition-all duration-200"
                style={{ width: `${downloadProgress}%` }}
              />
            </div>

            <div className="flex justify-between items-center text-[9px] text-secondary tracking-widest">
              <span>BYTES: {loadedMB} MB / {totalMB} MB</span>
              <span>RES: 1080P HD</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
