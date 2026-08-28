import { Calendar, CheckCircle2, Presentation, Sparkles } from 'lucide-react';

export function TimelineSection() {
  const stages = [
    {
      step: '01',
      title: 'Online Registration',
      date: 'March 1 – March 30',
      desc: 'Submit your startup idea, team details, and optional pitch deck online.',
      icon: Calendar,
      status: 'Active',
    },
    {
      step: '02',
      title: 'Idea Screening & Shortlist',
      date: 'April 2 – April 4',
      desc: 'Expert panel evaluates submissions based on innovation, market fit, and feasibility.',
      icon: CheckCircle2,
      status: 'Upcoming',
    },
    {
      step: '03',
      title: 'Mentorship & Deck Polish',
      date: 'April 6 – April 8',
      desc: 'Shortlisted teams get 1-on-1 feedback from experienced founders and VCs.',
      icon: Sparkles,
      status: 'Upcoming',
    },
    {
      step: '04',
      title: 'Grand Finale Pitch',
      date: 'April 12, 2026',
      desc: 'Live 3-minute pitch + Q&A in front of the jury at the Campus Auditorium.',
      icon: Presentation,
      status: 'Finale',
    },
  ];

  return (
    <section id="timeline" className="py-12 border-t border-slate-800/80">
      <div className="flex items-center gap-2 mb-2">
        <span className="w-6 h-0.5 bg-blue-500 rounded-full" />
        <span className="text-xs font-bold tracking-wider text-blue-400 uppercase font-mono">
          Event Roadmap
        </span>
      </div>

      <div className="mb-8">
        <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-heading">
          Competition Timeline
        </h3>
        <p className="text-sm text-slate-400 mt-1 max-w-xl">
          Mark your calendar for each stage of the competition from submission to final pitch.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stages.map((stage) => {
          const Icon = stage.icon;
          const isActive = stage.status === 'Active';

          return (
            <div
              key={stage.step}
              className={`ecell-card p-5 relative overflow-hidden flex flex-col justify-between ${
                isActive
                  ? 'border-blue-500/50 bg-[#0E172B]'
                  : 'bg-bg-card'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl font-black text-slate-600 font-heading">
                    {stage.step}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-blue-500 text-white'
                        : 'bg-white/5 text-slate-400'
                    }`}
                  >
                    {stage.status}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-white font-heading mb-1">
                  {stage.title}
                </h4>
                <p className="text-xs text-blue-400 font-semibold mb-2 font-mono">
                  {stage.date}
                </p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {stage.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-2 text-xs text-slate-500">
                <Icon className="w-3.5 h-3.5 text-blue-400" />
                <span>Stage {stage.step}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
