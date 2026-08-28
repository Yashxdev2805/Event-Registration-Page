import { memo } from 'react';
import { Trophy, Award, Building2, Cloud, Users, Sparkles } from 'lucide-react';

const PRIZES_DATA = [
  {
    place: '1ST PRIZE',
    badge: 'Winner',
    amount: '₹50,000',
    subtitle: 'Direct Cash Grant',
    badgeStyle: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
    borderStyle: 'border-amber-500/40 hover:border-amber-400',
    perks: [
      'Direct Entry to Angel Investor Demo Day',
      '₹5,00,000 AWS & Cloud Credits',
      '3 Months Incubation Support',
      '1-on-1 VC Mentorship Sessions',
    ],
  },
  {
    place: '2ND PRIZE',
    badge: '1st Runner Up',
    amount: '₹30,000',
    subtitle: 'Direct Cash Grant',
    badgeStyle: 'bg-slate-300/20 text-slate-200 border border-slate-300/30',
    borderStyle: 'border-slate-500/40 hover:border-slate-400',
    perks: [
      'VC Office Hours & Pitch Audit',
      '₹2,50,000 Cloud & Tool Credits',
      'Co-Working Space Pass (1 Month)',
      'E-Cell Growth Network Access',
    ],
  },
  {
    place: '3RD PRIZE',
    badge: '2nd Runner Up',
    amount: '₹20,000',
    subtitle: 'Direct Cash Grant',
    badgeStyle: 'bg-orange-500/20 text-orange-300 border border-orange-500/30',
    borderStyle: 'border-orange-500/40 hover:border-orange-400',
    perks: [
      'Founder Strategy & Go-To-Market Session',
      '₹1,00,000 Dev Credits & Developer Tools',
      'Legal & IP Mentorship Guidance',
      'Merit Certificate & Trophy',
    ],
  },
];

export const PrizesSection = memo(function PrizesSection() {
  const prizes = PRIZES_DATA;

  return (
    <section id="prizes" className="py-12 border-t border-slate-800/80">
      <div className="flex items-center gap-2 mb-2">
        <span className="w-6 h-0.5 bg-amber-400 rounded-full" />
        <span className="text-xs font-bold tracking-wider text-amber-400 uppercase font-mono">
          Grants & Incentives
        </span>
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-heading">
            ₹1,00,000+ Prize Pool & Perks
          </h3>
          <p className="text-sm text-slate-400 mt-1 max-w-xl">
            Incentives designed to accelerate early-stage student founders with funding, incubation, and investor reach.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold self-start md:self-auto">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span>Top 10 Finalists get Demo Day Access</span>
        </div>
      </div>

      {/* Prize Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {prizes.map((prize) => (
          <div
            key={prize.place}
            className={`ecell-card p-6 border ${prize.borderStyle} flex flex-col justify-between`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase ${prize.badgeStyle}`}>
                  {prize.badge}
                </span>
                <Trophy className="w-5 h-5 text-amber-400" />
              </div>

              <div className="mb-4">
                <div className="text-3xl font-extrabold text-white font-heading tracking-tight">
                  {prize.amount}
                </div>
                <div className="text-xs text-slate-400 font-medium mt-0.5">
                  {prize.subtitle} + Startup Pack
                </div>
              </div>

              <div className="space-y-2 border-t border-white/5 pt-4">
                {prize.perks.map((perk, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                    <span className="text-blue-400 font-bold">✓</span>
                    <span>{perk}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-white/5 text-[11px] font-mono text-slate-500 text-center uppercase tracking-wider">
              {prize.place}
            </div>
          </div>
        ))}
      </div>

      {/* Additional Value Banner */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: Building2, label: 'Incubation', sub: '3 Months Support' },
          { icon: Cloud, label: 'Cloud Credits', sub: 'AWS & GCP Tier' },
          { icon: Users, label: 'Angel Network', sub: 'Investor Demo Day' },
          { icon: Award, label: 'Certificates', sub: 'Official E-Cell Credential' },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="bg-bg-card p-3 rounded-xl border border-white/5 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-200">{item.label}</p>
                <p className="text-[10px] text-slate-400">{item.sub}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
});
