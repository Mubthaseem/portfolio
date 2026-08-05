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
  const [glarePos, setGlarePos] = useState({ x: 0, y: 0 });

  // Physics refs
  const swingAngle = useRef(0);
  const swingVelocity = useRef(0);
  const mouseForce = useRef(0);
  const scrollForce = useRef(0);
  
  // Previous states for delta tracking
  const prevMouseX = useRef<number | null>(null);
  const prevScrollY = useRef(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Entrance animation using GSAP (String appears, card drops and swings)
    gsap.fromTo(container, 
      { y: -300, rotate: 22 }, 
      { 
        y: 0, 
        rotate: 0, 
        duration: 1.8, 
        ease: "elastic.out(1.1, 0.55)",
        onComplete: () => {
          // Initialize prevScrollY to prevent massive jump on load
          prevScrollY.current = window.scrollY;
        }
      }
    );

    // 2. Physics & Animation loop
    let animationFrameId: number;
    let time = 0;

    const updatePhysics = () => {
      time += 0.015;

      // A. Constant tiny idle pendulum movement (-2deg to 2deg, 4s cycle)
      // We use Math.sin to oscillate smoothly
      const idleAngle = Math.sin(time * (Math.PI / 2)) * 1.8;

      // B. Spring solver parameters
      const stiffness = 0.08;
      const damping = 0.92;

      // Decay the interactive forces over time
      mouseForce.current *= 0.92;
      scrollForce.current *= 0.90;

      // Target angle combines idle swing + scroll force + mouse momentum force
      const targetAngle = idleAngle + mouseForce.current + scrollForce.current;

      // Spring physics equation (Verlet-style)
      const acceleration = (targetAngle - swingAngle.current) * stiffness;
      swingVelocity.current = (swingVelocity.current + acceleration) * damping;
      swingAngle.current += swingVelocity.current;

      // Apply the physics transform to the container (pivoted from the top anchor point)
      if (container) {
        // Also add a tiny vertical lift (y) and shift (x) matching the swing angle for real physical motion
        const swingRad = (swingAngle.current * Math.PI) / 180;
        const liftY = (1 - Math.cos(swingRad)) * 60; // Lift card slightly when swinging high
        const shiftX = Math.sin(swingRad) * 45;      // Pendulum x displacement
        
        container.style.transform = `translate3d(${shiftX}px, ${liftY}px, 0) rotate(${swingAngle.current}deg)`;
      }

      animationFrameId = requestAnimationFrame(updatePhysics);
    };

    animationFrameId = requestAnimationFrame(updatePhysics);

    // 3. Mouse Velocity Tracker (Momentum opposite to cursor direction)
    const handleMouseMoveGlobal = (e: MouseEvent) => {
      if (prevMouseX.current !== null) {
        const deltaX = e.clientX - prevMouseX.current;
        // Move opposite to cursor direction, scaled appropriately
        mouseForce.current -= deltaX * 0.12;
        // Clamp to prevent wild spinning
        mouseForce.current = Math.min(15, Math.max(-15, mouseForce.current));
      }
      prevMouseX.current = e.clientX;
    };

    // 4. Scroll Momentum Tracker (Sways slightly upward on scroll)
    const handleScrollGlobal = () => {
      const pane = document.querySelector('.scroll-pane');
      const currentScroll = pane ? pane.scrollTop : window.scrollY;
      const deltaY = currentScroll - prevScrollY.current;

      if (Math.abs(deltaY) > 0.5) {
        // Swing up (max 5deg, max 8px movement translated through forces)
        const direction = deltaY > 0 ? 1 : -1;
        scrollForce.current += direction * Math.min(6, Math.abs(deltaY) * 0.08);
        scrollForce.current = Math.min(8, Math.max(-8, scrollForce.current));
      }
      prevScrollY.current = currentScroll;
    };

    window.addEventListener('mousemove', handleMouseMoveGlobal);
    // Listen to scroll events on both window and custom scroll pane
    window.addEventListener('scroll', handleScrollGlobal);
    const pane = document.querySelector('.scroll-pane');
    if (pane) {
      pane.addEventListener('scroll', handleScrollGlobal, { passive: true });
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMoveGlobal);
      window.removeEventListener('scroll', handleScrollGlobal);
      if (pane) {
        pane.removeEventListener('scroll', handleScrollGlobal);
      }
    };
  }, []);

  // 5. 3D Hover Tilt & Glare position calculations
  const handleMouseMoveCard = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left; // Mouse x position relative to card
    const y = e.clientY - rect.top;  // Mouse y position relative to card
    
    // Convert to normalized coordinates (-0.5 to 0.5)
    const px = x / rect.width - 0.5;
    const py = y / rect.height - 0.5;

    // Apply tilt (max rotateX: 3deg, max rotateY: 4deg)
    setTilt({
      x: -py * 6, // Tilt up/down
      y: px * 8   // Tilt left/right
    });

    // Map glare position (for reflection)
    setGlarePos({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100
    });
  };

  const handleMouseLeaveCard = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  // Render the shadow offset opposite to the swing angle for extra realism
  const shadowX = -Math.sin((swingAngle.current * Math.PI) / 180) * 18;
  const shadowY = 12 + Math.abs(swingAngle.current) * 0.5;

  return (
    <div 
      ref={containerRef}
      className="fixed top-0 z-40 flex flex-col items-center select-none will-change-transform"
      style={{ 
        left: `${leftOffset}px`,
        transformOrigin: '50% 0%', // Pivot from the top edge anchors
        width: '120px'
      }}
    >
      {/* A. Suspended Cords System (SVG Bezier Curves for organic tension) */}
      <svg width="120" height="55" className="overflow-visible pointer-events-none">
        {/* Left Cord */}
        <path 
          d="M 45,0 Q 47,28 52,55" 
          stroke="#3d3d3d" 
          strokeWidth="1.8" 
          fill="none" 
          strokeLinecap="round"
        />
        {/* Right Cord */}
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

      {/* C. Interactive Card Shadow (separated for realistic parallax movement) */}
      <div 
        className="absolute bg-black/80 rounded-[10px] pointer-events-none filter blur-[15px] transition-all duration-300"
        style={{
          width: '100px',
          height: '142px',
          top: '64px',
          left: '10px',
          opacity: 0.18,
          transform: `translate3d(${shadowX}px, ${shadowY}px, -20px) scale(${isHovered ? 1.02 : 1})`,
          zIndex: 0
        }}
      />

      {/* D. ID Card Body */}
      <div
        ref={cardRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseMove={handleMouseMoveCard}
        onMouseLeave={handleMouseLeaveCard}
        className="relative cursor-pointer transition-all duration-300 pointer-events-auto rounded-[10px] overflow-hidden bg-black border border-white/15"
        style={{
          width: '100px',
          height: '142px',
          marginTop: '-1px',
          transform: `perspective(500px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${isHovered ? 1.05 : 1})`,
          transformStyle: 'preserve-3d',
          boxShadow: isHovered 
            ? '0 0 20px rgba(77, 163, 255, 0.25), inset 0 0 10px rgba(77, 163, 255, 0.15)' 
            : '0 4px 12px rgba(0, 0, 0, 0.5)',
          filter: isHovered ? 'brightness(1.06)' : 'brightness(1.0)',
          willChange: 'transform, filter',
          zIndex: 1
        }}
      >
        {/* The PNG ID Card artwork */}
        <img 
          src="/IDCARD.png" 
          alt="ID Card Badge" 
          className="w-full h-full object-cover rounded-[10px] pointer-events-none"
        />

        {/* E. Laminated Plastic Reflection / Glare Effects */}
        
        {/* Interactive hover glare spotlight */}
        {isHovered && (
          <div 
            className="absolute inset-0 pointer-events-none mix-blend-overlay"
            style={{
              background: `radial-gradient(circle 75px at ${glarePos.x}% ${glarePos.y}%, rgba(255, 255, 255, 0.25) 0%, transparent 100%)`
            }}
          />
        )}

        {/* Ambient sweep reflection (travels across surface every 9 seconds) */}
        <div 
          className="absolute inset-0 pointer-events-none mix-blend-overlay animate-glare-sweep"
          style={{
            background: 'linear-gradient(135deg, transparent 35%, rgba(255, 255, 255, 0.08) 50%, transparent 65%)',
            backgroundSize: '300% 100%',
          }}
        />

        {/* F. Premium Laminated Plastic Scratches Overlay */}
        <div 
          className="absolute inset-0 opacity-[0.06] pointer-events-none bg-repeat"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
          }}
        />
      </div>

      {/* Styled animation keyframes for the glare sweep */}
      <style>{`
        @keyframes glareSweep {
          0% { background-position: -150% 0; }
          15% { background-position: 250% 0; }
          100% { background-position: 250% 0; }
        }
        .animate-glare-sweep {
          animation: glareSweep 9s linear infinite;
        }
      `}</style>
    </div>
  );
}
