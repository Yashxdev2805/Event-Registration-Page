import { useState } from 'react';
import {
  Bot,
  Coins,
  Leaf,
  HeartPulse,
  GraduationCap,
  Sparkles,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Cpu,
  Target,
  ArrowRight,
} from 'lucide-react';
import { TRACK_OPTIONS, type TrackDetail } from '../schemas/registration.schema';

interface TracksSectionProps {
  selectedTrack?: string;
  onSelectTrack?: (trackId: string) => void;
}

export function TracksSection({ selectedTrack, onSelectTrack }: TracksSectionProps) {
  const [expandedTrackId, setExpandedTrackId] = useState<string | null>('ai-saas');

  const iconMap: Record<string, typeof Bot> = {
    'ai-saas': Bot,
    'fintech-web3': Coins,
    'cleantech': Leaf,
    'healthtech': HeartPulse,
    'consumer-edtech': GraduationCap,
    'open-innovation': Sparkles,
  };

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedTrackId(expandedTrackId === id ? null : id);
  };

  return (
    <section id="tracks" className="py-12 border-t border-slate-800/80">
      {/* Section Tag */}
      <div className="flex items-center gap-2 mb-2">
        <span className="w-6 h-0.5 bg-blue-500 rounded-full" />
        <span className="text-xs font-bold tracking-wider text-blue-400 uppercase font-mono">
          Sectors & Domains
        </span>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-heading">
            Competition Tracks & Problem Statements
          </h3>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Explore the 6 specialized startup verticals. Review the challenge themes, key technologies, and judge evaluation criteria to align your submission.
          </p>
        </div>

        <span className="text-xs font-semibold text-slate-400 bg-white/5 px-3 py-1.5 rounded-lg self-start md:self-auto border border-white/5">
          💡 Interdisciplinary teams can pick the closest fit or Open Innovation
        </span>
      </div>

      {/* Tracks Grid with Rich Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {TRACK_OPTIONS.map((track: TrackDetail) => {
          const Icon = iconMap[track.id] || Sparkles;
          const isSelected = selectedTrack === track.id;
          const isExpanded = expandedTrackId === track.id;

          return (
            <div
              key={track.id}
              onClick={() => onSelectTrack && onSelectTrack(track.id)}
              className={`ecell-card p-5.5 cursor-pointer flex flex-col justify-between transition-all duration-200 ${
                isSelected
                  ? 'border-blue-500 bg-[#0E172B] shadow-lg shadow-blue-500/10 ring-1 ring-blue-500/50'
                  : 'hover:border-slate-700 bg-bg-card'
              }`}
            >
              <div>
                {/* Header with Icon & Selected Tag */}
                <div className="flex items-center justify-between mb-3.5">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                        : 'bg-blue-500/10 text-blue-400'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  {isSelected ? (
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-blue-400" />
                      SELECTED
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-500 hover:text-blue-400 flex items-center gap-0.5 font-medium">
                      Select Track <ArrowRight className="w-3 h-3" />
                    </span>
                  )}
                </div>

                {/* Title & Short Desc */}
                <h4 className="font-bold text-base text-white font-heading mb-1.5">
                  {track.label}
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed mb-3">
                  {track.fullDesc}
                </p>

                {/* Challenge Themes Section */}
                <div className="bg-bg-input rounded-xl p-3.5 border border-white/5 mb-3">
                  <p className="text-[11px] font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5 mb-2">
                    <Target className="w-3.5 h-3.5 text-blue-400" />
                    Key Focus Themes:
                  </p>
                  <ul className="space-y-1.5">
                    {track.themes.map((theme, i) => (
                      <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                        <span className="leading-snug">{theme}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Collapsible Deep Detailing (Tech & Evaluation) */}
                {isExpanded && (
                  <div className="space-y-3 pt-2 border-t border-white/5 animate-slide-down">
                    {/* Technology Stacks */}
                    <div>
                      <p className="text-[11px] font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5 mb-1.5">
                        <Cpu className="w-3.5 h-3.5 text-amber-400" />
                        Target Tech / Tools:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {track.technologies.map((tech, i) => (
                          <span
                            key={i}
                            className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-slate-300 font-mono border border-white/5"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Judge Evaluation Focus */}
                    <div className="p-2.5 rounded-lg bg-blue-950/20 border border-blue-500/20">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-blue-400 font-mono mb-0.5">
                        Judge Scoring Focus:
                      </p>
                      <p className="text-[11px] text-slate-300 leading-snug">
                        {track.evaluationFocus}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Actions: Expand Toggle + Select */}
              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                <button
                  type="button"
                  onClick={(e) => toggleExpand(track.id, e)}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-medium transition-colors cursor-pointer"
                >
                  <span>{isExpanded ? 'Less Info' : 'Full Track Details'}</span>
                  {isExpanded ? (
                    <ChevronUp className="w-3.5 h-3.5 text-blue-400" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-blue-400" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => onSelectTrack && onSelectTrack(track.id)}
                  className={`text-xs font-semibold px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white'
                      : 'bg-white/5 text-slate-300 hover:bg-blue-600 hover:text-white'
                  }`}
                >
                  {isSelected ? 'Selected' : 'Choose Track'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
