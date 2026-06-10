import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Props {
  onRegisterClick: () => void;
}

const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'Find a Gym', href: '#gym-search' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
];

export default function Navbar({ onRegisterClick }: Props) {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (href: string) => {
    setMobileOpen(false);
    if (href === '#home') { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-gray-900/95 backdrop-blur shadow-xl shadow-black/20' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-18 py-4">

          {/* Logo */}
          <button onClick={() => scrollTo('#home')}
            className="flex items-center gap-2.5 group">
            <span className="text-2xl">🏃</span>
            <span className="text-white font-bold text-xl tracking-tight group-hover:text-red-400 transition-colors">
              GymPro
            </span>
          </button>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((l) => (
              <button key={l.label}
                onClick={() => scrollTo(l.href)}
                className="text-gray-300 hover:text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/10 transition-all duration-150">
                {l.label}
              </button>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <button onClick={() => navigate('/login')}
              className="text-gray-300 hover:text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/10 transition-all duration-150">
              Login
            </button>
            <button onClick={onRegisterClick}
              className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 shadow-lg shadow-red-900/30 hover:shadow-red-900/50">
              Register Your Gym
            </button>
          </div>

          {/* Mobile hamburger */}
          <button onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-gray-300 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors">
            {mobileOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden bg-gray-900/98 backdrop-blur border-t border-gray-800 transition-all duration-300 overflow-hidden ${
        mobileOpen ? 'max-h-80 py-4' : 'max-h-0'
      }`}>
        <div className="px-6 space-y-1">
          {navLinks.map((l) => (
            <button key={l.label}
              onClick={() => scrollTo(l.href)}
              className="w-full text-left text-gray-300 hover:text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors">
              {l.label}
            </button>
          ))}
          <div className="pt-3 border-t border-gray-800 space-y-2">
            <button onClick={() => { navigate('/login'); setMobileOpen(false); }}
              className="w-full text-left text-gray-300 hover:text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors">
              Login
            </button>
            <button onClick={() => { onRegisterClick(); setMobileOpen(false); }}
              className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors">
              Register Your Gym
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
