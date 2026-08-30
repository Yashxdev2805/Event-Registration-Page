import { useState, useMemo } from 'react';
import {
  Search,
  Users,
  ExternalLink,
  Eye,
  FileText,
  X,
  PlusCircle,
} from 'lucide-react';
import { TRACK_OPTIONS } from '../schemas/registration.schema';

export interface RegisteredTeamRecord {
  id: string;
  teamName: string;
  leaderName: string;
  leaderEmail: string;
  leaderPhone: string;
  teamSize: string;
  trackId: string;
  trackLabel: string;
  idea: string;
  pitchDeckUrl?: string;
  members?: Array<{ name?: string; email?: string; phone?: string }>;
  submittedAt: string;
  status: 'Stage 1 Submitted' | 'Under Review' | 'Shortlisted for Mentorship' | 'Demo Day Finalist';
  score?: number;
}

export const maskEmail = (email?: string): string => {
  if (!email) return '—';
  if (email.includes('****')) return email;
  const parts = email.split('@');
  if (parts.length !== 2) return '—';
  const name = parts[0];
  const domain = parts[1];
  const maskedName = name.length <= 2 ? `${name[0]}****` : `${name.slice(0, 2)}****`;
  return `${maskedName}@${domain}`;
};

export const maskPhone = (phone?: string): string => {
  if (!phone) return '—';
  const clean = phone.replace(/\D/g, '');
  if (clean.length < 4) return '🔒 Protected';
  const last4 = clean.slice(-4);
  return `+91 ******${last4}`;
};

export const INITIAL_TEAMS_DATA: RegisteredTeamRecord[] = [
  {
    id: 'EC26-A8K2M',
    teamName: 'NovaSpark AI',
    leaderName: 'Priya Sharma',
    leaderEmail: 'pr****@uietkuk.ac.in',
    leaderPhone: '+91 ******3210',
    teamSize: '3',
    trackId: 'ai-saas',
    trackLabel: 'AI & GenAI / SaaS',
    idea: 'Autonomous multi-agent customer support orchestrator for SME e-commerce merchants with self-healing resolution flows.',
    pitchDeckUrl: 'https://drive.google.com/file/d/novaspark-pitch',
    members: [
      { name: 'Ananya Gupta', email: 'an****@uietkuk.ac.in', phone: '******3344' },
      { name: 'Rohan Mehta', email: 'ro****@uietkuk.ac.in', phone: '******4455' },
    ],
    submittedAt: '2026-03-24',
    status: 'Shortlisted for Mentorship',
    score: 88,
  },
  {
    id: 'EC26-Z9P4L',
    teamName: 'EcoCharge Dynamics',
    leaderName: 'Kavya Patel',
    leaderEmail: 'ka****@uietkuk.ac.in',
    leaderPhone: '+91 ******3210',
    teamSize: '3',
    trackId: 'cleantech',
    trackLabel: 'Climate & Sustainability',
    idea: 'Smart solar-assisted EV battery swapping station network with automated thermal balancing and predictive demand dispatching across urban hubs.',
    pitchDeckUrl: 'https://drive.google.com/file/d/ecocharge-pitch/view',
    members: [
      { name: 'Rohan Verma', email: 'ro****@uietkuk.ac.in', phone: '******5678' },
      { name: 'Sneha Rao', email: 'sn****@uietkuk.ac.in', phone: '' },
    ],
    submittedAt: '2026-03-25',
    status: 'Shortlisted for Mentorship',
    score: 92,
  },
  {
    id: 'EC26-K3W7V',
    teamName: 'FinFlow Web3',
    leaderName: 'Aditya Roy',
    leaderEmail: 'ad****@college.edu.in',
    leaderPhone: '+91 ******6655',
    teamSize: '2',
    trackId: 'fintech-web3',
    trackLabel: 'FinTech & Web3',
    idea: 'Decentralized invoice discounting marketplace for MSME exporters with instant rupee settlement and automated lien verification.',
    pitchDeckUrl: 'https://canva.com/design/finflow-pitch-deck',
    members: [{ name: 'Deepak Sen', email: 'de****@college.edu.in' }],
    submittedAt: '2026-03-22',
    status: 'Under Review',
    score: 81,
  },
  {
    id: 'EC26-M5X9Q',
    teamName: 'NeuroPulse BioMed',
    leaderName: 'Dr. Tanya Malik',
    leaderEmail: 'ta****@medtech.org',
    leaderPhone: '+91 ******3344',
    teamSize: '4',
    trackId: 'healthtech',
    trackLabel: 'HealthTech & Bio',
    idea: 'Low-cost portable EEG headset paired with edge CNN algorithms for non-invasive rapid stroke detection in rural ambulance triage.',
    pitchDeckUrl: 'https://notion.so/neuropulse-pitch-docket',
    members: [
      { name: 'Vikas Kumar', email: 'vi****@medtech.org' },
      { name: 'Aarav Nair', email: 'aa****@medtech.org' },
      { name: 'Meera Iyer', email: 'me****@medtech.org' },
    ],
    submittedAt: '2026-03-20',
    status: 'Demo Day Finalist',
    score: 96,
  },
  {
    id: 'EC26-R2T8S',
    teamName: 'AgroSense IoT',
    leaderName: 'Manish Chawla',
    leaderEmail: 'manish.c@uietkuk.ac.in',
    leaderPhone: '+91 9411223344',
    teamSize: '1',
    trackId: 'cleantech',
    trackLabel: 'Climate & Sustainability',
    idea: 'Sub-surface soil microbiome and moisture sensors linked with satellite telemetry to reduce fertilizer runoff by 40%.',
    submittedAt: '2026-03-26',
    status: 'Stage 1 Submitted',
  },
];

interface TeamDashboardTableProps {
  teams: RegisteredTeamRecord[];
  onFlipToRegister: () => void;
}

export function TeamDashboardTable({ teams, onFlipToRegister }: TeamDashboardTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTrack, setSelectedTrack] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [activeModalTeam, setActiveModalTeam] = useState<RegisteredTeamRecord | null>(null);

  // Single-Pass O(N) Metrics Calculation
  const metrics = useMemo(() => {
    let shortlisted = 0;
    let finalists = 0;
    for (let i = 0; i < teams.length; i++) {
      const status = teams[i].status;
      if (status === 'Demo Day Finalist') {
        finalists++;
        shortlisted++;
      } else if (status === 'Shortlisted for Mentorship') {
        shortlisted++;
      }
    }
    return {
      total: teams.length,
      shortlisted,
      finalists,
    };
  }, [teams]);

  // Optimized Filtered Teams Query with O(1) Fast-Path
  const filteredTeams = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    const isAllTracks = selectedTrack === 'all';
    const isAllStatuses = selectedStatus === 'all';

    // Fast path: no filters active
    if (!query && isAllTracks && isAllStatuses) {
      return teams;
    }

    return teams.filter((team) => {
      const matchesTrack = isAllTracks || team.trackId === selectedTrack;
      if (!matchesTrack) return false;

      const matchesStatus = isAllStatuses || team.status === selectedStatus;
      if (!matchesStatus) return false;

      if (!query) return true;

      return (
        team.teamName.toLowerCase().includes(query) ||
        team.leaderName.toLowerCase().includes(query) ||
        team.id.toLowerCase().includes(query) ||
        team.trackLabel.toLowerCase().includes(query)
      );
    });
  }, [teams, searchTerm, selectedTrack, selectedStatus]);

  // Status Styling Helper
  const getStatusBadge = (status: RegisteredTeamRecord['status']) => {
    switch (status) {
      case 'Demo Day Finalist':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />
            <span>Demo Day Finalist 🏆</span>
          </span>
        );
      case 'Shortlisted for Mentorship':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Shortlisted (Stage 2)</span>
          </span>
        );
      case 'Under Review':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>Under Review</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            <span>Stage 1 Submitted</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-5">
      {/* ── Top Header Strip ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-400">
              Live Team Registry & Evaluation Portal
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white font-heading mt-0.5">
            Registered Startups & Application Status
          </h2>
        </div>

        <button
          onClick={onFlipToRegister}
          className="btn-ember text-xs sm:text-sm py-2.5 px-4 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Register New Team ➔</span>
        </button>
      </div>

      {/* ── Key Portal Metrics Strip (O(1) from memoized single pass) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="ecell-card p-3 bg-bg-card/70">
          <p className="text-[10px] font-mono uppercase text-slate-400">Total Applications</p>
          <p className="text-xl font-bold text-white font-heading mt-0.5">{metrics.total}</p>
        </div>
        <div className="ecell-card p-3 bg-bg-card/70">
          <p className="text-[10px] font-mono uppercase text-slate-400">Shortlisted for Mentorship</p>
          <p className="text-xl font-bold text-emerald-400 font-heading mt-0.5">{metrics.shortlisted}</p>
        </div>
        <div className="ecell-card p-3 bg-bg-card/70">
          <p className="text-[10px] font-mono uppercase text-slate-400">Demo Day Finalists</p>
          <p className="text-xl font-bold text-purple-400 font-heading mt-0.5">{metrics.finalists}</p>
        </div>
        <div className="ecell-card p-3 bg-bg-card/70">
          <p className="text-[10px] font-mono uppercase text-slate-400">Current Stage</p>
          <p className="text-sm font-bold text-amber-400 font-heading mt-1">Stage 1 Screening</p>
        </div>
      </div>

      {/* ── Search & Filters Bar ── */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        {/* Search */}
        <div className="sm:col-span-6 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by team, founder, ref ID, or keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="ecell-input pl-9 text-xs"
          />
        </div>

        {/* Track Filter */}
        <div className="sm:col-span-3">
          <select
            value={selectedTrack}
            onChange={(e) => setSelectedTrack(e.target.value)}
            aria-label="Filter teams by competition track"
            className="ecell-input text-xs cursor-pointer"
          >
            <option value="all">All Tracks ({TRACK_OPTIONS.length})</option>
            {TRACK_OPTIONS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="sm:col-span-3">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            aria-label="Filter teams by application status"
            className="ecell-input text-xs cursor-pointer"
          >
            <option value="all">All Review Statuses</option>
            <option value="Stage 1 Submitted">Stage 1 Submitted</option>
            <option value="Under Review">Under Review</option>
            <option value="Shortlisted for Mentorship">Shortlisted (Stage 2)</option>
            <option value="Demo Day Finalist">Demo Day Finalist</option>
          </select>
        </div>
      </div>

      {/* ── Applications Data Table ── */}
      <div className="ecell-card overflow-hidden border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-bg-input/80 border-b border-white/10 text-[11px] font-mono uppercase text-slate-400">
                <th className="py-3 px-4 font-semibold">Ref ID & Startup</th>
                <th className="py-3 px-4 font-semibold">Track Vertical</th>
                <th className="py-3 px-4 font-semibold">Team Roster</th>
                <th className="py-3 px-4 font-semibold">Pitch / Deck</th>
                <th className="py-3 px-4 font-semibold">Evaluation Status</th>
                <th className="py-3 px-4 font-semibold text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs text-slate-300">
              {filteredTeams.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-500 font-mono text-xs">
                    No teams found matching the filters.
                  </td>
                </tr>
              ) : (
                filteredTeams.map((team) => (
                  <tr key={team.id} className="hover:bg-white/5 transition-colors">
                    {/* Startup & ID */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white font-heading text-sm">{team.teamName}</div>
                      <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <span className="text-blue-400 font-semibold">{team.id}</span>
                        <span>•</span>
                        <span>{team.submittedAt}</span>
                      </div>
                    </td>

                    {/* Track */}
                    <td className="py-3.5 px-4">
                      <span className="inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-white/5 border border-white/5 text-slate-200">
                        {team.trackLabel}
                      </span>
                    </td>

                    {/* Team Roster */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-600/30 text-blue-300 font-mono text-[10px] flex items-center justify-center font-bold">
                          {team.teamSize}
                        </div>
                        <div>
                          <div className="font-medium text-white">{team.leaderName} (Lead)</div>
                          <div className="text-[11px] text-slate-400">
                            {team.members && team.members.length > 0
                              ? `+ ${team.members.length} co-founder(s)`
                              : 'Solo Founder'}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Pitch / Deck */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="truncate text-slate-300 text-xs">{team.idea}</p>
                      {team.pitchDeckUrl && (
                        <a
                          href={team.pitchDeckUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-[#e8702a] hover:underline mt-1 font-mono"
                        >
                          <FileText className="w-3 h-3" />
                          <span>View Deck Link</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">{getStatusBadge(team.status)}</td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setActiveModalTeam(team)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-blue-600 hover:text-white text-slate-400 transition-colors cursor-pointer"
                        title="View Full Application Docket"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modal: Team Full Application Docket ── */}
      {activeModalTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-slide-down">
          <div className="ecell-card p-6 max-w-lg w-full bg-[#0d111a] border-slate-700 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-white/10">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-blue-400">
                  {activeModalTeam.id} • {activeModalTeam.trackLabel}
                </span>
                <h3 className="text-xl font-bold text-white font-heading mt-1">
                  {activeModalTeam.teamName}
                </h3>
              </div>
              <button
                onClick={() => setActiveModalTeam(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg bg-white/5 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="py-4 space-y-4 text-xs text-slate-300">
              {/* Status Banner */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                <span className="font-semibold text-slate-400">Application Status:</span>
                {getStatusBadge(activeModalTeam.status)}
              </div>

              {/* Pitch Concept */}
              <div>
                <h5 className="font-bold text-white uppercase text-[11px] font-mono mb-1">
                  Startup Idea / Abstract:
                </h5>
                <p className="p-3 rounded-xl bg-bg-input border border-white/5 leading-relaxed text-slate-200">
                  {activeModalTeam.idea}
                </p>
              </div>

              {/* Pitch Deck Link */}
              {activeModalTeam.pitchDeckUrl && (
                <div>
                  <h5 className="font-bold text-white uppercase text-[11px] font-mono mb-1">
                    Attached Pitch Deck:
                  </h5>
                  <a
                    href={activeModalTeam.pitchDeckUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-xl bg-bg-input border border-white/5 flex items-center justify-between text-blue-400 hover:underline"
                  >
                    <span className="truncate">{activeModalTeam.pitchDeckUrl}</span>
                    <ExternalLink className="w-4 h-4 shrink-0" />
                  </a>
                </div>
              )}

              {/* Team Roster with strict PII privacy masking */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-bold text-white uppercase text-[11px] font-mono flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-amber-400" />
                    Registered Team Roster ({activeModalTeam.teamSize} Members):
                  </h5>
                  <span className="text-[10px] font-mono text-emerald-400/80 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                    <span>🔒</span>
                    <span>Contact Info Protected</span>
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="p-2.5 rounded-lg bg-bg-input border border-white/5 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-white block">{activeModalTeam.leaderName}</span>
                      <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
                        <span>{maskEmail(activeModalTeam.leaderEmail)}</span>
                        <span>•</span>
                        <span>{maskPhone(activeModalTeam.leaderPhone)}</span>
                      </span>
                    </div>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-blue-500/10 text-blue-400">
                      Leader
                    </span>
                  </div>

                  {activeModalTeam.members?.map((m, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-lg bg-bg-input/60 border border-white/5 flex items-center justify-between"
                    >
                      <div>
                        <span className="font-semibold text-slate-200 block">{m.name}</span>
                        <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
                          <span>{maskEmail(m.email)}</span>
                          {m.phone && (
                            <>
                              <span>•</span>
                              <span>{maskPhone(m.phone)}</span>
                            </>
                          )}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white/5 text-slate-400">
                        Member {i + 2}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-white/10 flex justify-end">
              <button
                onClick={() => setActiveModalTeam(null)}
                className="btn-secondary text-xs py-2 px-4 cursor-pointer"
              >
                Close Docket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
