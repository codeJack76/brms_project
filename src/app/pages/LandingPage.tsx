"use client";

import { FileText, Users, Shield, Clock, TrendingUp, CheckCircle, BarChart, Lock, User, ChevronDown, Mail, AlertCircle, Loader2, X } from 'lucide-react';
import { useTheme } from "../context/ThemeContext";
import { useEffect, useState, useRef } from 'react';

interface LandingPageProps {
  onEnterSystem?: (email: string, name: string) => void;
  isAuthenticated?: boolean;
  userName?: string;
  onShowSignup?: () => void;
  onStartDemo?: () => void;
}

export default function LandingPage({ onEnterSystem, isAuthenticated = false, userName, onShowSignup, onStartDemo }: LandingPageProps) {
  const [scrolled, setScrolled] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  
  // Refs for sections to observe
  const heroRef = useRef<HTMLElement>(null);
  const benefitsRef = useRef<HTMLElement>(null);
  const featuresRef = useRef<HTMLElement>(null);
  const modulesRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleGetStarted = () => {
    if (isAuthenticated && onEnterSystem) {
      // If already logged in, directly enter the system
      onEnterSystem('', '');
    } else {
      // Show login modal for non-authenticated users
      setShowLoginModal(true);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoading(true);

    try {
      // Call backend API to handle authentication
      const response = await fetch('/api/auth/login-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setLoginError(data.error || 'Invalid email or password');
        setIsLoading(false);
        return;
      }

      // Redirect to home page (session will be detected automatically)
      window.location.href = '/';
    } catch (error) {
      console.error('Login error:', error);
      setLoginError('An error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  const closeLoginModal = () => {
    setShowLoginModal(false);
    setIsLoading(false);
    setEmail('');
    setPassword('');
    setLoginError('');
  };
 
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || window.pageYOffset;
      setScrolled(y > 20); // small threshold
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Inline CSS for benefits blob animations (kept here to avoid editing separate CSS file)
  const benefitsBlobStyles = `
  .benefits-blob { position: absolute; width: 420px; height: 420px; border-radius: 50%; filter: blur(60px); opacity: 0.6; transform: translate3d(0,0,0); will-change: transform; }
  .benefits-blob.blob-1 { background: radial-gradient(circle at 30% 30%, rgba(59,130,246,0.28), rgba(59,130,246,0.06)); top: -80px; left: -120px; }
  .benefits-blob.blob-2 { background: radial-gradient(circle at 70% 40%, rgba(16,185,129,0.22), rgba(16,185,129,0.04)); bottom: -100px; right: -140px; }
  .benefits-blob.blob-3 { background: radial-gradient(circle at 50% 50%, rgba(59,130,246,0.12), rgba(20,184,166,0.08)); top: 40%; right: 10%; opacity: 0.45; }
  
  @keyframes blob-float {
    0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
    25% { transform: translate3d(30px, -20px, 0) scale(1.05); }
    50% { transform: translate3d(-20px, 30px, 0) scale(0.95); }
    75% { transform: translate3d(25px, 15px, 0) scale(1.02); }
  }
  
  @keyframes blob-float-delayed {
    0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
    25% { transform: translate3d(-25px, 20px, 0) scale(1.03); }
    50% { transform: translate3d(30px, -25px, 0) scale(0.97); }
    75% { transform: translate3d(-20px, -15px, 0) scale(1.01); }
  }
  
  @keyframes blob-float-slow {
    0%, 100% { transform: translate3d(0, 0, 0) scale(1) rotate(0deg); }
    33% { transform: translate3d(20px, -30px, 0) scale(1.08) rotate(5deg); }
    66% { transform: translate3d(-30px, 20px, 0) scale(0.92) rotate(-5deg); }
  }
  
  .animate-blob-float { animation: blob-float 20s ease-in-out infinite; }
  .animate-blob-float-delayed { animation: blob-float-delayed 25s ease-in-out infinite; animation-delay: 2s; }
  .animate-blob-float-slow { animation: blob-float-slow 30s ease-in-out infinite; animation-delay: 1s; }
  `;

  // Inline CSS for features section animated blobs
  const featuresBlobStyles = `
  .features-blob { position: absolute; width: 380px; height: 380px; border-radius: 50%; filter: blur(50px); opacity: 0.5; transform: translate3d(0,0,0); }
  .features-blob.blob-1 { background: radial-gradient(circle at 40% 40%, rgba(59,130,246,0.24), rgba(59,130,246,0.04)); top: 10%; left: -100px; }
  .features-blob.blob-2 { background: radial-gradient(circle at 60% 50%, rgba(249,115,22,0.18), rgba(249,115,22,0.03)); bottom: 15%; right: -120px; }
  .features-blob.blob-3 { background: radial-gradient(circle at 50% 50%, rgba(139,92,246,0.14), rgba(139,92,246,0.05)); top: 50%; left: 50%; opacity: 0.4; }
  `;

  // Inject the styles into the document head so animations/styles are available
  useEffect(() => {
    const styleEl = document.createElement('style');
    styleEl.setAttribute('data-generated', 'benefits-blobs');
    styleEl.innerHTML = benefitsBlobStyles;
    document.head.appendChild(styleEl);
    
    const featuresStyleEl = document.createElement('style');
    featuresStyleEl.setAttribute('data-generated', 'features-blobs');
    featuresStyleEl.innerHTML = featuresBlobStyles;
    document.head.appendChild(featuresStyleEl);
    
    return () => {
      document.head.removeChild(styleEl);
      document.head.removeChild(featuresStyleEl);
    };
  }, []);

  // IntersectionObserver to reveal components with animations
  useEffect(() => {
    const sections = [heroRef.current, benefitsRef.current, featuresRef.current, modulesRef.current];
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Animate components within the section with stagger
            const components = entry.target.querySelectorAll('.animate-on-scroll');
            components.forEach((component, index) => {
              setTimeout(() => {
                component.classList.remove('opacity-0', 'translate-y-8');
                component.classList.add('opacity-100', 'translate-y-0');
              }, index * 100); // Stagger by 100ms
            });
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -100px 0px' }
    );

    sections.forEach((section) => {
      if (section) {
        observer.observe(section);
      }
    });

    return () => {
      sections.forEach((section) => {
        if (section) observer.unobserve(section);
      });
    };
  }, []);

  // Parallax pixel starfield effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Star layers with different speeds (parallax effect)
    interface Star {
      x: number;
      y: number;
      size: number;
      speed: number;
      brightness: number;
    }

    const layers: Star[][] = [
      [], // far layer (slow)
      [], // mid layer (medium)
      [], // near layer (fast)
    ];

    const layerSpeeds = [0.2, 0.5, 1.0]; // parallax multipliers
    const layerCounts = [50, 40, 30]; // star count per layer
    const layerSizes = [1, 2, 3]; // pixel sizes

    // Initialize stars
    layers.forEach((layer, layerIdx) => {
      for (let i = 0; i < layerCounts[layerIdx]; i++) {
        layer.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: layerSizes[layerIdx],
          speed: layerSpeeds[layerIdx],
          brightness: 0.3 + Math.random() * 0.7,
        });
      }
    });

  let animationId: number;
  let scrollY = window.scrollY;

    const updateScroll = () => {
      scrollY = window.scrollY;
    };

    window.addEventListener('scroll', updateScroll, { passive: true });

    const animate = () => {
      // Clear with a very dark fill to avoid transparent pixels when compositing
      ctx.fillStyle = 'rgba(2,4,8,1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw subtle moving nebula/glow blobs behind the stars
      nebulas.forEach((blob) => {
        const bx = (blob.x + Math.sin(perfTime * blob.speed) * blob.range) % canvas.width;
        const by = (blob.y + Math.cos(perfTime * blob.speed * 0.8) * blob.range) % canvas.height;
        const grad = ctx.createRadialGradient(bx, by, 0, bx, by, blob.size);
        grad.addColorStop(0, `rgba(${blob.r},${blob.g},${blob.b},${blob.intensity})`);
        grad.addColorStop(1, 'rgba(2,4,8,0)');
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = grad;
        ctx.fillRect(bx - blob.size, by - blob.size, blob.size * 2, blob.size * 2);
        ctx.globalCompositeOperation = 'source-over';
      });

      // Subtle vignette overlay to focus center
      const vignette = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, canvas.width * 0.2, canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) * 0.8);
      vignette.addColorStop(0, 'rgba(0,0,0,0)');
      vignette.addColorStop(1, 'rgba(0,0,0,0.45)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw each layer with parallax offset
      layers.forEach((layer, layerIdx) => {
        layer.forEach((star) => {
          // Apply parallax based on scroll
          const offsetY = (scrollY * star.speed) % canvas.height;
          let yPos = star.y - offsetY;

          // Wrap around
          if (yPos < -star.size) {
            yPos += canvas.height + star.size * 2;
          }
          if (yPos > canvas.height + star.size) {
            yPos -= canvas.height + star.size * 2;
          }

          // Draw pixel star
          ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness})`;
          ctx.fillRect(star.x, yPos, star.size, star.size);

          // Add subtle twinkle for far stars
          if (layerIdx === 0 && Math.random() > 0.99) {
            star.brightness = 0.3 + Math.random() * 0.7;
          }
        });
      });

      // update perfTime for nebula movement
      perfTime = performance.now() / 1000;
      animationId = requestAnimationFrame(animate);
    };

    // Initialize nebula blobs (low count, low cost)
    let perfTime = performance.now() / 1000;
    const nebulas: Array<{ x: number; y: number; size: number; speed: number; range: number; r: number; g: number; b: number; intensity: number }> = [];
    const nebulaCount = 3;
    for (let i = 0; i < nebulaCount; i++) {
      nebulas.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: canvas.width * (0.18 + Math.random() * 0.12),
        speed: 0.02 + Math.random() * 0.03,
        range: 40 + Math.random() * 80,
        r: 20 + Math.floor(Math.random() * 80),
        g: 80 + Math.floor(Math.random() * 120),
        b: 140 + Math.floor(Math.random() * 120),
        intensity: 0.06 + Math.random() * 0.12,
      });
    }

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('scroll', updateScroll);
    };
  }, []);

  // Particle system removed — starfield remains in `canvasRef`.

  // Scroll-snap setup: compute header height and apply scroll-padding so sections snap under the header
  useEffect(() => {
    const root = document.documentElement;
    const header = document.querySelector('header');
    if (!header) return;
    const setPadding = () => {
      const h = header.getBoundingClientRect().height;
      // apply a slight offset so section sits just below header
      root.style.scrollPaddingTop = `${h + 8}px`;
    };
    setPadding();
    window.addEventListener('resize', setPadding);
    return () => window.removeEventListener('resize', setPadding);
  }, []);

  // Simple scroll lock to add a delay between snap motions (prevents immediate re-snapping)
  useEffect(() => {
    let isLocked = false;
    let lockTimeout: number | undefined;

    const handler = (e: Event) => {
      if (isLocked) {
        // prevent default scroll during lock to avoid jumpy behavior
        e.preventDefault();
        return;
      }
      // When a scroll event starts, lock for a short period after it ends
      isLocked = true;
      clearTimeout(lockTimeout as any);
      lockTimeout = window.setTimeout(() => {
        isLocked = false;
      }, 350); // 350ms locking window
    };

    window.addEventListener('wheel', handler, { passive: false });
    window.addEventListener('touchmove', handler, { passive: false });
    return () => {
      window.removeEventListener('wheel', handler as EventListener);
      window.removeEventListener('touchmove', handler as EventListener);
      clearTimeout(lockTimeout as any);
    };
  }, []);

  return (
    <div className="min-h-screen bg-app" style={{ scrollBehavior: 'smooth' }}>
      <header className={`fixed top-0 w-full backdrop-blur-sm border-b border-[#0b1220] z-50 transition-all duration-300 ${scrolled ? 'bg-[rgba(6,10,15,0.9)]' : 'bg-[rgba(6,10,15,0.2)]'}`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[var(--accent)] rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">BMS</h1>
              <p className="text-xs text-muted">Barangay Management</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-muted hover:text-white transition-colors">Features</a>
            <a href="#benefits" className="text-muted hover:text-white transition-colors">Benefits</a>
            <a href="#modules" className="text-muted hover:text-white transition-colors">Modules</a>
            
            {!isAuthenticated && (
              <>
                {/* Try Demo Button */}
                <button
                  onClick={() => {
                    if (onStartDemo) onStartDemo();
                  }}
                  className="px-6 py-2 text-muted hover:text-white transition-all"
                >
                  Try Demo
                </button>
                
                {/* Sign Up Button */}
                <button
                  onClick={() => {
                    if (onShowSignup) onShowSignup();
                  }}
                  className="px-6 py-2 border-2 border-[var(--accent)] text-[var(--accent)] rounded-full hover:bg-[var(--accent)] hover:text-white transition-all"
                >
                  Sign Up
                </button>
                
                {/* Login Button */}
                <button
                  onClick={() => handleGetStarted()}
                  className="px-6 py-2 bg-[var(--accent)] text-white rounded-full hover:brightness-110 transition-all"
                >
                  Login
                </button>
              </>
            )}
            
            {isAuthenticated && (
              <button
                onClick={() => handleGetStarted()}
                className="px-6 py-2 bg-green-600 text-white rounded-full hover:brightness-110 transition-all"
              >
                Enter System
              </button>
            )}
          </nav>
        </div>
      </header>

    <section ref={heroRef} className="sticky top-0 h-screen flex flex-col items-center justify-center px-6 text-white section-alt-1 overflow-hidden">
    {/* Parallax Pixel Starfield Canvas */}
    <canvas 
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
    
    {/* Particle effect removed - starfield remains */}
    
    <div className="max-w-7xl mx-auto text-center relative z-10">
      <div className="max-w-3xl mx-auto">
      <h2 className="text-5xl font-bold text-white mb-6 animate-on-scroll opacity-0 translate-y-8 transition-all duration-700">
        Modernize Your Barangay Operations
      </h2>
      <p className="text-xl text-muted mb-8 leading-relaxed animate-on-scroll opacity-0 translate-y-8 transition-all duration-700">
        Transform paper-based processes into a streamlined digital system. Manage residents, documents, clearances, and records efficiently in one centralized platform.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-on-scroll opacity-0 translate-y-8 transition-all duration-700">
        {/* Dynamic button based on authentication status */}
        {isAuthenticated ? (
          <button
            onClick={() => handleGetStarted()}
            className="px-8 py-4 bg-[linear-gradient(90deg,#10b981,#3b82f6)] text-white rounded-lg hover:brightness-105 transition-all text-lg font-semibold shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            Enter System
            {userName && <span className="text-sm opacity-90">({userName})</span>}
          </button>
        ) : (
          <>
            <button
              onClick={() => handleGetStarted()}
              className="px-8 py-4 bg-[linear-gradient(90deg,#06b6d4,#3b82f6)] text-white rounded-lg hover:brightness-105 transition-all text-lg font-semibold shadow-lg hover:shadow-xl"
            >
              Login to System
            </button>
            <button
              onClick={() => {
                if (onStartDemo) onStartDemo();
              }}
              className="px-8 py-4 bg-[linear-gradient(90deg,#8b5cf6,#6366f1)] text-white rounded-lg hover:brightness-105 transition-all text-lg font-semibold shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <User className="w-5 h-5" />
              Try Demo
            </button>
          </>
        )}
        <a
          href="#features"
          className="px-8 py-4 border-2 border-[#1f2937] text-muted rounded-lg hover:border-gray-400 transition-all text-lg font-semibold"
        >
          Learn More
        </a>
      </div>
      </div>

      <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8">
      <div className="text-center animate-on-scroll opacity-0 translate-y-8 transition-all duration-700">
        <div className="text-4xl font-bold accent mb-2">100%</div>
        <div className="text-muted">Digital Records</div>
      </div>
      <div className="text-center animate-on-scroll opacity-0 translate-y-8 transition-all duration-700">
        <div className="text-4xl font-bold accent mb-2">75%</div>
        <div className="text-muted">Time Saved</div>
      </div>
      <div className="text-center animate-on-scroll opacity-0 translate-y-8 transition-all duration-700">
        <div className="text-4xl font-bold accent mb-2">24/7</div>
        <div className="text-muted">Access</div>
      </div>
      <div className="text-center animate-on-scroll opacity-0 translate-y-8 transition-all duration-700">
        <div className="text-4xl font-bold accent mb-2">Secure</div>
        <div className="text-muted">Data Protection</div>
      </div>
      </div>
    </div>
  </section>


  <section ref={benefitsRef} id="benefits" className="relative py-20 px-6 section-alt-2 min-h-screen flex items-center overflow-hidden">
        {/* Ambient Background Motion */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="benefits-blob blob-1 animate-blob-float"></div>
          <div className="benefits-blob blob-2 animate-blob-float-delayed"></div>
          <div className="benefits-blob blob-3 animate-blob-float-slow"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-white mb-4 animate-on-scroll opacity-0 translate-y-8 transition-all duration-700">Why Choose BRMS?</h3>
            <p className="text-lg text-muted animate-on-scroll opacity-0 translate-y-8 transition-all duration-700">Experience the benefits of digital transformation</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Card 1 - Blue theme */}
            <div className="benefit-card card-bg p-6 rounded-xl shadow-sm border border-transparent animate-on-scroll opacity-0 translate-y-8 transition-all duration-700">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 bg-gradient-to-br from-blue-400 to-cyan-400 shadow-[0_6px_18px_rgba(59,130,246,0.08)]">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-baseline justify-between">
                <h4 className="text-xl font-semibold text-white mb-2">Time Efficient</h4>
                <div className="text-sm font-bold accent">90%</div>
              </div>
              <p className="text-muted">
                Reduce processing time for clearances, certificates, and document retrieval from hours to minutes.
              </p>
            </div>

            {/* Card 2 - Emerald theme */}
            <div className="benefit-card card-bg p-6 rounded-xl shadow-sm border border-transparent animate-on-scroll opacity-0 translate-y-8 transition-all duration-700">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-[0_6px_18px_rgba(16,185,129,0.06)]">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-baseline justify-between">
                <h4 className="text-xl font-semibold text-white mb-2">Secure & Safe</h4>
                <div className="text-sm font-bold text-emerald-300">99%</div>
              </div>
              <p className="text-muted">
                Role-based access control ensures only authorized personnel can view sensitive information.
              </p>
            </div>

            {/* Card 3 - Orange theme */}
            <div className="benefit-card card-bg p-6 rounded-xl shadow-sm border border-transparent animate-on-scroll opacity-0 translate-y-8 transition-all duration-700">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 bg-gradient-to-br from-orange-300 to-orange-500 shadow-[0_6px_18px_rgba(249,115,22,0.06)]">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-baseline justify-between">
                <h4 className="text-xl font-semibold text-white mb-2">Better Organization</h4>
                <div className="text-sm font-bold text-orange-200">75%</div>
              </div>
              <p className="text-muted">
                All records stored in one place with powerful search and filtering capabilities.
              </p>
            </div>

            {/* Card 4 - Teal theme */}
            <div className="benefit-card card-bg p-6 rounded-xl shadow-sm border border-transparent animate-on-scroll opacity-0 translate-y-8 transition-all duration-700">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 bg-gradient-to-br from-teal-300 to-teal-500 shadow-[0_6px_18px_rgba(20,184,166,0.06)]">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-baseline justify-between">
                <h4 className="text-xl font-semibold text-white mb-2">Transparent Operations</h4>
                <div className="text-sm font-bold text-teal-200">100%</div>
              </div>
              <p className="text-muted">
                Complete audit trails track every action for accountability and transparency.
              </p>
            </div>
          </div>
        </div>
      </section>

  <section ref={featuresRef} id="features" className="relative py-20 px-6 section-alt-1 min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-white mb-4 animate-on-scroll opacity-0 translate-y-8 transition-all duration-700">Powerful Features</h3>
            <p className="text-lg text-muted animate-on-scroll opacity-0 translate-y-8 transition-all duration-700">Everything you need to manage your barangay efficiently</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Card 1 - Resident Management (Blue theme) */}
            <div className="card-bg border border-[#0f1724] rounded-xl p-6 animate-on-scroll opacity-0 translate-y-8 transition-all duration-700">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br from-blue-400 to-blue-600 shadow-[0_8px_20px_rgba(59,130,246,0.15)]">
                <Users className="w-7 h-7 text-white" />
              </div>
              <h4 className="text-xl font-semibold text-white mb-3">Resident Management</h4>
              <ul className="space-y-2 text-muted">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Complete resident profiles with photos</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Household tracking and relationships</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Advanced search and filtering</span>
                </li>
              </ul>
            </div>

            {/* Card 2 - Document Management (Purple theme) */}
            <div className="card-bg border border-[#0f1724] rounded-xl p-6 animate-on-scroll opacity-0 translate-y-8 transition-all duration-700">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br from-purple-400 to-purple-600 shadow-[0_8px_20px_rgba(139,92,246,0.15)]">
                <FileText className="w-7 h-7 text-white" />
              </div>
              <h4 className="text-xl font-semibold text-white mb-3">Document Management</h4>
              <ul className="space-y-2 text-muted">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-purple-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Centralized document repository</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-purple-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Version control and history</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-purple-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Quick generation and printing</span>
                </li>
              </ul>
            </div>

            {/* Card 3 - Clearance Processing (Orange theme) */}
            <div className="card-bg border border-[#0f1724] rounded-xl p-6 animate-on-scroll opacity-0 translate-y-8 transition-all duration-700">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br from-orange-400 to-orange-600 shadow-[0_8px_20px_rgba(249,115,22,0.15)]">
                <Lock className="w-7 h-7 text-white" />
              </div>
              <h4 className="text-xl font-semibold text-white mb-3">Clearance Processing</h4>
              <ul className="space-y-2 text-muted">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-orange-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Automated certificate generation</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-orange-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Status tracking and approval workflow</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-orange-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span>QR code verification</span>
                </li>
              </ul>
            </div>

            {/* Card 4 - Blotter Records (Red theme) */}
            <div className="card-bg border border-[#0f1724] rounded-xl p-6 animate-on-scroll opacity-0 translate-y-8 transition-all duration-700">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br from-red-400 to-red-600 shadow-[0_8px_20px_rgba(239,68,68,0.15)]">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <h4 className="text-xl font-semibold text-white mb-3">Blotter Records</h4>
              <ul className="space-y-2 text-muted">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-red-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Record incidents and complaints</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-red-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Track case status and resolution</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-red-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Generate blotter reports</span>
                </li>
              </ul>
            </div>

            {/* Card 5 - Financial Management (Green theme) */}
            <div className="card-bg border border-[#0f1724] rounded-xl p-6 animate-on-scroll opacity-0 translate-y-8 transition-all duration-700">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br from-green-400 to-green-600 shadow-[0_8px_20px_rgba(34,197,94,0.15)]">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <h4 className="text-xl font-semibold text-white mb-3">Financial Management</h4>
              <ul className="space-y-2 text-muted">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Track income and expenses</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Budget planning and monitoring</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Financial reports and analytics</span>
                </li>
              </ul>
            </div>

            {/* Card 6 - Reports & Analytics (Cyan theme) */}
            <div className="card-bg border border-[#0f1724] rounded-xl p-6 animate-on-scroll opacity-0 translate-y-8 transition-all duration-700">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br from-cyan-400 to-cyan-600 shadow-[0_8px_20px_rgba(6,182,212,0.15)]">
                <BarChart className="w-7 h-7 text-white" />
              </div>
              <h4 className="text-xl font-semibold text-white mb-3">Reports & Analytics</h4>
              <ul className="space-y-2 text-muted">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-cyan-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Generate comprehensive reports</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-cyan-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Data visualization and insights</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-cyan-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Export to PDF and Excel</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

  <section ref={modulesRef} id="modules" className="relative py-20 px-6 text-white section-alt-2 min-h-screen flex items-center z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold mb-4 animate-on-scroll opacity-0 translate-y-8 transition-all duration-700">Complete System Modules</h3>
            <p className="text-lg text-muted animate-on-scroll opacity-0 translate-y-8 transition-all duration-700">All the tools you need in one integrated platform</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Users, title: 'Residents', desc: 'Manage all resident records' },
              { icon: FileText, title: 'Documents', desc: 'Store and organize files' },
              { icon: CheckCircle, title: 'Clearances', desc: 'Issue certificates quickly' },
              { icon: Shield, title: 'Blotter', desc: 'Record incidents and complaints' },
              { icon: TrendingUp, title: 'Financial', desc: 'Track income and expenses' },
              { icon: BarChart, title: 'Reports', desc: 'Generate analytics' },
              { icon: Lock, title: 'Security', desc: 'Role-based access control' },
              { icon: Clock, title: 'Audit Logs', desc: 'Complete activity tracking' },
            ].map((module, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-lg p-6 animate-on-scroll opacity-0 translate-y-8 transition-all duration-700">
                <module.icon className="w-8 h-8 mb-3" />
                <h4 className="text-lg font-semibold mb-2">{module.title}</h4>
                <p className="text-blue-100 text-sm">{module.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-16 animate-on-scroll opacity-0 translate-y-8 transition-all duration-700">
            {isAuthenticated ? (
              <button
                onClick={() => handleGetStarted()}
                className="px-10 py-4 bg-[linear-gradient(90deg,#10b981,#059669)] text-white rounded-lg hover:brightness-110 transition-all text-lg font-semibold shadow-xl flex items-center gap-2 mx-auto"
              >
                <CheckCircle className="w-5 h-5" />
                Enter System Now
              </button>
            ) : (
              <button
                onClick={() => handleGetStarted()}
                className="px-10 py-4 bg-[linear-gradient(90deg,#111827,#0f1724)] text-white rounded-lg hover:brightness-110 transition-all text-lg font-semibold shadow-xl"
              >
                Login to BRMS
              </button>
            )}
          </div>
        </div>
    </section>

    <footer className="relative z-10 bg-[#060a0f] text-muted py-12 px-6 border-t border-[#1a1f2e]">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-[var(--accent)] rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <span className="text-white font-semibold">BRMS</span>
              </div>
              <p className="text-sm text-muted">
                Barangay Records Management System - Modernizing local governance through digital transformation.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-muted">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#benefits" className="hover:text-white transition-colors">Benefits</a></li>
                <li><a href="#modules" className="hover:text-white transition-colors">Modules</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Contact</h4>
              <p className="text-sm text-muted">
                For support and inquiries, please contact your barangay office.
              </p>
            </div>
          </div>

          <div className="border-t border-[#0b1220] pt-8 text-center text-sm">
            <p className="text-muted">&copy; 2025 Barangay Records Management System. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full relative animate-in fade-in zoom-in duration-200">
            {/* Close Button */}
            <button
              onClick={closeLoginModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors z-10"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Header Section */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-t-2xl p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur rounded-full mb-4">
                <User className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
              <p className="text-blue-100">Sign in to access the BRMS</p>
            </div>

            {/* Content Section */}
            <div className="p-8">
              {/* Error Message */}
              {loginError && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700 dark:text-red-400">{loginError}</p>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleLogin} className="space-y-5">
                {/* Email Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Sign In Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-xl"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5 mr-2" />
                      Sign In
                    </>
                  )}
                </button>
              </form>

              {/* Signup Message */}
              <div className="mt-6 text-center pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Have an invitation code?
                </p>
                <button
                  type="button"
                  onClick={() => {
                    closeLoginModal();
                    if (onShowSignup) onShowSignup();
                  }}
                  className="text-blue-600 dark:text-blue-400 hover:underline font-medium text-sm"
                >
                  Create Account with Code
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
