import { useState } from 'react';
import {
  Calendar,
  MapPin,
  Trophy,
  Users,
  CheckCircle2,
  ExternalLink,
  ArrowRight,
  LayoutDashboard,
  BookOpen,
} from 'lucide-react';
import { Navbar } from './components/Navbar';
import { FlipPortalModal } from './components/FlipPortalModal';
import { TracksSection } from './components/TracksSection';
import { PrizesSection } from './components/PrizesSection';
import { TimelineSection } from './components/TimelineSection';
import { FAQSection } from './components/FAQSection';

export default function App() {
  const [selectedTrack, setSelectedTrack] = useState<string>('ai-saas');
  const [portalTab, setPortalTab] = useState<'register' | 'dashboard'>('register');

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleOpenRegister = (trackId?: string) => {
    if (trackId) {
      setSelectedTrack(trackId);
    }
    setPortalTab('register');
    scrollToSection('registration-portal');
  };

  const handleOpenDashboard = () => {
    setPortalTab('dashboard');
    scrollToSection('registration-portal');
  };

  return (
    <div className="min-h-screen bg-[#07080a] text-slate-100 relative selection:bg-blue-600 selection:text-white">
      {/* ── Portfolio Mesh Radiant Background ── */}
      <div className="fixed inset-0 portfolio-bg-grid pointer-events-none opacity-90" />

      {/* ── Top Navigation Bar with Official Logo ── */}
      <Navbar
        onScrollToForm={() => handleOpenRegister()}
        onScrollToTracks={() => scrollToSection('tracks')}
        onScrollToPrizes={() => scrollToSection('prizes')}
        onScrollToTimeline={() => scrollToSection('timeline')}
        onScrollToFaqs={() => scrollToSection('faqs')}
      />

      {/* ── Main Container ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-36 pb-16 relative z-10">
        
        {/* ══════════════════════════════════════════════════════════
            AUTHORITATIVE HERO SECTION (Clean, Prestigious & Focused)
           ══════════════════════════════════════════════════════════ */}
        <section className="text-center max-w-4xl mx-auto space-y-6 pt-4 pb-12">
          {/* Tag Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold backdrop-blur-md shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#e8702a] animate-pulse" />
            <span className="text-slate-300 font-mono">
              E-CELL UIET KUK PRESENTS • ANNUAL START-UP PITCH ARENA '26
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight font-heading leading-tight text-white">
            Empowering Student Innovators to{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-[#e8702a]">
              Pitch, Fund & Scale.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto font-sans">
            Present your groundbreaking venture concept to leading angel investors, venture capitalists, and industry veterans. Compete for <strong>₹1,00,000+ in cash grants</strong>, seed incubation support, and ₹10L+ in developer cloud credits.
          </p>

          {/* Event Quick Meta Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-2 max-w-3xl mx-auto">
            {[
              { icon: Trophy, label: 'Prize Pool', value: '₹1,00,000+', color: 'text-amber-400' },
              { icon: Calendar, label: 'Grand Finale', value: 'April 12, 2026', color: 'text-blue-400' },
              { icon: MapPin, label: 'Venue', value: 'Campus Auditorium', color: 'text-[#e8702a]' },
              { icon: Users, label: 'Team Size', value: '1 to 4 Members', color: 'text-emerald-400' },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="ecell-card p-3.5 bg-bg-card/80 flex flex-col items-center justify-center text-center shadow-md">
                  <Icon className={`w-4 h-4 ${item.color} mb-1`} />
                  <p className="text-[10px] uppercase font-mono text-slate-400">{item.label}</p>
                  <p className="text-xs font-bold text-white font-heading mt-0.5">{item.value}</p>
                </div>
              );
            })}
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-4">
            <button
              onClick={() => handleOpenRegister()}
              className="btn-primary text-sm sm:text-base py-3 px-6 shadow-xl"
            >
              <BookOpen className="w-4 h-4" />
              <span>Register Your Startup Concept</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={handleOpenDashboard}
              className="btn-secondary text-sm sm:text-base py-3 px-6"
            >
              <LayoutDashboard className="w-4 h-4 text-[#e8702a]" />
              <span>View Team Dashboard & Status</span>
            </button>
          </div>

          {/* Highlights Ribbon */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>100% Free Entry</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
              <span>1-on-1 VC Mentorship</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
              <span>3 Months Incubation</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#e8702a] shrink-0" />
              <span>Official E-Cell Credential</span>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            TRANSITIONAL FLIP BOOK: REGISTRATION & DASHBOARD PORTAL
           ══════════════════════════════════════════════════════════ */}
        <FlipPortalModal
          selectedTrack={selectedTrack}
          onTrackChange={setSelectedTrack}
          activeTab={portalTab}
          setActiveTab={setPortalTab}
        />

        {/* ══════════════════════════════════════════════════════════
            COMPETITION TRACKS & DEEP DOMAIN SCOPE
           ══════════════════════════════════════════════════════════ */}
        <TracksSection
          selectedTrack={selectedTrack}
          onSelectTrack={handleOpenRegister}
        />

        {/* ══════════════════════════════════════════════════════════
            PRIZES, GRANTS & PARTNER PERKS
           ══════════════════════════════════════════════════════════ */}
        <PrizesSection />

        {/* ══════════════════════════════════════════════════════════
            COMPETITION ROADMAP TIMELINE
           ══════════════════════════════════════════════════════════ */}
        <TimelineSection />

        {/* ══════════════════════════════════════════════════════════
            FREQUENTLY ASKED QUESTIONS & EVALUATION WEIGHTS
           ══════════════════════════════════════════════════════════ */}
        <FAQSection />

      </main>

      {/* ── Official Collegiate Footer ── */}
      <footer className="w-full border-t border-slate-800 bg-[#04060C] py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img
              src="/ecell-logo.png"
              alt="E-Cell UIET KUK Logo"
              className="h-11 w-auto object-contain rounded-md"
            />
            <div>
              <p className="font-bold text-sm text-white font-heading">
                E-CELL UIET KUK — PITCH ARENA '26
              </p>
              <p className="text-xs text-slate-400">
                Fostering student entrepreneurship, venture creation, and tech innovation.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-medium">
            <button onClick={() => scrollToSection('tracks')} className="hover:text-white transition-colors cursor-pointer">
              Tracks
            </button>
            <button onClick={() => scrollToSection('prizes')} className="hover:text-white transition-colors cursor-pointer">
              Prizes
            </button>
            <button onClick={() => scrollToSection('timeline')} className="hover:text-white transition-colors cursor-pointer">
              Timeline
            </button>
            <button onClick={() => scrollToSection('faqs')} className="hover:text-white transition-colors cursor-pointer">
              FAQs
            </button>
            <button onClick={handleOpenDashboard} className="text-[#e8702a] hover:underline transition-colors cursor-pointer font-semibold">
              Team Dashboard Table
            </button>
            <a
              href="mailto:ecell@college.edu.in"
              className="text-blue-400 hover:underline flex items-center gap-1"
            >
              <span>ecell@college.edu.in</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="text-xs text-slate-500 font-mono text-center md:text-right">
            © 2026 Entrepreneurship Cell, UIET KUK. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
