import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

interface HangingIDCardProps {
  leftOffset?: number; // Configurable left offset in px
}

export default function HangingIDCard({ leftOffset = 40 }: HangingIDCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const swingWrapperRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const leftCordRef = useRef<SVGPathElement>(null);
  const rightCordRef = useRef<SVGPathElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);
  
  const [isHovered, setIsHovered] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  // Physics refs (solving directly for X displacement in pixels)
  const swingX = useRef(0);
  const swingXVelocity = useRef(0);
  const mouseForceX = useRef(0);
  const scrollForceX = useRef(0);
  
  // Dragging refs for mobile touch and desktop mouse click-and-drag
  const isDragging = useRef(false);
  const touchStartX = useRef(0);
  const dragX = useRef(0);
  const lastTouchX = useRef(0);
  const lastTouchTime = useRef(0);
  const dragVelocityX = useRef(0);

  // Previous states for delta tracking
  const prevMouseX = useRef<number | null>(null);
  const prevScrollY = useRef(0);

  // L = 136px is the pendulum radius from the top window anchor to the center of the card
  const PENDULUM_RADIUS = 136;

  // Unified drag lifecycle handlers
  const startDrag = (clientX: number) => {
    isDragging.current = true;
    touchStartX.current = clientX - swingX.current;
    lastTouchX.current = clientX;
    lastTouchTime.current = performance.now();
    dragVelocityX.current = 0;
  };

  const moveDrag = (clientX: number) => {
    if (!isDragging.current) return;
    const now = performance.now();
    const dt = now - lastTouchTime.current;

    // Calculate instantaneous swipe velocity
    if (dt > 0) {
      dragVelocityX.current = (clientX - lastTouchX.current) / dt;
    }

    dragX.current = clientX - touchStartX.current;
    lastTouchX.current = clientX;
    lastTouchTime.current = now;
  };

  const endDrag = () => {
    if (!isDragging.current) return;
    isDragging.current = false;

    // Apply the release drag velocity directly to the swing velocity (with a tuning factor)
    swingXVelocity.current = dragVelocityX.current * 15.0;
    // Clamp velocity to prevent flying off screen
    swingXVelocity.current = Math.min(25, Math.max(-25, swingXVelocity.current));

    dragX.current = 0;
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Entrance animation using GSAP (String appears, card drops and sways)
    gsap.fromTo(container, 
      { y: -300 }, 
      { 
        y: 0, 
        duration: 1.8, 
        ease: "elastic.out(1.1, 0.55)",
        onComplete: () => {
          prevScrollY.current = window.scrollY;
          // Trigger an initial swing force for organic entrance feel
          swingXVelocity.current = 15;
        }
      }
    );

    // 2. Physics & Animation loop
    let animationFrameId: number;
    let time = 0;

    const updatePhysics = () => {
      time += 0.015;

      // A. Constant tiny idle swing (oscillates X coordinate smoothly by +/- 4px)
      const idleX = Math.sin(time * (Math.PI / 2)) * 4;

      if (isDragging.current) {
        // B1. Dragging: Card position X directly follows finger/mouse displacement
        // Clamp X translation so it doesn't drag off the screen boundaries (max +/- 115px)
        const clampedDragX = Math.min(115, Math.max(-115, dragX.current));
        swingX.current += (clampedDragX - swingX.current) * 0.25;
        swingXVelocity.current = 0; 
      } else {
        // B2. Spring solver physics for release swing
        const stiffness = 0.08;
        const damping = 0.92;

        // Decay interactive forces
        mouseForceX.current *= 0.92;
        scrollForceX.current *= 0.90;

        const targetX = idleX + mouseForceX.current + scrollForceX.current;

        // Spring physics solver (Verlet-style)
        const acceleration = (targetX - swingX.current) * stiffness;
        swingXVelocity.current = (swingXVelocity.current + acceleration) * damping;
        swingX.current += swingXVelocity.current;
      }

      // C. Calculate geometry outputs (rotation angle and vertical lift)
      // Based on pendulum circular arc: y = L - sqrt(L^2 - x^2)
      const L = PENDULUM_RADIUS;
      const clampedX = Math.min(L - 5, Math.max(-L + 5, swingX.current));
      const liftY = L - Math.sqrt(L * L - clampedX * clampedX);
      const angle = Math.asin(clampedX / L) * (180 / Math.PI);

      // D. Update Swing Wrapper Transform (X translation, Y lift, and pendulum rotation)
      if (swingWrapperRef.current) {
        swingWrapperRef.current.style.transform = `translate3d(${swingX.current}px, ${liftY}px, 0) rotate(${angle}deg)`;
      }

      // E. Update SVG Cords (Dynamic endpoints stretch to meet clip)
      if (leftCordRef.current && rightCordRef.current) {
        // Left cord: fixed at (45, 0) -> ends at (52 + swingX, 55 + liftY)
        // Q control point curves slightly based on swing magnitude
        leftCordRef.current.setAttribute('d', `M 45,0 Q ${47 + swingX.current * 0.4},28 ${52 + swingX.current},${55 + liftY}`);
        
        // Right cord: fixed at (75, 0) -> ends at (68 + swingX, 55 + liftY)
        rightCordRef.current.setAttribute('d', `M 75,0 Q ${73 + swingX.current * 0.4},28 ${68 + swingX.current},${55 + liftY}`);
      }

      // F. Update Shadow Position (parallax displacement opposite to swing)
      if (shadowRef.current) {
        const shadowX = -Math.sin((angle * Math.PI) / 180) * 18 + swingX.current;
        const shadowY = 12 + Math.abs(angle) * 0.5 + liftY;
        shadowRef.current.style.transform = `translate3d(${shadowX}px, ${shadowY}px, -20px) scale(${isHovered ? 1.02 : 1})`;
      }

      animationFrameId = requestAnimationFrame(updatePhysics);
    };

    animationFrameId = requestAnimationFrame(updatePhysics);

    // 3. Mouse Move Handler (Momentum opposite to cursor direction when idle)
    const handleMouseMoveGlobal = (e: MouseEvent) => {
      if (isDragging.current) {
        moveDrag(e.clientX);
      } else if (prevMouseX.current !== null) {
        const deltaX = e.clientX - prevMouseX.current;
        mouseForceX.current -= deltaX * 0.25; // Scale mouse swipe force
        mouseForceX.current = Math.min(60, Math.max(-60, mouseForceX.current));
      }
      prevMouseX.current = e.clientX;
    };

    const handleMouseUpGlobal = () => {
      if (isDragging.current) {
        endDrag();
      }
    };

    // 4. Scroll Momentum Tracker (Sways card on scroll delta)
    const handleScrollGlobal = () => {
      const pane = document.querySelector('.scroll-pane');
      const currentScroll = pane ? pane.scrollTop : window.scrollY;
      const deltaY = currentScroll - prevScrollY.current;

      if (Math.abs(deltaY) > 0.5) {
        const direction = deltaY > 0 ? 1 : -1;
        scrollForceX.current += direction * Math.min(25, Math.abs(deltaY) * 0.35);
        scrollForceX.current = Math.min(45, Math.max(-45, scrollForceX.current));
      }
      prevScrollY.current = currentScroll;
    };

    window.addEventListener('mousemove', handleMouseMoveGlobal);
    window.addEventListener('mouseup', handleMouseUpGlobal);
    window.addEventListener('scroll', handleScrollGlobal);
    
    const pane = document.querySelector('.scroll-pane');
    if (pane) {
      pane.addEventListener('scroll', handleScrollGlobal, { passive: true });
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMoveGlobal);
      window.removeEventListener('mouseup', handleMouseUpGlobal);
      window.removeEventListener('scroll', handleScrollGlobal);
      if (pane) {
        pane.removeEventListener('scroll', handleScrollGlobal);
      }
    };
  }, []);

  // 5. 3D Hover Tilt calculations (Desktops)
  const handleMouseMoveCard = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging.current) return;
    
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const px = x / rect.width - 0.5;
    const py = y / rect.height - 0.5;

    setTilt({
      x: -py * 6,
      y: px * 8
    });
  };

  const handleMouseLeaveCard = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div 
      ref={containerRef}
      className="fixed top-0 z-40 flex flex-col items-center select-none"
      style={{ 
        left: `${leftOffset}px`,
        width: '120px'
      }}
    >
      {/* A. Suspended Cords System - top points remain fixed at (45,0) and (75,0) */}
      <svg width="120" height="55" className="overflow-visible pointer-events-none absolute top-0 left-0">
        <path 
          ref={leftCordRef}
          d="M 45,0 Q 47,28 52,55" 
          stroke="#3d3d3d" 
          strokeWidth="1.8" 
          fill="none" 
          strokeLinecap="round"
        />
        <path 
          ref={rightCordRef}
          d="M 75,0 Q 73,28 68,55" 
          stroke="#3d3d3d" 
          strokeWidth="1.8" 
          fill="none" 
          strokeLinecap="round"
        />
      </svg>

      {/* B. Interactive Card Shadow - shifts parallax-style */}
      <div 
        ref={shadowRef}
        className="absolute bg-black/80 rounded-[10px] pointer-events-none filter blur-[15px] transition-all duration-300"
        style={{
          width: '75px',
          height: '130px',
          top: '64px',
          left: '22px',
          opacity: 0.18,
          zIndex: 0
        }}
      />

      {/* C. Swing Wrapper: Translates and rotates based on the pendulum physics solver */}
      <div 
        ref={swingWrapperRef}
        className="flex flex-col items-center will-change-transform"
        style={{ 
          transformOrigin: '50% 0%', 
          marginTop: '55px' 
        }}
      >
        {/* Clip (moves with the card) */}
        <div 
          className="w-5 h-2.5 bg-gradient-to-b from-[#6b7280] via-[#9ca3af] to-[#4b5563] border border-white/10 rounded-[1px] relative shadow-md"
          style={{ marginTop: '-2px', zIndex: 2 }}
        />

        {/* Card Body - Drag/touch target */}
        <div
          ref={cardRef}
          onMouseEnter={() => setIsHovered(true)}
          onMouseMove={handleMouseMoveCard}
          onMouseLeave={handleMouseLeaveCard}
          onTouchStart={(e) => startDrag(e.touches[0].clientX)}
          onTouchMove={(e) => moveDrag(e.touches[0].clientX)}
          onTouchEnd={endDrag}
          onMouseDown={(e) => {
            if (e.button === 0) { // Only drag with left click
              e.preventDefault();
              startDrag(e.clientX);
            }
          }}
          className="relative cursor-grab active:cursor-grabbing transition-transform duration-300 pointer-events-auto mix-blend-screen touch-none"
          style={{
            width: '100px',
            height: '142px',
            marginTop: '-1px',
            transform: `perspective(500px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${isHovered ? 1.05 : 1})`,
            transformStyle: 'preserve-3d',
            willChange: 'transform',
            zIndex: 1
          }}
        >
          <img 
            src="/IDCARD.png" 
            alt="ID Card Badge" 
            className="w-full h-full object-cover pointer-events-none"
          />
        </div>
      </div>
    </div>
  );
}
