import { useState, useMemo } from 'react';
import {
  BookOpen,
  LayoutDashboard,
  ArrowRight,
} from 'lucide-react';
import { RegistrationForm } from './RegistrationForm';
import { TeamDashboardTable, INITIAL_TEAMS_DATA, type RegisteredTeamRecord } from './TeamDashboardTable';
import { TRACK_MAP } from '../schemas/registration.schema';
import type { RegistrationFormData } from '../schemas/registration.schema';

interface FlipPortalModalProps {
  selectedTrack: string;
  onTrackChange: (track: string) => void;
  activeTab: 'register' | 'dashboard';
  setActiveTab: (tab: 'register' | 'dashboard') => void;
}

export function FlipPortalModal({
  selectedTrack,
  onTrackChange,
  activeTab,
  setActiveTab,
}: FlipPortalModalProps) {
  const [teams, setTeams] = useState<RegisteredTeamRecord[]>(INITIAL_TEAMS_DATA);

  // When a team successfully registers through the form, add it to the live table in O(1)
  const handleRegistrationComplete = (formData: RegistrationFormData) => {
    const trackObj = TRACK_MAP[formData.track];
    const newTeam: RegisteredTeamRecord = {
      id: `EC26-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      teamName: formData.teamName,
      leaderName: formData.name,
      leaderEmail: formData.email,
      leaderPhone: formData.phone || '',
      teamSize: formData.teamSize,
      trackId: formData.track,
      trackLabel: trackObj?.label || formData.track,
      idea: formData.idea,
      pitchDeckUrl: formData.pitchDeckUrl,
      members: formData.members || [],
      submittedAt: new Date().toISOString().split('T')[0],
      status: 'Stage 1 Submitted',
    };

    setTeams((prev) => [newTeam, ...prev]);
  };

  // Collect all registered emails & phones (leaders + members) for duplicate prevention
  const { registeredEmails, registeredPhones } = useMemo<{
    registeredEmails: Set<string>;
    registeredPhones: Set<string>;
  }>(() => {
    const emails = new Set<string>();
    const phones = new Set<string>();
    const cleanPhone = (p?: string) => (p ? p.replace(/\D/g, '').slice(-10) : '');

    for (const team of teams) {
      if (team.leaderEmail) emails.add(team.leaderEmail.toLowerCase());
      if (team.leaderPhone) {
        const cp = cleanPhone(team.leaderPhone);
        if (cp.length === 10) phones.add(cp);
      }
      if (team.members) {
        for (const m of team.members) {
          if (m.email) emails.add(m.email.toLowerCase());
          if (m.phone) {
            const cp = cleanPhone(m.phone);
            if (cp.length === 10) phones.add(cp);
          }
        }
      }
    }
    return { registeredEmails: emails, registeredPhones: phones };
  }, [teams]);

  return (
    <div id="registration-portal" className="py-12 relative z-10 scroll-mt-20">
      {/* ── Section Title & Tab Controls ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-6 h-0.5 bg-gradient-to-r from-blue-500 to-[#e8702a] rounded-full" />
            <span className="text-xs font-bold tracking-wider text-blue-400 uppercase font-mono">
              Official Competition Portal
            </span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight font-heading">
            Startup Pitch Portal & Dashboard
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-xl">
            Switch smoothly between new team registration and the live applications dashboard table.
          </p>
        </div>

        {/* 3D Flip Mode Switcher Tabs */}
        <div className="p-1.5 rounded-xl bg-bg-card border border-white/10 flex items-center gap-1.5 self-start md:self-auto shadow-lg">
          <button
            type="button"
            onClick={() => setActiveTab('register')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'register'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Registration Form</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-[#e8702a] text-white shadow-md shadow-[#e8702a]/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Team Dashboard Table</span>
          </button>
        </div>
      </div>

      {/* ── Interactive Registration & Dashboard Portal Container ── */}
      <div className="w-full">
        {activeTab === 'register' ? (
          <div className="w-full ecell-card p-6 sm:p-8 border-slate-800 bg-[#0d111a] shadow-2xl animate-fade-in">
            {/* Top Bar of Registration Book */}
            <div className="mb-6 pb-4 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[11px] font-mono font-bold uppercase text-emerald-400 tracking-wider">
                    Official Student Application
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white font-heading mt-0.5">
                  Submit Your Startup Pitch Concept
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('dashboard')}
                className="inline-flex items-center gap-1.5 text-xs text-[#e8702a] hover:underline font-mono cursor-pointer"
              >
                <span>Already registered? Check Status / Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Registration Form Component */}
            <RegistrationForm
              selectedTrack={selectedTrack}
              onTrackChange={onTrackChange}
              onRegistrationSuccess={handleRegistrationComplete}
              onViewDashboard={() => setActiveTab('dashboard')}
              registeredEmails={registeredEmails}
              registeredPhones={registeredPhones}
            />
          </div>
        ) : (
          <div className="w-full ecell-card p-6 sm:p-8 border-slate-800 bg-[#0d111a] shadow-2xl animate-fade-in">
            <TeamDashboardTable
              teams={teams}
              onFlipToRegister={() => setActiveTab('register')}
            />
          </div>
        )}
      </div>
    </div>
  );
}
