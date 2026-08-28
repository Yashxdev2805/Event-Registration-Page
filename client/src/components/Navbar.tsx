import { useState, useEffect, memo } from 'react';
import { ArrowRight } from 'lucide-react';

interface NavbarProps {
  onScrollToForm: () => void;
  onScrollToTracks: () => void;
  onScrollToPrizes: () => void;
  onScrollToTimeline: () => void;
  onScrollToFaqs: () => void;
}

export const Navbar = memo(function Navbar({
  onScrollToForm,
  onScrollToTracks,
  onScrollToPrizes,
  onScrollToTimeline,
  onScrollToFaqs,
}: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        scrolled
          ? 'bg-[#060913]/95 backdrop-blur-md border-b border-slate-800/80 shadow-lg py-3'
          : 'bg-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Official E-Cell UIET KUK Brand Logo */}
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <img
            src="/ecell-logo.png"
            alt="E-Cell UIET KUK Logo"
            className="h-10 sm:h-11 w-auto object-contain rounded-md transition-transform group-hover:scale-105"
          />
          <div className="hidden sm:block pl-2 border-l border-slate-700">
            <span className="text-[11px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-semibold border border-blue-500/20">
              PITCH '26
            </span>
            <p className="text-[11px] text-slate-400 font-medium leading-none mt-1">
              Start-up Competition
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-300">
          <button
            onClick={onScrollToTracks}
            className="hover:text-blue-400 transition-colors cursor-pointer"
          >
            Tracks
          </button>
          <button
            onClick={onScrollToPrizes}
            className="hover:text-blue-400 transition-colors cursor-pointer"
          >
            Prizes
          </button>
          <button
            onClick={onScrollToTimeline}
            className="hover:text-blue-400 transition-colors cursor-pointer"
          >
            Timeline
          </button>
          <button
            onClick={onScrollToFaqs}
            className="hover:text-blue-400 transition-colors cursor-pointer"
          >
            FAQs
          </button>
        </div>

        {/* Action CTA */}
        <button
          onClick={onScrollToForm}
          className="btn-primary text-xs sm:text-sm py-2 px-4 sm:px-5"
        >
          <span>Register Now</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </nav>
  );
});
