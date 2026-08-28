import { useState } from 'react';
import {
  CheckCircle2,
  Calendar,
  Copy,
  Check,
  MapPin,
  Clock,
  Mail,
  Users,
  LayoutDashboard,
} from 'lucide-react';

interface TeamMember {
  name?: string;
  email?: string;
  phone?: string;
}

interface SuccessBannerProps {
  name: string;
  teamName: string;
  teamSize?: string;
  track?: string;
  email?: string;
  phone?: string;
  members?: TeamMember[];
  onReset: () => void;
  onViewDashboard?: () => void;
}

export function SuccessBanner({
  name,
  teamName,
  teamSize = '2',
  track = 'General Track',
  email = '',
  phone = '',
  members = [],
  onReset,
  onViewDashboard,
}: SuccessBannerProps) {
  const [copied, setCopied] = useState(false);
  const [passId] = useState(() => `EC26-${Math.random().toString(36).substring(2, 7).toUpperCase()}`);

  const handleCopyId = () => {
    navigator.clipboard.writeText(passId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=E-Cell+Start-up+Pitch+Competition+2026&dates=20260412T043000Z/20260412T123000Z&details=Pitch+Competition+Finals+by+E-Cell.+Team:+${encodeURIComponent(
    teamName
  )}&location=Main+Campus+Auditorium`;

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center text-center py-4 px-2 animate-slide-down"
    >
      {/* Success Icon */}
      <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
        <CheckCircle2 className="w-8 h-8 text-emerald-400" />
      </div>

      <span className="text-[11px] font-mono font-bold tracking-wider text-emerald-400 uppercase mb-1">
        REGISTRATION CONFIRMED
      </span>
      <h2 className="text-2xl font-bold text-white mb-2 font-heading">
        Registration Received! 🚀
      </h2>

      <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-md mb-6">
        <strong className="text-blue-400 font-semibold">{teamName}</strong> has been successfully
        registered for the <strong className="text-white">E-Cell Start-up Pitch Competition '26</strong>.
      </p>

      {/* Confirmation Summary Card */}
      <div className="w-full ecell-card p-5 text-left mb-6 border border-slate-700">
        <div className="flex items-center justify-between pb-3 border-b border-white/5">
          <div>
            <div className="text-[10px] font-mono text-slate-400 uppercase">Registration Reference</div>
            <div className="text-base font-bold text-white font-heading">{teamName}</div>
          </div>
          <button
            onClick={handleCopyId}
            className="text-xs font-mono font-semibold px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{passId}</span>
          </button>
        </div>

        <div className="py-3 grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-slate-400 text-[10px] uppercase font-mono block">Track</span>
            <span className="font-semibold text-blue-300 truncate block">{track}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] uppercase font-mono block">Team Size</span>
            <span className="font-semibold text-amber-300">{teamSize} Member(s)</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] uppercase font-mono block">Venue</span>
            <span className="font-semibold text-slate-200">Campus Auditorium</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] uppercase font-mono block">Status</span>
            <span className="font-semibold text-emerald-400">● Stage 1 Submitted</span>
          </div>
        </div>

        {/* Complete Registered Team Roster */}
        <div className="pt-3 border-t border-white/5">
          <p className="text-[10px] font-mono uppercase text-slate-400 mb-2 flex items-center gap-1.5">
            <Users className="w-3 h-3 text-blue-400" />
            Registered Team Roster ({parseInt(teamSize, 10)} Members)
          </p>

          <div className="space-y-2">
            {/* Leader */}
            <div className="p-2.5 rounded-lg bg-bg-input border border-white/5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-300 font-mono text-[10px] flex items-center justify-center font-bold">
                  L
                </span>
                <div>
                  <span className="font-bold text-white block">{name}</span>
                  <span className="text-[11px] text-slate-400">{email} {phone ? `• ${phone}` : ''}</span>
                </div>
              </div>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Lead Founder
              </span>
            </div>

            {/* Additional Members */}
            {members.map((m, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-lg bg-bg-input/60 border border-white/5 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-700 text-slate-300 font-mono text-[10px] flex items-center justify-center font-bold">
                    {idx + 2}
                  </span>
                  <div>
                    <span className="font-semibold text-slate-200 block">{m.name}</span>
                    <span className="text-[11px] text-slate-400">{m.email} {m.phone ? `• ${m.phone}` : ''}</span>
                  </div>
                </div>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-white/5 text-slate-400">
                  Member {idx + 2}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <div className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-red-400" />
            <span>Campus Auditorium</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span>April 12, 2026</span>
          </div>
        </div>
      </div>

      {/* Email note */}
      <div className="w-full bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-left mb-6 flex items-start gap-2.5">
        <Mail className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
        <p className="text-xs text-blue-200 leading-relaxed">
          Confirmation details and Stage 1 screening guidelines have been sent to{' '}
          <strong className="text-white font-medium">{email || 'all team member emails'}</strong>.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="w-full flex flex-col sm:flex-row gap-3 mb-4">
        {onViewDashboard && (
          <button
            onClick={onViewDashboard}
            className="btn-ember flex-1 text-xs py-2.5 cursor-pointer"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>View in Team Dashboard Table</span>
          </button>
        )}

        <a
          href={calendarUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary flex-1 text-xs py-2.5"
        >
          <Calendar className="w-4 h-4" />
          Add to Calendar
        </a>

        <button
          onClick={onReset}
          className="btn-secondary text-xs py-2.5 cursor-pointer"
        >
          Register Another Team
        </button>
      </div>
    </div>
  );
}
