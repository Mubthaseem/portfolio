import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

interface PortraitRevealProps {
  onHoverStateChange?: (isHovered: boolean) => void;
  scrollProgress?: number;
  isFrozen?: boolean;
  opacity?: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  life: number;
  maxLife: number;
  isSpark: boolean;
}

export default function PortraitReveal({ 
  onHoverStateChange, 
  scrollProgress = 0,
  isFrozen = false,
  opacity = 1
}: PortraitRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [isLockedAI, setIsLockedAI] = useState(false);

  const img1Ref = useRef<HTMLImageElement | null>(null);
  const img2Ref = useRef<HTMLImageElement | null>(null);
  const avatarRef = useRef<HTMLImageElement | null>(null);

  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0, isInside: false });
  const springRef = useRef({ x: 0, y: 0, radius: 0, targetRadius: 0, opacity: 0, targetOpacity: 0 });
  const parallaxRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const particlesRef = useRef<Particle[]>([]);
  const timeRef = useRef(0);
  const transformProgressRef = useRef(0); // 0 = ch1, 1 = ch2 / avatar
  const introProgressRef = useRef(0);
  const scrollProgressRef = useRef(0);

  const maxParticles = 110;
  const SCANNER_RADIUS = 95;

  useEffect(() => {
    scrollProgressRef.current = scrollProgress;
  }, [scrollProgress]);

  useEffect(() => {
    // Preload 1080p Images and avatar transformation GIF
    const img1 = new Image();
    const img2 = new Image();
    const avatar = new Image();

    let loadedCount = 0;
    const onImageLoaded = () => {
      loadedCount++;
      if (loadedCount >= 2) {
        setImagesLoaded(true);
        gsap.fromTo(
          introProgressRef,
          { current: 0 },
          {
            current: 1,
            duration: 0.6,
            ease: 'power3.out'
          }
        );
      }
    };

    const onImageError = () => {
      setLoadError(true);
    };

    img1.onload = onImageLoaded;
    img1.onerror = onImageError;
    img1.src = '/ch1.png';
    img1Ref.current = img1;

    img2.onload = onImageLoaded;
    img2.onerror = onImageError;
    img2.src = '/ch2.png';
    img2Ref.current = img2;

    avatar.src = '/avatar.gif';
    avatarRef.current = avatar;

    const particles: Particle[] = [];
    for (let i = 0; i < maxParticles; i++) {
      const isSpark = i >= 70;
      particles.push(resetParticle({} as Particle, 0, 0, isSpark));
    }
    particlesRef.current = particles;

    return () => {
      img1.onload = null;
      img1.onerror = null;
      img2.onload = null;
      img2.onerror = null;
    };
  }, []);

  const resetParticle = (p: Particle, centerX: number, centerY: number, isSpark: boolean): Particle => {
    if (isSpark) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.8 + Math.random() * 2.5;
      const rad = SCANNER_RADIUS * (1 + transformProgressRef.current * 4);
      p.x = (centerX || 300) + Math.cos(angle) * rad;
      p.y = (centerY || 300) + Math.sin(angle) * rad;
      p.vx = Math.cos(angle) * speed;
      p.vy = Math.sin(angle) * speed - 0.3;
      p.radius = 0.5 + Math.random() * 1.5;
      p.color = Math.random() > 0.3 ? '#82D6FF' : '#F5F8FF';
      p.maxLife = 15 + Math.floor(Math.random() * 20);
      p.life = p.maxLife;
      p.isSpark = true;
    } else {
      p.x = Math.random() * 1400;
      p.y = Math.random() * 1000;
      p.vx = (Math.random() - 0.5) * 0.15;
      p.vy = -0.1 - Math.random() * 0.2;
      p.radius = 0.3 + Math.random() * 0.8;
      p.color = '#4DA3FF';
      p.maxLife = 180 + Math.floor(Math.random() * 120);
      p.life = p.maxLife;
      p.isSpark = false;
    }
    return p;
  };

  const handleCanvasClick = () => {
    setIsLockedAI((prev) => !prev);
  };

  useEffect(() => {
    if (!imagesLoaded) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      canvas.width = rect.width;
      canvas.height = rect.height;

      if (!mouseRef.current.targetX) {
        mouseRef.current.targetX = rect.width * 0.28;
        mouseRef.current.targetY = rect.height * 0.42;
        springRef.current.x = rect.width * 0.28;
        springRef.current.y = rect.height * 0.42;
      }
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let hoverTween: gsap.core.Tween | null = null;

    const handleMouseMove = (e: MouseEvent) => {
      if (isFrozen) return;
      const canvasEl = canvasRef.current;
      if (!canvasEl) return;

      const rect = canvasEl.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      updateScannerPosition(x, y, rect.width, rect.height);
    };

    const updateScannerPosition = (x: number, y: number, width: number, height: number) => {
      mouseRef.current.targetX = x;
      mouseRef.current.targetY = y;

      if (!mouseRef.current.isInside) {
        mouseRef.current.isInside = true;
        if (onHoverStateChange) onHoverStateChange(true);
        
        if (hoverTween) hoverTween.kill();
        hoverTween = gsap.to(springRef.current, {
          radius: SCANNER_RADIUS,
          opacity: 1,
          duration: 0.5,
          ease: 'power3.out'
        });
      }

      const cx = width / 2;
      const cy = height / 2;
      parallaxRef.current.targetX = (x - cx) / cx;
      parallaxRef.current.targetY = (y - cy) / cy;
    };

    const handleMouseLeaveWindow = () => {
      mouseRef.current.isInside = false;
      if (onHoverStateChange) onHoverStateChange(false);
      
      if (hoverTween) hoverTween.kill();
      hoverTween = gsap.to(springRef.current, {
        radius: 0,
        opacity: 0,
        duration: 0.5,
        ease: 'power2.inOut'
      });
      
      parallaxRef.current.targetX = 0;
      parallaxRef.current.targetY = 0;
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeaveWindow);

    let animFrameId: number;

    const tick = () => {
      timeRef.current += 0.03;

      // 1. Transformation start logic:
      // - At HOME (scrollProgress < 0.10): Only show clean static image (ch1.png).
      // - From WHO I AM onwards (scrollProgress >= 0.10): Transformation starts morphing from 0 to 1 over the portrait.
      let rawScroll = scrollProgressRef.current;
      let targetProgress = 0;

      if (isLockedAI) {
        targetProgress = 1;
      } else if (rawScroll >= 0.10) {
        // Map 0.10 -> 0.90 to 0.0 -> 1.0
        targetProgress = Math.min(1, Math.max(0, (rawScroll - 0.10) / 0.80));
      }

      transformProgressRef.current += (targetProgress - transformProgressRef.current) * 0.14;
      const fullProgress = transformProgressRef.current;
      const introProgress = introProgressRef.current;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const w = canvas.width;
      const h = canvas.height;

      const isMobile = w < 768;
      const imgW = img1Ref.current?.naturalWidth || 1451;
      const imgH = img1Ref.current?.naturalHeight || 1084;
      const baseAspect = imgW / imgH;

      // Position adjustment for Desktop vs Mobile
      let drawH = isMobile ? h * 0.85 : h;
      let drawW = drawH * baseAspect;
      
      // On desktop: position centered in left 45% region so face stays aligned beside text column
      let drawX = isMobile ? (w - drawW) / 2 : (w * 0.45 - drawW) / 2;
      if (!isMobile && drawX < 0) drawX = 0;
      let drawY = isMobile ? h - drawH : (h - drawH) / 2;

      // Center of face position
      const faceCenterX = drawX + drawW * 0.50;
      const faceCenterY = drawY + drawH * 0.38;

      // When scrolling down past HOME without active mouse movement, lock scanner ring onto face center
      if (!mouseRef.current.isInside || rawScroll > 0.10) {
        mouseRef.current.targetX += (faceCenterX - mouseRef.current.targetX) * 0.1;
        mouseRef.current.targetY += (faceCenterY - mouseRef.current.targetY) * 0.1;
      }

      springRef.current.x += (mouseRef.current.targetX - springRef.current.x) * 0.14;
      springRef.current.y += (mouseRef.current.targetY - springRef.current.y) * 0.14;

      parallaxRef.current.x += (parallaxRef.current.targetX - parallaxRef.current.x) * 0.08;
      parallaxRef.current.y += (parallaxRef.current.targetY - parallaxRef.current.y) * 0.08;

      const offsetDx = parallaxRef.current.x * 6;
      const offsetDy = parallaxRef.current.y * 4;

      // Scale down from 108% to 100% during intro entrance
      const introScale = 1.08 - 0.08 * introProgress;
      const breathe = (1.0 + Math.sin(timeRef.current * 0.6) * 0.004) * introScale;

      // 1. Render Base Human Portrait (ch1.png) - Fades out as scroll progress increases to 1
      if (img1Ref.current && fullProgress < 0.99) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, 1.0 - fullProgress) * introProgress;
        ctx.translate(w / 2, h / 2);
        ctx.scale(breathe, breathe);
        ctx.translate(-w / 2, -h / 2);

        ctx.drawImage(img1Ref.current, drawX + offsetDx, drawY + offsetDy, drawW, drawH);

        // Intro Glitch Slices while loading
        if (introProgress < 0.85 && Math.random() > 0.8) {
          const sliceY = Math.random() * drawH;
          const sliceH = 8 + Math.random() * 18;
          const sliceShift = (Math.random() - 0.5) * 12;
          ctx.drawImage(
            img1Ref.current, 
            0, (sliceY / drawH) * 1084, 1451, (sliceH / drawH) * 1084, 
            drawX + offsetDx + sliceShift, drawY + sliceY + offsetDy, drawW, sliceH
          );
        }

        ctx.restore();
      }

      // Calculate effective reveal radius (expands outward as scrollProgress increases)
      const maxDiagonal = Math.hypot(w, h);
      const effectiveRadius = springRef.current.radius + fullProgress * maxDiagonal;
      const effectiveOpacity = Math.max(springRef.current.opacity, fullProgress);

      // 2. Render AI Portrait (ch2.png) inside expanding reveal region
      if (effectiveRadius > 1 && effectiveOpacity > 0.01 && img2Ref.current) {
        const scanX = springRef.current.x;
        const scanY = springRef.current.y;

        const invBreathe = 1.0 / breathe;
        const localScanX = w / 2 + (scanX - w / 2) * invBreathe;
        const localScanY = h / 2 + (scanY - h / 2) * invBreathe;
        const radiusInLocal = effectiveRadius * invBreathe;

        // Step 2A: Erase base image (ch1.png) inside reveal circle
        ctx.save();
        ctx.translate(w / 2, h / 2);
        ctx.scale(breathe, breathe);
        ctx.translate(-w / 2, -h / 2);

        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(localScanX, localScanY, radiusInLocal, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Step 2B: Draw AI portrait (ch2.png) into revealed region
        ctx.save();
        ctx.translate(w / 2, h / 2);
        ctx.scale(breathe, breathe);
        ctx.translate(-w / 2, -h / 2);

        ctx.beginPath();
        ctx.arc(localScanX, localScanY, radiusInLocal, 0, Math.PI * 2);
        ctx.clip();

        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = Math.min(1.0, fullProgress > 0 ? fullProgress * 1.5 : 1.0);
        ctx.drawImage(img2Ref.current, drawX + offsetDx, drawY + offsetDy, drawW, drawH);

        // Chromatic aberration glitch effect inside scanner
        const glitchFactor = Math.sin(timeRef.current * 8.0) > 0.85 ? 1 : 0.15;
        const abOffset = 3.0 * glitchFactor * effectiveOpacity;
        ctx.globalAlpha = 0.35;
        ctx.drawImage(img2Ref.current, drawX + offsetDx - abOffset, drawY + offsetDy, drawW, drawH);
        ctx.drawImage(img2Ref.current, drawX + offsetDx + abOffset, drawY + offsetDy, drawW, drawH);

        ctx.restore();

        // 3. Render Precise Scanner Rings & Shockwave HUD
        ctx.save();
        ctx.globalAlpha = Math.max(0.2, 1 - fullProgress * 0.8);

        ctx.shadowColor = '#4DA3FF';
        ctx.shadowBlur = 14 * effectiveOpacity;
        ctx.strokeStyle = '#4DA3FF';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(scanX, scanY, effectiveRadius, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.shadowBlur = 0;

        ctx.strokeStyle = 'rgba(130, 214, 255, 0.7)';
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.arc(scanX, scanY, Math.max(0, effectiveRadius - 4), 0, Math.PI * 2);
        ctx.stroke();

        if (fullProgress < 0.9) {
          ctx.strokeStyle = '#82D6FF';
          ctx.lineWidth = 2.0;
          const rot = timeRef.current * 0.6;
          for (let i = 0; i < 4; i++) {
            const a1 = rot + (i * Math.PI) / 2;
            const a2 = a1 + Math.PI * 0.2;
            ctx.beginPath();
            ctx.arc(scanX, scanY, effectiveRadius + 3, a1, a2);
            ctx.stroke();
          }

          ctx.strokeStyle = 'rgba(130, 214, 255, 0.9)';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(scanX + effectiveRadius + 8, scanY); 
          ctx.lineTo(scanX + effectiveRadius + 16, scanY);
          ctx.moveTo(scanX + effectiveRadius + 12, scanY - 4); 
          ctx.lineTo(scanX + effectiveRadius + 12, scanY + 4);
          ctx.stroke();

          ctx.font = '8px "JetBrains Mono", monospace';
          ctx.fillStyle = '#82D6FF';
          
          const calloutX = scanX + effectiveRadius + 20;
          ctx.fillText('┌  FACE MAPPING', calloutX, scanY - 14);
          ctx.fillStyle = '#4DA3FF';
          ctx.fillText('   ACTIVE', calloutX, scanY - 4);

          ctx.fillStyle = '#82D6FF';
          ctx.fillText('┌  AI PROFILE', calloutX, scanY + 10);
          ctx.fillStyle = '#4DA3FF';
          ctx.fillText('   LOADED', calloutX, scanY + 20);
        }

        ctx.restore();
      }

      // 4. Intro Laser Sweep Line Effect
      if (introProgress < 0.98) {
        ctx.save();
        const laserY = drawY + offsetDy + drawH * introProgress;
        ctx.shadowColor = '#82D6FF';
        ctx.shadowBlur = 15;
        ctx.strokeStyle = '#82D6FF';
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        ctx.moveTo(drawX + offsetDx, laserY);
        ctx.lineTo(drawX + offsetDx + drawW * 0.6, laserY);
        ctx.stroke();
        ctx.restore();
      }

      // 5. Background dust & spark particles
      ctx.save();
      particlesRef.current.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life--;

        if (p.isSpark) {
          const dist = Math.hypot(p.x - springRef.current.x, p.y - springRef.current.y);
          if (dist <= effectiveRadius + 15) {
            ctx.fillStyle = p.color;
            ctx.globalAlpha = (p.life / p.maxLife) * effectiveOpacity;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
          }
        } else {
          ctx.fillStyle = p.color;
          ctx.globalAlpha = (p.life / p.maxLife) * 0.15;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();
        }

        if (p.life <= 0) {
          resetParticle(p, springRef.current.x, springRef.current.y, p.isSpark);
        }
      });
      ctx.restore();

      animFrameId = requestAnimationFrame(tick);
    };

    tick();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeaveWindow);
      cancelAnimationFrame(animFrameId);
    };
  }, [imagesLoaded, isLockedAI]);

  return (
    <div 
      ref={containerRef}
      onClick={isFrozen ? undefined : handleCanvasClick}
      style={{ opacity, transition: 'opacity 400ms ease-out', willChange: 'opacity, transform' }}
      className="w-full h-full relative overflow-hidden cursor-pointer bg-transparent select-none"
    >
      {/* Fullscreen Canvas */}
      <canvas ref={canvasRef} className="w-full h-full object-cover block relative z-10" />

      {/* Left HUD Overlay Panel (Desktop Only) */}
      <div className="hidden md:flex absolute top-28 left-8 pointer-events-none z-20 flex-col gap-3 font-mono text-[9px] text-secondary bg-black/70 backdrop-blur-md p-4 border border-white/10 rounded-sm max-w-[210px]">
        <div className="flex items-center gap-2 text-primary font-bold tracking-[0.2em] uppercase pb-2 border-b border-white/10">
          <span className={`w-1.5 h-1.5 rounded-full ${isLockedAI ? 'bg-highlight animate-ping' : 'bg-primary animate-pulse'} shadow-[0_0_8px_#4DA3FF]`}></span>
          {isLockedAI ? 'CYBER MODE // ENGAGED' : 'AI SCANNER // ANALYSIS'}
        </div>

        <div className="flex flex-col gap-2 pt-1 text-[8px] tracking-[0.15em]">
          <div className="text-highlight font-bold uppercase">
            {isLockedAI ? 'FULL AI MORPH ACTIVE' : 'IDENTITY VERIFIED'}
          </div>
          
          <div className="flex justify-between items-center text-text-main">
            <span>BIOMETRIC MATCH</span>
            <span className="text-primary font-bold">100%</span>
          </div>

          <div className="flex justify-between items-center text-text-main">
            <span>NEURAL LINK</span>
            <span className="text-primary font-bold">100%</span>
          </div>

          <div className="flex justify-between items-center text-text-main">
            <span>SIGNAL LOCKED</span>
            <span className="text-primary font-bold">100%</span>
          </div>
        </div>

        <div className="flex flex-col gap-1 border-t border-white/10 pt-2 text-[8px]">
          <div className="text-primary tracking-[0.2em]">[ SYSTEM ONLINE ]</div>
          <div className="flex justify-between items-center text-highlight font-bold">
            <span>SYNC 100%</span>
            <span className="tracking-[0.05em] text-primary">||||||||||</span>
          </div>
        </div>

        {/* SCAN PROGRESS meter inside Left HUD */}
        <div className="flex flex-col gap-1 border-t border-white/10 pt-2">
          <div className="flex justify-between items-center">
            <span className="text-[8px] text-secondary uppercase">
              {isLockedAI ? 'CYBER OVERRIDE' : 'SCAN PROGRESS'}
            </span>
            <span className="text-xs font-bold text-highlight tracking-wider">
              {Math.round(transformProgressRef.current * 100)}%
            </span>
          </div>
          <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary shadow-[0_0_8px_#4DA3FF] transition-all duration-300"
              style={{ width: `${Math.round(transformProgressRef.current * 100)}%` }}
            ></div>
          </div>
        </div>

        <div className="text-[7.5px] text-white/50 tracking-wider text-center pt-1 border-t border-white/10">
          [ SCROLL OR CLICK TO TRANSFORM ]
        </div>
      </div>

      {/* Preloader */}
      {!imagesLoaded && (
        <div className="absolute inset-0 bg-black z-30 flex flex-col items-center justify-center font-mono text-[10px] text-primary gap-3">
          <div className="flex gap-1.5 items-center">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span>
            <span>BOOTING SCANNER SYSTEM...</span>
          </div>
          {loadError && (
            <div className="text-red-400 text-[9px] uppercase tracking-wider">
              [ ERROR: Assets load failure ]
            </div>
          )}
        </div>
      )}
    </div>
  );
}
