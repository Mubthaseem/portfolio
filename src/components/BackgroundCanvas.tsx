import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';

export interface BackgroundCanvasRef {
  triggerBurst: (x: number, y: number) => void;
}

interface Particle {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  vy: number;
  angle: number;
  swaySpeed: number;
  swayWidth: number;
}

interface BurstParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  life: number;
  maxLife: number;
}

export const BackgroundCanvas = forwardRef<BackgroundCanvasRef, {}>((_, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const burstsRef = useRef<BurstParticle[]>([]);
  const noiseCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Expose the triggerBurst function to parent/sibling components
  useImperativeHandle(ref, () => ({
    triggerBurst(x, y) {
      const count = 65; // Spawn 65 particles
      const colors = ['#4DA3FF', '#82D6FF', '#F5F8FF', '#6C8AB3'];
      
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        // High initial speed, will decelerate due to drag
        const speed = 2.0 + Math.random() * 5.0; 
        const maxLife = 30 + Math.floor(Math.random() * 25);
        
        burstsRef.current.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: 1.0 + Math.random() * 2.2,
          color: colors[Math.floor(Math.random() * colors.length)],
          life: maxLife,
          maxLife,
        });
      }
    }
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle resizing
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize background floating particles
    const particleCount = 100;
    const particles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: 0.5 + Math.random() * 1.2,
        opacity: 0.15 + Math.random() * 0.4,
        vy: 0.2 + Math.random() * 0.5,
        angle: Math.random() * Math.PI * 2,
        swaySpeed: 0.01 + Math.random() * 0.02,
        swayWidth: 0.2 + Math.random() * 0.8,
      });
    }
    particlesRef.current = particles;

    // Generate static 128x128 noise pattern for performance optimization
    const noiseCanvas = document.createElement('canvas');
    noiseCanvas.width = 128;
    noiseCanvas.height = 128;
    const noiseCtx = noiseCanvas.getContext('2d')!;
    const imgData = noiseCtx.createImageData(128, 128);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const val = Math.floor(Math.random() * 255);
      data[i] = val;
      data[i+1] = val;
      data[i+2] = val;
      data[i+3] = 18; // Very faint alpha
    }
    noiseCtx.putImageData(imgData, 0, 0);
    noiseCanvasRef.current = noiseCanvas;

    // Render loop
    let animationFrameId: number;
    let time = 0;

    const render = () => {
      time += 0.05;
      
      // Clear Screen with pure black
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 1. Draw Volumetric Fog (moving radial gradients)
      // Gradient 1: Primary blue, drifting slowly
      const g1x = canvas.width / 2 + Math.cos(time * 0.15) * (canvas.width * 0.15);
      const g1y = canvas.height / 2 + Math.sin(time * 0.2) * (canvas.height * 0.15);
      const grad1 = ctx.createRadialGradient(g1x, g1y, 10, g1x, g1y, canvas.width * 0.35);
      grad1.addColorStop(0, 'rgba(77, 163, 255, 0.08)');
      grad1.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Gradient 2: Highlight blue, counter drifting
      const g2x = canvas.width / 2 - Math.sin(time * 0.1) * (canvas.width * 0.18);
      const g2y = canvas.height / 2 - Math.cos(time * 0.15) * (canvas.height * 0.12);
      const grad2 = ctx.createRadialGradient(g2x, g2y, 10, g2x, g2y, canvas.width * 0.45);
      grad2.addColorStop(0, 'rgba(130, 214, 255, 0.05)');
      grad2.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. Draw Floating Particles
      particlesRef.current.forEach((p) => {
        // Move particle upwards
        p.y -= p.vy;
        p.angle += p.swaySpeed;
        p.x += Math.sin(p.angle) * p.swayWidth * 0.4;

        // Reset if offscreen
        if (p.y < -10) {
          p.y = canvas.height + 10;
          p.x = Math.random() * canvas.width;
        }

        ctx.fillStyle = `rgba(130, 214, 255, ${p.opacity})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // 3. Draw Particle Bursts
      burstsRef.current.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        
        // Decelerate
        p.vx *= 0.93;
        p.vy *= 0.93;
        
        p.life--;

        // Draw particle
        const alpha = p.life / p.maxLife;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        // Give locked center flare particles larger glow
        ctx.arc(p.x, p.y, p.radius * (1.0 + (1.0 - alpha) * 0.5), 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1.0; // Reset global alpha

      // Remove dead burst particles
      burstsRef.current = burstsRef.current.filter((p) => p.life > 0);

      // 4. Draw Digital Noise overlay (Tiled)
      if (noiseCanvasRef.current) {
        // Randomize pattern offsets to animate grain
        const offsetX = Math.floor(Math.random() * 128);
        const offsetY = Math.floor(Math.random() * 128);
        
        ctx.save();
        const pattern = ctx.createPattern(noiseCanvasRef.current, 'repeat');
        if (pattern) {
          ctx.translate(offsetX, offsetY);
          ctx.fillStyle = pattern;
          ctx.fillRect(-offsetX, -offsetY, canvas.width, canvas.height);
        }
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full pointer-events-none z-0" />;
});

BackgroundCanvas.displayName = 'BackgroundCanvas';
export default BackgroundCanvas;
