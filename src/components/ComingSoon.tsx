import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, ExternalLink, Code2, Terminal, Cpu, Sparkles, Send, Mail, Globe, Share2,
  Layers, Activity, ShieldCheck, Download, Tv, Utensils, ChevronRight, Zap, Radio, X
} from 'lucide-react';
// import PortraitReveal from './PortraitReveal';
import AvatarUnifiedScrubber from './AvatarUnifiedScrubber';

interface ComingSoonProps {
  isVisible: boolean;
}

// Authentic Tech Logo Map
const techIconMap: Record<string, string> = {
  React: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg',
  Flutter: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/flutter/flutter-original.svg',
  Dart: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/dart/dart-original.svg',
  TypeScript: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg',
  JavaScript: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg',
  'Node.js': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg',
  Supabase: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/supabase/supabase-original.svg',
  Firebase: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/firebase/firebase-plain.svg',
  MySQL: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg',
  PHP: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-original.svg',
  HTML5: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg',
  CSS3: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg',
  'Tailwind CSS': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg',
  GSAP: 'https://cdn.simpleicons.org/greensock/88CE02',
  'Framer Motion': 'https://cdn.simpleicons.org/framer/0055FF',
  WordPress: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/wordpress/wordpress-plain.svg',
  Git: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg',
  GitHub: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg',
  Cloudflare: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cloudflare/cloudflare-original.svg',
  Docker: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg',
  Figma: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg',
  Photoshop: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/photoshop/photoshop-original.svg',
  Illustrator: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/illustrator/illustrator-plain.svg',
  'After Effects': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/aftereffects/aftereffects-original.svg',
  'Premiere Pro': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/premierepro/premierepro-original.svg',
  Lightroom: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/photoshop/photoshop-original.svg',
  Canva: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/canva/canva-original.svg',
  'Android Studio': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/androidstudio/androidstudio-original.svg',
  'VS Code': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg',
  Xcode: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/xcode/xcode-original.svg',
  Linux: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linux/linux-original.svg',
  'Kali Linux': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kalilinux/kalilinux-original.svg',
  Windows: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/windows8/windows8-original.svg',
  Chrome: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/chrome/chrome-original.svg',
  CapCut: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/canva/canva-original.svg',
  Postman: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postman/postman-original.svg',
  Cursor: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg',
  Claude: 'https://cdn.simpleicons.org/anthropic/FFFFFF',
  ChatGPT: 'https://cdn.simpleicons.org/openai/FFFFFF',
  Gemini: 'https://cdn.simpleicons.org/google/4285F4'
};

// Tech Stack Data Definition
interface TechItem {
  name: string;
  category: 'Frontend' | 'Mobile' | 'Backend' | 'Design' | 'DevOps' | 'Security';
  years: number;
  projects: number;
  confidence: number;
  color: string;
}

const techStack: TechItem[] = [
  { name: 'React', category: 'Frontend', years: 4, projects: 22, confidence: 95, color: '#61DAFB' },
  { name: 'Flutter', category: 'Mobile', years: 3, projects: 15, confidence: 92, color: '#02569B' },
  { name: 'Dart', category: 'Mobile', years: 3, projects: 15, confidence: 90, color: '#0175C2' },
  { name: 'TypeScript', category: 'Frontend', years: 3, projects: 18, confidence: 92, color: '#3178C6' },
  { name: 'JavaScript', category: 'Frontend', years: 4, projects: 25, confidence: 95, color: '#F7DF1E' },
  { name: 'Node.js', category: 'Backend', years: 3, projects: 14, confidence: 88, color: '#339933' },
  { name: 'Supabase', category: 'Backend', years: 2, projects: 10, confidence: 85, color: '#3ECF8E' },
  { name: 'Firebase', category: 'Backend', years: 3, projects: 12, confidence: 88, color: '#FFCA28' },
  { name: 'MySQL', category: 'Backend', years: 3, projects: 11, confidence: 82, color: '#4479A1' },
  { name: 'PHP', category: 'Backend', years: 3, projects: 9, confidence: 80, color: '#777BB4' },
  { name: 'HTML5', category: 'Frontend', years: 5, projects: 30, confidence: 98, color: '#E34F26' },
  { name: 'CSS3', category: 'Frontend', years: 5, projects: 30, confidence: 95, color: '#1572B6' },
  { name: 'Tailwind CSS', category: 'Frontend', years: 3, projects: 20, confidence: 96, color: '#06B6D4' },
  { name: 'GSAP', category: 'Frontend', years: 2, projects: 8, confidence: 85, color: '#88CE02' },
  { name: 'Framer Motion', category: 'Frontend', years: 2, projects: 12, confidence: 90, color: '#0055FF' },
  { name: 'WordPress', category: 'Frontend', years: 3, projects: 14, confidence: 85, color: '#21759B' },
  { name: 'Git', category: 'DevOps', years: 4, projects: 28, confidence: 92, color: '#F05032' },
  { name: 'GitHub', category: 'DevOps', years: 4, projects: 28, confidence: 94, color: '#FFFFFF' },
  { name: 'Cloudflare', category: 'DevOps', years: 2, projects: 8, confidence: 82, color: '#F38020' },
  { name: 'Docker', category: 'DevOps', years: 1, projects: 4, confidence: 75, color: '#2496ED' },
  { name: 'Figma', category: 'Design', years: 4, projects: 26, confidence: 94, color: '#F24E1E' },
  { name: 'Photoshop', category: 'Design', years: 4, projects: 20, confidence: 88, color: '#31A8FF' },
  { name: 'Illustrator', category: 'Design', years: 3, projects: 15, confidence: 85, color: '#FF9A00' },
  { name: 'After Effects', category: 'Design', years: 2, projects: 8, confidence: 80, color: '#9999FF' },
  { name: 'Premiere Pro', category: 'Design', years: 3, projects: 12, confidence: 82, color: '#9999FF' },
  { name: 'Lightroom', category: 'Design', years: 3, projects: 15, confidence: 85, color: '#31A8FF' },
  { name: 'Canva', category: 'Design', years: 4, projects: 30, confidence: 95, color: '#00C4CC' },
  { name: 'Android Studio', category: 'Mobile', years: 3, projects: 14, confidence: 88, color: '#3DDC84' },
  { name: 'VS Code', category: 'DevOps', years: 5, projects: 35, confidence: 98, color: '#007ACC' },
  { name: 'Xcode', category: 'Mobile', years: 2, projects: 6, confidence: 78, color: '#147EFB' },
  { name: 'Linux', category: 'Security', years: 3, projects: 16, confidence: 88, color: '#FCC624' },
  { name: 'Kali Linux', category: 'Security', years: 2, projects: 10, confidence: 85, color: '#557C93' },
  { name: 'Windows', category: 'Security', years: 5, projects: 40, confidence: 98, color: '#0078D6' },
];

const workspaceTools = [
  'VS Code', 'Android Studio', 'GitHub', 'Chrome', 'Figma', 'Photoshop',
  'Illustrator', 'Premiere', 'After Effects', 'CapCut', 'Docker', 'Postman',
  'Supabase', 'Cloudflare', 'Cursor', 'Claude', 'ChatGPT', 'Gemini'
];

const projectsData = [
  {
    id: 1,
    title: 'ZetaSports',
    subtitle: 'Live Sports Streaming Platform',
    tech: ['Flutter', 'Supabase', 'Cloudflare', 'HLS', 'JW Player'],
    desc: 'A next-generation sports streaming ecosystem delivering real-time HD match streams, dynamic ads, and live score telemetry.',
    highlight: 'High-Scale Streaming'
  },
  {
    id: 2,
    title: 'ZARC ADS',
    subtitle: 'Smart TV Advertisement System',
    tech: ['Flutter', 'Android TV', 'Supabase', 'Offline Cache'],
    desc: 'Autonomous Smart TV ad dispatch software featuring scheduled video ad campaigns, offline media buffering, and analytical telemetry.',
    highlight: 'Smart TV OS'
  },
  {
    id: 3,
    title: 'BOCA CHICKEN',
    subtitle: 'Restaurant Branding & Digital Suite',
    tech: ['Branding', 'Marketing', 'Website', 'Motion Graphics'],
    desc: 'Comprehensive brand identity, custom website, interactive digital menus, and promotional video motion graphics.',
    highlight: 'Brand Identity'
  },
  {
    id: 4,
    title: 'Restaurant Finance',
    subtitle: 'Tally-inspired Accounting Software',
    tech: ['PHP', 'MySQL', 'Desktop App', 'Financial Analytics'],
    desc: 'Dedicated desktop financial accounting software engineered for multi-branch restaurant chains with inventory and ledger tracking.',
    highlight: 'Desktop Software'
  }
];

export default function ComingSoon({ isVisible }: ComingSoonProps) {
  const [activeNav, setActiveNav] = useState('home');
  const [hoveredTech, setHoveredTech] = useState<TechItem | null>(null);
  const [activeProjectModal, setActiveProjectModal] = useState<number | null>(null);
  const [connectionEstablished, setConnectionEstablished] = useState(false);

  const [scrollProgress, setScrollProgress] = useState(0);
  const scrollPaneRef = useRef<HTMLDivElement>(null);
  const scrollPosRef = useRef(0); // track raw position via ref for instant reads

  useEffect(() => {
    const updateScrollState = (scrollTop: number) => {
      const pane = scrollPaneRef.current;
      if (!pane) return;
      const maxScroll = pane.scrollHeight - pane.clientHeight;
      const progress = maxScroll > 0 ? Math.min(1, Math.max(0, scrollTop / maxScroll)) : 0;
      scrollPosRef.current = scrollTop;
      setScrollProgress(progress);

      const sections = ['home', 'who-i-am', 'tech-stack', 'what-i-build', 'projects', 'tools', 'status', 'contact'];
      sections.forEach((sec) => {
        const el = document.getElementById(sec);
        if (el) {
          const top = el.offsetTop - 220;
          const height = el.offsetHeight;
          if (scrollTop >= top && scrollTop < top + height) {
            setActiveNav(sec);
          }
        }
      });
    };

    const handleScroll = () => {
      const pane = scrollPaneRef.current;
      if (pane) updateScrollState(pane.scrollTop);
    };

    const pane = scrollPaneRef.current;
    if (pane) {
      pane.addEventListener('scroll', handleScroll, { passive: true });
    }

    return () => {
      if (pane) {
        pane.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  const triggerConnectionEstablish = () => {
    setConnectionEstablished(true);
    setTimeout(() => setConnectionEstablished(false), 6000);
  };

  if (!isVisible) return null;

  const activeProj = projectsData.find((p) => p.id === activeProjectModal);

  const navItems = [
    { id: 'home', label: 'HOME' },
    { id: 'who-i-am', label: 'WHO I AM' },
    { id: 'tech-stack', label: 'STACK' },
    { id: 'what-i-build', label: 'BUILD' },
    { id: 'projects', label: 'PROJECTS' },
    { id: 'tools', label: 'TOOLS' },
    { id: 'status', label: 'STATUS' },
    { id: 'contact', label: 'CONTACT' },
  ];

  // Scrubber opacity: active everywhere, smoothly fades out near Contact section
  const scrubberOpacity = scrollProgress >= 0.92
    ? Math.max(0, 1 - (scrollProgress - 0.92) / 0.08)
    : 1;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5, ease: 'easeInOut' }}
      className="fixed inset-0 w-screen h-screen bg-transparent z-10 overflow-hidden select-none"
    >
      {/* STATIC PORTRAIT (TURNED OFF — UNCOMMENT WHENEVER NEEDED) */}
      {/* 
      <div className="fixed inset-0 w-full h-full z-10 pointer-events-none md:pointer-events-auto">
        <PortraitReveal 
          scrollProgress={scrollProgress} 
          isFrozen={isFrozen}
          opacity={portraitOpacity}
        />
      </div>
      */}

      {/* UNIFIED AVATAR SCRUBBER — Hardware GPU video seeking on mobile phones (15MB RAM), GIF canvas on desktop */}
      <AvatarUnifiedScrubber
        scrollProgress={scrollProgress}
        opacity={scrubberOpacity}
        className="z-20 mix-blend-screen"
      />

      {/* FIXED TOP HEADER & NAVIGATION OS BAR */}
      <div className="fixed top-0 left-0 w-full z-40 p-3 sm:p-6 md:p-10 flex flex-col sm:flex-row gap-2 sm:gap-0 justify-between items-start sm:items-center pointer-events-none bg-gradient-to-b from-black/90 via-black/40 to-transparent">
        {/* Logo top left */}
        <div className="font-sans font-bold text-xl sm:text-2xl text-white tracking-wider flex items-center pointer-events-auto shrink-0 pl-1">
          M<span className="text-primary text-2xl sm:text-3xl leading-none">.</span>
        </div>

        {/* Desktop Top Navbar OS Ribbon */}
        <div className="hidden lg:flex items-center gap-5 font-mono text-[10px] tracking-[0.18em] uppercase pointer-events-auto bg-black/60 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/10 shadow-2xl">
          {navItems.map((nav) => (
            <a
              key={nav.id}
              href={`#${nav.id}`}
              onClick={() => setActiveNav(nav.id)}
              className={`transition-all duration-200 relative pb-0.5 ${
                activeNav === nav.id ? 'text-primary font-bold' : 'text-secondary hover:text-white'
              }`}
            >
              {nav.label}
              {activeNav === nav.id && (
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-primary shadow-[0_0_8px_#4DA3FF]"></span>
              )}
            </a>
          ))}
        </div>

        {/* Mobile Horizontal Scrollable Ribbon Navbar */}
        <div className="flex lg:hidden items-center gap-3 overflow-x-auto font-mono text-[9px] tracking-wider uppercase pointer-events-auto bg-black/90 backdrop-blur-xl px-3.5 py-1.5 rounded-full border border-white/10 max-w-[calc(100vw-32px)] whitespace-nowrap scrollbar-none shadow-2xl">
          {navItems.map((nav) => (
            <a
              key={nav.id}
              href={`#${nav.id}`}
              onClick={() => setActiveNav(nav.id)}
              className={`transition-all duration-200 ${
                activeNav === nav.id ? 'text-primary font-bold border-b border-primary pb-0.5' : 'text-white/70 hover:text-white'
              }`}
            >
              {nav.label}
            </a>
          ))}
        </div>
      </div>

      {/* SCROLLABLE CONTENT CONTAINER */}
      <div 
        ref={scrollPaneRef}
        className="scroll-pane fixed inset-0 w-full h-full z-30 overflow-y-auto scroll-smooth pointer-events-auto px-4 sm:px-6 md:pr-14 md:pl-14 pt-20 sm:pt-24 md:pt-28 pb-16"
      >
        <div className="flex flex-col gap-20 sm:gap-28 md:gap-36 w-full md:max-w-[650px] mx-auto md:ml-auto md:mr-0 pointer-events-auto">
          
          {/* ====================================================
              HERO / HOME SECTION
             ==================================================== */}
          <section id="home" className="min-h-[70vh] sm:min-h-[75vh] flex flex-col justify-center items-start pt-4 sm:pt-6">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="font-mono text-[10px] sm:text-xs text-primary tracking-[0.3em] uppercase mb-3 sm:mb-4 flex items-center gap-2"
            >
              <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
              SYSTEM INITIALIZED // HELLO, I'M
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 1.0, ease: 'easeOut' }}
              className="font-['Syncopate'] font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-[0.02em] text-white uppercase mb-3 sm:mb-4 leading-none w-full break-words"
              style={{
                textShadow: '0 0 35px rgba(77, 163, 255, 0.35), 0 0 10px rgba(255, 255, 255, 0.7)'
              }}
            >
              MUBTHASEEM<span className="text-primary font-black">.</span>
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="font-mono text-xs sm:text-sm md:text-base text-primary tracking-[0.3em] uppercase mb-5 sm:mb-6 font-semibold"
            >
              CREATIVE DEVELOPER
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 1.0 }}
              className="font-sans text-sm sm:text-base md:text-lg leading-relaxed text-secondary font-light max-w-[480px] mb-6 sm:mb-8"
            >
              Building intelligent digital experiences with code, design & innovation.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.8 }}
              className="flex flex-wrap items-center gap-3 sm:gap-4"
            >
              <a
                href="#projects"
                onClick={() => setActiveNav('projects')}
                className="px-5 sm:px-6 py-2.5 sm:py-3 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/40 rounded-sm font-mono text-[11px] sm:text-xs tracking-[0.2em] uppercase transition-all duration-300 shadow-[0_0_15px_rgba(77,163,255,0.2)] flex items-center gap-2"
              >
                <span>EXPLORE WORK</span>
                <ExternalLink size={14} />
              </a>
              <a
                href="#contact"
                onClick={() => setActiveNav('contact')}
                className="px-5 sm:px-6 py-2.5 sm:py-3 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 rounded-sm font-mono text-[11px] sm:text-xs tracking-[0.2em] uppercase transition-all duration-300"
              >
                GET IN TOUCH
              </a>
            </motion.div>
          </section>

          {/* ====================================================
              SECTION 01: WHO AM I
             ==================================================== */}
          <section id="who-i-am" className="flex flex-col gap-6 sm:gap-8 pt-4 sm:pt-6">
            <div className="flex items-center gap-2.5 font-mono text-[10px] sm:text-xs text-primary tracking-[0.25em] uppercase">
              <Terminal size={15} />
              <span>[ SECTION 01 // IDENTITY LOGS ]</span>
            </div>
            
            <h2 className="font-['Syncopate'] text-xl sm:text-2xl md:text-4xl font-bold text-white tracking-wider">
              WHO I AM
            </h2>

            {/* Terminal Style Roles Cards */}
            <div className="p-4 sm:p-6 bg-black/60 md:bg-black/50 backdrop-blur-md border border-white/10 rounded-xl flex flex-col gap-3.5 sm:gap-4 shadow-2xl relative overflow-hidden group">
              <div className="flex justify-between items-center border-b border-white/10 pb-3 font-mono text-[9px] sm:text-[10px] text-secondary">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500/80"></span>
                  <span className="w-2 h-2 rounded-full bg-yellow-500/80"></span>
                  <span className="w-2 h-2 rounded-full bg-green-500/80"></span>
                  <span className="ml-1.5 text-white/60">identity_profile.sh</span>
                </div>
                <span className="text-primary font-bold">[ EXECUTE ]</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 pt-1 font-mono text-xs">
                {[
                  'MUBTHASEEM',
                  'Creative Developer',
                  'Frontend Engineer',
                  'UI Motion Designer',
                  'Flutter Developer',
                  'React Developer',
                  'AI Workflow Builder',
                  'Cybersecurity Student',
                  'Digital Brand Designer'
                ].map((role, idx) => (
                  <motion.div
                    key={role}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04, duration: 0.4 }}
                    viewport={{ once: true }}
                    className="p-2.5 sm:p-3 bg-white/5 hover:bg-primary/10 border border-white/10 hover:border-primary/40 rounded-md text-text-main flex items-center gap-2 transition-all duration-300"
                  >
                    <span className="text-primary font-bold">&gt;</span>
                    <span className={idx === 0 ? 'text-highlight font-bold tracking-wider' : 'text-white/90'}>
                      {role}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Animated Interactive Timeline */}
            <div className="flex flex-col gap-3.5 sm:gap-4 pt-2 sm:pt-4">
              <h3 className="font-mono text-[10px] sm:text-xs text-secondary tracking-[0.2em] uppercase">
                // CHRONOLOGICAL EVOLUTION
              </h3>

              <div className="relative border-l-2 border-primary/30 pl-4 sm:pl-6 ml-2 sm:ml-3 flex flex-col gap-4 sm:gap-6">
                {[
                  { year: '2021', text: 'Started learning Web Development' },
                  { year: '2022', text: 'Started designing brands' },
                  { year: '2023', text: 'Entered Flutter Development' },
                  { year: '2024', text: 'Built streaming platforms' },
                  { year: '2025', text: 'Learning AI workflows' },
                  { year: '2026', text: 'Building intelligent digital experiences' },
                ].map((item, idx) => (
                  <motion.div
                    key={item.year}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.08, duration: 0.5 }}
                    viewport={{ once: true }}
                    className="relative flex flex-col gap-1 p-3.5 sm:p-4 bg-black/60 md:bg-black/40 backdrop-blur-md border border-white/10 hover:border-primary/40 rounded-lg transition-all duration-300 group"
                  >
                    <div className="absolute -left-[23px] sm:-left-[31px] top-4 sm:top-5 w-3.5 sm:w-4 h-3.5 sm:h-4 rounded-full bg-black border-2 border-primary group-hover:bg-primary group-hover:shadow-[0_0_10px_#4DA3FF] transition-all duration-300"></div>
                    
                    <div className="font-mono text-xs font-bold text-primary tracking-widest flex items-center gap-2">
                      <span>{item.year}</span>
                      {idx === 5 && (
                        <span className="text-[8px] sm:text-[9px] bg-primary/20 border border-primary/30 text-highlight px-2 py-0.5 rounded-full">CURRENT</span>
                      )}
                    </div>
                    <p className="font-sans text-xs sm:text-sm text-white/90 font-light">
                      {item.text}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* ====================================================
              SECTION 02: MY TECH STACK
             ==================================================== */}
          <section id="tech-stack" className="flex flex-col gap-6 sm:gap-8 pt-4 sm:pt-6">
            <div className="flex items-center gap-2.5 font-mono text-[10px] sm:text-xs text-primary tracking-[0.25em] uppercase">
              <Cpu size={15} />
              <span>[ SECTION 02 // NEURAL MODULES ]</span>
            </div>

            <h2 className="font-['Syncopate'] text-xl sm:text-2xl md:text-4xl font-bold text-white tracking-wider">
              TECH STACK
            </h2>

            <p className="font-sans text-xs sm:text-sm text-secondary font-light">
              Tap or hover over any node to inspect real-time experience metrics, confidence rating, and project telemetry.
            </p>

            {/* Tech Stack Floating Grid with Official Logos */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-3.5 relative">
              {techStack.map((tech) => (
                <motion.div
                  key={tech.name}
                  whileHover={{ y: -4, scale: 1.02 }}
                  onClick={() => setHoveredTech(hoveredTech?.name === tech.name ? null : tech)}
                  onMouseEnter={() => setHoveredTech(tech)}
                  onMouseLeave={() => setHoveredTech(null)}
                  className="p-3 sm:p-4 bg-black/60 md:bg-black/40 backdrop-blur-md border border-white/10 hover:border-primary/50 rounded-xl flex flex-col justify-between gap-2.5 sm:gap-3 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-[0_0_20px_rgba(77,163,255,0.25)] group relative overflow-hidden"
                >
                  <div className="flex justify-between items-center">
                    {techIconMap[tech.name] ? (
                      <img 
                        src={techIconMap[tech.name]} 
                        alt={tech.name} 
                        className="w-5 h-5 sm:w-6 sm:h-6 object-contain filter drop-shadow-[0_0_8px_rgba(77,163,255,0.4)] group-hover:scale-110 transition-transform" 
                      />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-primary/60 group-hover:bg-primary"></span>
                    )}
                    <span className="font-mono text-[7.5px] sm:text-[8px] text-secondary tracking-wider uppercase">{tech.category}</span>
                  </div>

                  <div className="font-sans font-bold text-xs sm:text-sm text-white group-hover:text-primary transition-colors truncate">
                    {tech.name}
                  </div>

                  <div className="flex justify-between items-center font-mono text-[8.5px] sm:text-[9px] text-secondary border-t border-white/10 pt-1.5 sm:pt-2">
                    <span>{tech.years} YRS</span>
                    <span className="text-primary font-bold">{tech.confidence}%</span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Hover Detailed Metrics Floating Inspector Box */}
            <AnimatePresence>
              {hoveredTech && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="p-4 sm:p-5 bg-black/90 backdrop-blur-xl border border-primary/40 rounded-xl flex items-center justify-between shadow-[0_0_25px_rgba(77,163,255,0.3)] mt-1 sm:mt-2"
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    {techIconMap[hoveredTech.name] && (
                      <img 
                        src={techIconMap[hoveredTech.name]} 
                        alt={hoveredTech.name} 
                        className="w-8 h-8 sm:w-10 sm:h-10 object-contain filter drop-shadow-[0_0_12px_rgba(77,163,255,0.6)]" 
                      />
                    )}
                    <div className="flex flex-col gap-0.5 sm:gap-1">
                      <span className="font-mono text-[8px] sm:text-[9px] text-primary tracking-[0.2em] uppercase">[ MODULE INSPECTOR ]</span>
                      <span className="font-sans font-bold text-sm sm:text-lg text-white">{hoveredTech.name}</span>
                      <span className="font-mono text-[10px] sm:text-xs text-secondary">{hoveredTech.years} Yrs • {hoveredTech.projects} Projects</span>
                    </div>
                  </div>

                  {/* Animated Progress Ring */}
                  <div className="flex items-center gap-2">
                    <div className="relative w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="20" cy="20" r="15" stroke="rgba(255,255,255,0.1)" strokeWidth="3" fill="none" className="sm:hidden" />
                        <circle 
                          cx="20" cy="20" r="15" 
                          stroke="#4DA3FF" 
                          strokeWidth="3" 
                          fill="none" 
                          strokeDasharray={94}
                          strokeDashoffset={94 - (94 * hoveredTech.confidence) / 100}
                          className="sm:hidden transition-all duration-700 ease-out"
                        />

                        <circle cx="24" cy="24" r="18" stroke="rgba(255,255,255,0.1)" strokeWidth="3" fill="none" className="hidden sm:block" />
                        <circle 
                          cx="24" cy="24" r="18" 
                          stroke="#4DA3FF" 
                          strokeWidth="3" 
                          fill="none" 
                          strokeDasharray={113}
                          strokeDashoffset={113 - (113 * hoveredTech.confidence) / 100}
                          className="hidden sm:block transition-all duration-700 ease-out"
                        />
                      </svg>
                      <span className="absolute font-mono text-[8px] sm:text-[9px] font-bold text-white">{hoveredTech.confidence}%</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          {/* ====================================================
              SECTION 03: WHAT I BUILD
             ==================================================== */}
          <section id="what-i-build" className="flex flex-col gap-6 sm:gap-8 pt-4 sm:pt-6">
            <div className="flex items-center gap-2.5 font-mono text-[10px] sm:text-xs text-primary tracking-[0.25em] uppercase">
              <Layers size={15} />
              <span>[ SECTION 03 // ARCHITECTURAL OUTPUT ]</span>
            </div>

            <h2 className="font-['Syncopate'] text-xl sm:text-2xl md:text-4xl font-bold text-white tracking-wider">
              WHAT I BUILD
            </h2>

            {/* Horizontal Bento Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
              {[
                { title: 'Sports Streaming Platforms', desc: 'Low-latency HLS video delivery, live chat, and adaptive bitrate engines.', icon: Tv },
                { title: 'Android Applications', desc: 'Native high-performance mobile software built for responsiveness.', icon: Activity },
                { title: 'Flutter Apps', desc: 'Cross-platform mobile applications with 60 FPS custom animations.', icon: Code2 },
                { title: 'Restaurant POS', desc: 'Tally-inspired desktop & Web POS with real-time analytics & inventory.', icon: Utensils },
                { title: 'Advertising Platforms', desc: 'Smart TV ad insertion systems with offline caching and remote sync.', icon: Radio },
                { title: 'Portfolio Websites', desc: 'Interactive 3D WebGL experiences with GSAP animation pipelines.', icon: Sparkles },
                { title: 'Admin Dashboards', desc: 'Dark-mode analytical control panels with real-time data telemetry.', icon: ShieldCheck },
                { title: 'AI Tools', desc: 'Custom AI workflow integrations, dynamic prompts, and automation scripts.', icon: Cpu },
              ].map((item, idx) => (
                <motion.div
                  key={item.title}
                  whileHover={{ scale: 1.01 }}
                  className="p-5 sm:p-6 bg-black/60 md:bg-black/40 backdrop-blur-md border border-white/10 hover:border-primary/40 rounded-xl flex flex-col justify-between gap-3 sm:gap-4 transition-all duration-300 group shadow-lg"
                >
                  <div className="flex justify-between items-start">
                    <div className="p-2.5 sm:p-3 bg-primary/10 border border-primary/20 rounded-lg text-primary group-hover:scale-110 transition-transform">
                      <item.icon size={18} />
                    </div>
                    <span className="font-mono text-[8.5px] sm:text-[9px] text-secondary">0{idx + 1}</span>
                  </div>

                  <div>
                    <h3 className="font-sans font-bold text-sm sm:text-base text-white group-hover:text-primary transition-colors mb-1">
                      {item.title}
                    </h3>
                    <p className="font-sans text-xs text-secondary font-light leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* ====================================================
              SECTION 04: FEATURED PROJECTS
             ==================================================== */}
          <section id="projects" className="flex flex-col gap-6 sm:gap-8 pt-4 sm:pt-6">
            <div className="flex items-center gap-2.5 font-mono text-[10px] sm:text-xs text-primary tracking-[0.25em] uppercase">
              <Code2 size={15} />
              <span>[ SECTION 04 // FEATURED WORKS ]</span>
            </div>

            <h2 className="font-['Syncopate'] text-xl sm:text-2xl md:text-4xl font-bold text-white tracking-wider">
              FEATURED PROJECTS
            </h2>

            {/* Apple VisionOS-inspired Project Cards */}
            <div className="flex flex-col gap-4 sm:gap-6">
              {projectsData.map((proj) => (
                <motion.div
                  key={proj.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true }}
                  onClick={() => setActiveProjectModal(proj.id)}
                  className="p-5 sm:p-7 bg-black/60 md:bg-black/40 backdrop-blur-md border border-white/10 hover:border-primary/50 rounded-xl sm:rounded-2xl flex flex-col gap-3 sm:gap-4 transition-all duration-300 group cursor-pointer shadow-2xl relative overflow-hidden"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-[8px] sm:text-[9px] text-primary tracking-[0.2em] uppercase bg-primary/10 border border-primary/20 px-2.5 py-0.5 sm:py-1 rounded-full">
                      {proj.highlight}
                    </span>
                    <span className="font-mono text-[11px] sm:text-xs text-secondary group-hover:text-primary transition-colors flex items-center gap-1">
                      <span>INSPECT</span>
                      <ChevronRight size={13} />
                    </span>
                  </div>

                  <div>
                    <h3 className="font-['Syncopate'] text-base sm:text-xl font-bold text-white group-hover:text-primary transition-colors mb-0.5 sm:mb-1">
                      {proj.title}
                    </h3>
                    <p className="font-mono text-[11px] sm:text-xs text-secondary">{proj.subtitle}</p>
                  </div>

                  <p className="font-sans text-xs sm:text-sm text-white/80 font-light leading-relaxed">
                    {proj.desc}
                  </p>

                  <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-2 border-t border-white/10">
                    {proj.tech.map((t) => (
                      <span key={t} className="font-mono text-[8.5px] sm:text-[9px] text-secondary bg-white/5 border border-white/10 px-2 py-0.5 rounded-sm flex items-center gap-1">
                        {techIconMap[t] && (
                          <img src={techIconMap[t]} alt={t} className="w-2.5 h-2.5 object-contain" />
                        )}
                        <span>{t}</span>
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* ====================================================
              SECTION 05: TOOLS I USE
             ==================================================== */}
          <section id="tools" className="flex flex-col gap-6 sm:gap-8 pt-4 sm:pt-6">
            <div className="flex items-center gap-2.5 font-mono text-[10px] sm:text-xs text-primary tracking-[0.25em] uppercase">
              <Zap size={15} />
              <span>[ SECTION 05 // ORBITING WORKSPACE ]</span>
            </div>

            <h2 className="font-['Syncopate'] text-xl sm:text-2xl md:text-4xl font-bold text-white tracking-wider">
              TOOLS I USE
            </h2>

            <p className="font-sans text-xs sm:text-sm text-secondary font-light">
              Interactive floating software suite used for engineering, design, and AI automation.
            </p>

            {/* Orbiting Floating Workspace Badge Grid with Authentic SVG Logos */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-3">
              {workspaceTools.map((tool, idx) => (
                <motion.div
                  key={tool}
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 3 + (idx % 4), repeat: Infinity, ease: 'easeInOut' }}
                  whileHover={{ scale: 1.08, zIndex: 10 }}
                  className="p-2.5 sm:p-3.5 bg-black/60 md:bg-black/40 backdrop-blur-md border border-white/10 hover:border-primary/50 rounded-xl flex flex-col items-center justify-center gap-1.5 sm:gap-2.5 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-[0_0_20px_rgba(77,163,255,0.35)] group"
                >
                  {techIconMap[tool] ? (
                    <img 
                      src={techIconMap[tool]} 
                      alt={tool} 
                      className="w-5 h-5 sm:w-7 sm:h-7 object-contain filter drop-shadow-[0_0_8px_rgba(77,163,255,0.5)] group-hover:scale-110 transition-transform" 
                    />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/60"></span>
                  )}
                  <span className="font-mono text-[8.5px] sm:text-[10px] text-white/90 text-center font-medium truncate w-full">{tool}</span>
                </motion.div>
              ))}
            </div>
          </section>

          {/* ====================================================
              SECTION 06: CURRENT STATUS
             ==================================================== */}
          <section id="status" className="flex flex-col gap-6 sm:gap-8 pt-4 sm:pt-6">
            <div className="flex items-center gap-2.5 font-mono text-[10px] sm:text-xs text-primary tracking-[0.25em] uppercase">
              <Activity size={15} />
              <span>[ SECTION 06 // SYSTEM METRICS ]</span>
            </div>

            <h2 className="font-['Syncopate'] text-xl sm:text-2xl md:text-4xl font-bold text-white tracking-wider">
              CURRENT STATUS
            </h2>

            {/* Futuristic Dashboard Card */}
            <div className="p-5 sm:p-7 bg-black/60 md:bg-black/50 backdrop-blur-md border border-white/10 rounded-xl sm:rounded-2xl flex flex-col gap-5 sm:gap-6 shadow-2xl">
              
              {/* Live Status Pill */}
              <div className="flex justify-between items-center border-b border-white/10 pb-3.5 sm:pb-4">
                <div className="flex items-center gap-2 font-mono text-[11px] sm:text-xs font-bold text-highlight">
                  <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-primary animate-ping"></span>
                  <span>SYSTEM STATUS: ONLINE</span>
                </div>
                <span className="font-mono text-[8px] sm:text-[9px] text-secondary">[ TELEMETRY ACTIVE ]</span>
              </div>

              {/* Status Categories */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                <div className="p-3.5 bg-white/5 border border-white/10 rounded-lg flex flex-col gap-1">
                  <span className="text-[8px] sm:text-[9px] text-primary uppercase tracking-wider">Current Focus</span>
                  <span className="text-white font-bold text-xs sm:text-sm">Building premium digital products.</span>
                </div>

                <div className="p-3.5 bg-white/5 border border-white/10 rounded-lg flex flex-col gap-1">
                  <span className="text-[8px] sm:text-[9px] text-primary uppercase tracking-wider">Learning</span>
                  <span className="text-white/90 font-medium text-xs">Advanced Motion, AI, Flutter, React, Security.</span>
                </div>

                <div className="p-3.5 bg-white/5 border border-white/10 rounded-lg flex flex-col gap-1">
                  <span className="text-[8px] sm:text-[9px] text-primary uppercase tracking-wider">Open To</span>
                  <span className="text-white/90 font-medium text-xs">Freelance, Startups & Collaborations.</span>
                </div>
              </div>

              {/* Animated Counters */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 border-t border-white/10 pt-4">
                {[
                  { label: 'Projects', count: '24+' },
                  { label: 'Clients', count: '18+' },
                  { label: 'Coffee', count: '1250+' },
                  { label: 'Lines of Code', count: '450k+' },
                ].map((stat) => (
                  <div key={stat.label} className="flex flex-col items-center justify-center p-2.5 sm:p-3 bg-primary/5 border border-primary/20 rounded-lg">
                    <span className="font-['Syncopate'] font-bold text-lg sm:text-2xl text-highlight">{stat.count}</span>
                    <span className="font-mono text-[8px] sm:text-[9px] text-secondary tracking-wider uppercase mt-1">{stat.label}</span>
                  </div>
                ))}
              </div>

            </div>
          </section>

          {/* ====================================================
              SECTION 07: CONTACT
             ==================================================== */}
          <section id="contact" className="flex flex-col gap-6 sm:gap-8 pt-4 sm:pt-6 pb-20 sm:pb-24">
            <div className="flex items-center gap-2.5 font-mono text-[10px] sm:text-xs text-primary tracking-[0.25em] uppercase">
              <Send size={15} />
              <span>[ SECTION 07 // INITIATE TRANSMISSION ]</span>
            </div>

            <h2 className="font-['Syncopate'] text-2xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight">
              LET'S BUILD SOMETHING INCREDIBLE.
            </h2>

            <div className="p-5 sm:p-8 bg-black/60 md:bg-black/50 backdrop-blur-md border border-white/10 rounded-xl sm:rounded-2xl flex flex-col gap-5 sm:gap-6 shadow-2xl">
              <p className="font-sans text-xs sm:text-base text-secondary font-light leading-relaxed">
                Ready to collaborate on a groundbreaking product or explore intelligent digital experiences? Initiate contact below.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 pt-1">
                <a
                  href="mailto:contact@mubthaseem.dev"
                  className="px-4 sm:px-5 py-2.5 sm:py-3 bg-primary text-black font-mono font-bold text-[11px] sm:text-xs tracking-[0.2em] uppercase rounded-sm flex items-center gap-2 hover:bg-highlight transition-colors shadow-[0_0_15px_rgba(77,163,255,0.4)]"
                >
                  <Mail size={15} />
                  <span>EMAIL</span>
                </a>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 sm:px-4 py-2.5 sm:py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-sm text-white font-mono text-[11px] sm:text-xs tracking-wider flex items-center gap-2 transition-colors"
                >
                  <Globe size={15} />
                  <span>GITHUB</span>
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 sm:px-4 py-2.5 sm:py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-sm text-white font-mono text-[11px] sm:text-xs tracking-wider flex items-center gap-2 transition-colors"
                >
                  <Share2 size={15} />
                  <span>LINKEDIN</span>
                </a>
                <a
                  href="#resume"
                  className="px-3.5 sm:px-4 py-2.5 sm:py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-sm text-white font-mono text-[11px] sm:text-xs tracking-wider flex items-center gap-2 transition-colors"
                >
                  <Download size={15} />
                  <span>RESUME</span>
                </a>
              </div>

              {/* Final Connection Establish Trigger */}
              <div className="pt-4 sm:pt-6 border-t border-white/10 flex flex-col gap-3.5 sm:gap-4">
                <button
                  onClick={triggerConnectionEstablish}
                  className="w-full py-3.5 sm:py-4 bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary font-mono text-[11px] sm:text-xs font-bold tracking-[0.25em] uppercase rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Radio size={15} className="animate-pulse" />
                  <span>[ ESTABLISH NEURAL LINK ]</span>
                </button>

                {connectionEstablished && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-3.5 sm:p-4 bg-primary/20 border border-primary/50 text-highlight font-mono text-[11px] sm:text-xs text-center rounded-lg shadow-[0_0_20px_rgba(77,163,255,0.4)]"
                  >
                    CONNECTION ESTABLISHED // THANK YOU FOR VISITING
                  </motion.div>
                )}

                <div className="flex items-center gap-2.5 text-[11px] sm:text-xs font-mono text-secondary pt-1">
                  <MapPin size={15} className="text-primary" />
                  <span>LOCATION: KERALA, INDIA</span>
                </div>
              </div>

            </div>
          </section>

        </div>
      </div>

      {/* Apple VisionOS Project Inspection Modal Overlay */}
      <AnimatePresence>
        {activeProj && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-6"
            onClick={() => setActiveProjectModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-black/90 border border-primary/40 p-5 sm:p-8 rounded-2xl sm:rounded-3xl max-w-xl w-[94vw] max-h-[85vh] overflow-y-auto flex flex-col gap-5 sm:gap-6 shadow-[0_0_50px_rgba(77,163,255,0.3)] relative"
            >
              <div className="flex justify-between items-start border-b border-white/10 pb-3.5 sm:pb-4">
                <div>
                  <span className="font-mono text-[8px] sm:text-[9px] text-primary tracking-[0.25em] uppercase">[ APPLE VISIONOS INSPECTOR ]</span>
                  <h3 className="font-['Syncopate'] text-lg sm:text-2xl font-bold text-white mt-1">{activeProj.title}</h3>
                  <p className="font-mono text-[11px] sm:text-xs text-secondary">{activeProj.subtitle}</p>
                </div>
                <button 
                  onClick={() => setActiveProjectModal(null)}
                  className="p-1.5 sm:p-2 bg-white/5 hover:bg-white/10 rounded-full text-white/80 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <p className="font-sans text-xs sm:text-sm text-secondary leading-relaxed">
                {activeProj.desc}
              </p>

              <div className="flex flex-col gap-2">
                <span className="font-mono text-[9px] sm:text-[10px] text-primary uppercase tracking-widest">// STACK TELEMETRY</span>
                <div className="flex flex-wrap gap-2">
                  {activeProj.tech.map((t) => (
                    <span key={t} className="font-mono text-[10px] sm:text-xs text-white bg-primary/20 border border-primary/30 px-3 py-1 rounded-full flex items-center gap-1.5">
                      {techIconMap[t] && (
                        <img src={techIconMap[t]} alt={t} className="w-3.5 h-3.5 object-contain" />
                      )}
                      <span>{t}</span>
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3.5 sm:pt-4 border-t border-white/10 flex justify-end">
                <button
                  onClick={() => setActiveProjectModal(null)}
                  className="px-5 sm:px-6 py-2 sm:py-2.5 bg-primary text-black font-mono text-[11px] sm:text-xs font-bold uppercase rounded-full hover:bg-highlight transition-colors"
                >
                  CLOSE INSPECTOR
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
