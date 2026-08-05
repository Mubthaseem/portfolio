import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

interface HangingIDCardProps {
  leftOffset?: number; // Configurable left offset in px
}

export default function HangingIDCard({ leftOffset = 40 }: HangingIDCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  
  const [isHovered, setIsHovered] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  // Physics refs (solving directly for X translation of the entire element)
  const currentX = useRef(0);
  const velocityX = useRef(0);
  const mouseForceX = useRef(0);
  
  // Dragging refs for touch and desktop mouse click-and-drag
  const isDragging = useRef(false);
  const touchStartX = useRef(0);
  const dragX = useRef(0);
  const lastTouchX = useRef(0);
  const lastTouchTime = useRef(0);
  const dragVelocityX = useRef(0);

  // Previous states for delta tracking
  const prevMouseX = useRef<number | null>(null);

  // Unified drag lifecycle handlers
  const startDrag = (clientX: number) => {
    isDragging.current = true;
    touchStartX.current = clientX - currentX.current;
    lastTouchX.current = clientX;
    lastTouchTime.current = performance.now();
    dragVelocityX.current = 0;
  };

  const moveDrag = (clientX: number) => {
    if (!isDragging.current) return;
    const now = performance.now();
    const dt = now - lastTouchTime.current;

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

    // Apply the swipe velocity to the spring movement on release
    velocityX.current = dragVelocityX.current * 12.0;
    velocityX.current = Math.min(25, Math.max(-25, velocityX.current));

    dragX.current = 0;
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Entrance animation: drop the entire container down bouncy on load
    gsap.fromTo(container, 
      { y: -300 }, 
      { 
        y: 0, 
        duration: 1.6, 
        ease: "elastic.out(1.1, 0.6)",
        onComplete: () => {
          // Add a small initial slide force on entry
          velocityX.current = 8;
        }
      }
    );

    // 2. Physics & Animation loop
    let animationFrameId: number;
    let time = 0;

    const updatePhysics = () => {
      time += 0.015;

      // Subtle perpetual idle rotation on the card itself (the "point swinging animation")
      // Very small swing angle (-1.5deg to 1.5deg, 4s duration)
      const idleRotation = Math.sin(time * (Math.PI / 2)) * 1.5;

      if (isDragging.current) {
        // Dragging: entire container X follows the mouse/finger directly
        // Clamp drag X position so it stays within a reasonable screen range
        const clampedDragX = Math.min(180, Math.max(-180, dragX.current));
        currentX.current += (clampedDragX - currentX.current) * 0.3; // High follow sensitivity
        velocityX.current = 0;
      } else {
        // Release: slide back to center (0) using spring physics
        const stiffness = 0.06;
        const damping = 0.90;

        mouseForceX.current *= 0.92;
        const targetX = mouseForceX.current;

        const acceleration = (targetX - currentX.current) * stiffness;
        velocityX.current = (velocityX.current + acceleration) * damping;
        currentX.current += velocityX.current;
      }

      // Translate the entire container (chain + clip + card) in X direction
      if (container) {
        container.style.transform = `translate3d(${currentX.current}px, 0, 0)`;
      }

      // Apply the idle point swinging rotation and 3D tilts strictly on the card body
      if (cardRef.current) {
        cardRef.current.style.transform = `perspective(500px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) rotate(${idleRotation}deg) scale(${isHovered ? 1.05 : 1})`;
      }

      animationFrameId = requestAnimationFrame(updatePhysics);
    };

    animationFrameId = requestAnimationFrame(updatePhysics);

    // 3. Global Mouse Listener for dragging and idle swipe pushes
    const handleMouseMoveGlobal = (e: MouseEvent) => {
      if (isDragging.current) {
        moveDrag(e.clientX);
      } else if (prevMouseX.current !== null) {
        const deltaX = e.clientX - prevMouseX.current;
        // Minor push force when cursor swipes across the screen
        mouseForceX.current -= deltaX * 0.15;
        mouseForceX.current = Math.min(40, Math.max(-40, mouseForceX.current));
      }
      prevMouseX.current = e.clientX;
    };

    const handleMouseUpGlobal = () => {
      if (isDragging.current) {
        endDrag();
      }
    };

    window.addEventListener('mousemove', handleMouseMoveGlobal);
    window.addEventListener('mouseup', handleMouseUpGlobal);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMoveGlobal);
      window.removeEventListener('mouseup', handleMouseUpGlobal);
    };
  }, [tilt, isHovered]);

  // 4. 3D Hover Tilt calculations (Desktops)
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
      className="fixed top-0 z-40 flex flex-col items-center select-none will-change-transform"
      style={{ 
        left: `${leftOffset}px`,
        width: '120px'
      }}
    >
      {/* A. Suspended Cords System - moves rigidly with the card */}
      <svg width="120" height="55" className="overflow-visible pointer-events-none">
        <path 
          d="M 45,0 Q 47,28 52,55" 
          stroke="#3d3d3d" 
          strokeWidth="1.8" 
          fill="none" 
          strokeLinecap="round"
        />
        <path 
          d="M 75,0 Q 73,28 68,55" 
          stroke="#3d3d3d" 
          strokeWidth="1.8" 
          fill="none" 
          strokeLinecap="round"
        />
      </svg>

      {/* B. Metallic Badge Clip */}
      <div 
        className="w-5 h-2.5 bg-gradient-to-b from-[#6b7280] via-[#9ca3af] to-[#4b5563] border border-white/10 rounded-[1px] relative shadow-md"
        style={{ marginTop: '-2px', zIndex: 2 }}
      />

      {/* C. ID Card Body - Drag/touch target */}
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
        className="relative cursor-grab active:cursor-grabbing transition-transform duration-300 pointer-events-auto mix-blend-screen touch-none will-change-transform"
        style={{
          width: '100px',
          height: '142px',
          marginTop: '-1px',
          transformStyle: 'preserve-3d',
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
  );
}
