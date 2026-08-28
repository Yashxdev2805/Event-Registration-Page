import { useState, memo } from 'react';
import { ChevronDown, HelpCircle, CheckCircle2 } from 'lucide-react';

const FAQS_DATA = [
  {
    q: 'Who can register for the E-Cell Start-up Pitch Competition?',
    a: 'Any college student (Undergraduate, Postgraduate, or Diploma) with a valid college identity card can participate. Inter-college teams and cross-disciplinary teams are fully permitted.',
  },
  {
    q: 'Can solo founders participate, or is a team required?',
    a: 'Both solo founders and teams of up to 4 members are eligible. Select your team size (1 to 4) when filling out the registration form.',
  },
  {
    q: 'Do I need a working product/MVP to apply?',
    a: 'No. Ideas at all stages — from early-stage concept and wireframes to functional prototypes and active revenue — are evaluated fairly based on problem depth, market potential, and feasibility.',
  },
  {
    q: 'What is the pitch format for the Grand Finale?',
    a: 'Shortlisted teams present a 3-minute live pitch followed by 2 minutes of Q&A with the investor panel. Pitch decks must be concise (recommended 5–7 slides).',
  },
  {
    q: 'Is there any registration fee?',
    a: 'No. Registration is 100% free for all students.',
  },
  {
    q: 'When will the shortlisted teams be announced?',
    a: 'Stage 1 screening results will be announced on April 4 via email and the official E-Cell notice channels.',
  },
];

export const FAQSection = memo(function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const faqs = FAQS_DATA;

  return (
    <section id="faqs" className="py-12 border-t border-slate-800/80">
      <div className="flex items-center gap-2 mb-2">
        <span className="w-6 h-0.5 bg-blue-500 rounded-full" />
        <span className="text-xs font-bold tracking-wider text-blue-400 uppercase font-mono">
          Guidelines & Queries
        </span>
      </div>

      <div className="mb-8">
        <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-heading">
          Frequently Asked Questions
        </h3>
        <p className="text-sm text-slate-400 mt-1 max-w-xl">
          Everything you need to know about eligibility, evaluation criteria, and event format.
        </p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;

          return (
            <div
              key={idx}
              className="ecell-card overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 hover:bg-white/2 transition-colors cursor-pointer"
                aria-expanded={isOpen}
              >
                <div className="flex items-center gap-3">
                  <HelpCircle className="w-4 h-4 text-blue-400 shrink-0" />
                  <span className="text-sm font-semibold text-slate-200 font-heading">
                    {faq.q}
                  </span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                    isOpen ? 'transform rotate-180 text-blue-400' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0 border-t border-white/5">
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed pl-7 pt-3">
                    {faq.a}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Judging Criteria Matrix */}
      <div className="mt-8 p-5 ecell-card">
        <h4 className="text-sm font-bold text-white mb-3 font-heading flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-blue-400" />
          Judging & Evaluation Weightage
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          {[
            { metric: 'Problem & Value Proposition', weight: '30%' },
            { metric: 'Market Opportunity & Scalability', weight: '25%' },
            { metric: 'Innovation & Differentiation', weight: '25%' },
            { metric: 'Pitch Clarity & Q&A Response', weight: '20%' },
          ].map((item, i) => (
            <div key={i} className="bg-bg-input p-3 rounded-xl border border-white/5">
              <div className="text-lg font-extrabold text-blue-400 font-mono">
                {item.weight}
              </div>
              <div className="text-[11px] text-slate-300 font-medium mt-0.5">
                {item.metric}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});
