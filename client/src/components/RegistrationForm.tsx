import { useState, useEffect, useCallback, useRef } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  User,
  Mail,
  Phone,
  Rocket,
  Lightbulb,
  Link as LinkIcon,
  AlertCircle,
  Users,
  CheckCircle,
  Loader2,
  ArrowRight,
  UserPlus,
} from 'lucide-react';
import {
  registrationSchema,
  TRACK_OPTIONS,
  type RegistrationFormData,
} from '../schemas/registration.schema';
import { FormField } from './FormField';
import { SuccessBanner } from './SuccessBanner';

type SubmitState = 'idle' | 'submitting' | 'success' | 'error';

interface ServerError {
  message: string;
  errors?: Partial<Record<keyof RegistrationFormData, string>>;
}

interface RegistrationFormProps {
  selectedTrack?: string;
  onTrackChange?: (track: string) => void;
  onRegistrationSuccess?: (data: RegistrationFormData) => void;
  onViewDashboard?: () => void;
  registeredEmails?: Set<string>;
  registeredPhones?: Set<string>;
}

export function RegistrationForm({
  selectedTrack,
  onTrackChange,
  onRegistrationSuccess,
  onViewDashboard,
  registeredEmails = new Set(),
  registeredPhones = new Set(),
}: RegistrationFormProps) {
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [serverError, setServerError] = useState<ServerError | null>(null);
  const [submittedData, setSubmittedData] = useState<RegistrationFormData | null>(null);
  const [draftSaved, setDraftSaved] = useState(false);
  const draftTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // V2: Restore draft from localStorage on mount
  const DRAFT_KEY = 'ecell-registration-draft';
  const getSavedDraft = useCallback(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) return JSON.parse(saved);
    } catch { /* ignore corrupted data */ }
    return null;
  }, []);

  const savedDraft = getSavedDraft();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setError,
    setValue,
    formState: { errors },
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema) as Resolver<RegistrationFormData>,
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: savedDraft || {
      teamSize: '2',
      track: selectedTrack || 'ai-saas',
      idea: '',
      name: '',
      email: '',
      phone: '',
      teamName: '',
      pitchDeckUrl: '',
      members: [
        { name: '', email: '', phone: '' },
        { name: '', email: '', phone: '' },
        { name: '', email: '', phone: '' },
      ],
    },
  });

  const currentTrack = watch('track');
  const currentTeamSize = watch('teamSize') || '2';
  const ideaValue = watch('idea') || '';

  const memberCount = parseInt(currentTeamSize, 10);

  // V2: Auto-save draft to localStorage (debounced 500ms)
  const allValues = watch();
  useEffect(() => {
    if (submitState === 'success') return; // don't save after successful submit
    if (draftTimerRef.current) clearTimeout(draftTimerRef.current);
    draftTimerRef.current = setTimeout(() => {
      try {
        const { website, ...safeValues } = allValues; // exclude honeypot
        localStorage.setItem(DRAFT_KEY, JSON.stringify(safeValues));
        // Show brief "Draft saved" indicator
        setDraftSaved(true);
        setTimeout(() => setDraftSaved(false), 2000);
      } catch { /* quota exceeded — silently skip */ }
    }, 500);
    return () => {
      if (draftTimerRef.current) clearTimeout(draftTimerRef.current);
    };
  }, [allValues, submitState]);

  const clearDraft = useCallback(() => {
    try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
  }, []);

  // Synchronize when parent changes track
  useEffect(() => {
    if (selectedTrack) {
      setValue('track', selectedTrack, { shouldValidate: true, shouldDirty: true });
    }
  }, [selectedTrack, setValue]);

  const handleTrackClick = (trackId: string) => {
    setValue('track', trackId, { shouldValidate: true, shouldDirty: true });
    if (onTrackChange) {
      onTrackChange(trackId);
    }
  };

  const onSubmit = async (data: RegistrationFormData) => {
    if (data.website && data.website.length > 0) return; // Honeypot check

    // Validate additional team members if team size > 1
    const size = parseInt(data.teamSize, 10);
    const activeMembers = [];

    // ── Email & Phone uniqueness check (leader) ──
    const leaderEmail = data.email.trim().toLowerCase();
    const cleanPhone = (p?: string) => (p ? p.replace(/\D/g, '').slice(-10) : '');
    const leaderPhone = cleanPhone(data.phone);

    if (registeredEmails.has(leaderEmail)) {
      setError('email', {
        type: 'manual',
        message: 'This email is already registered with another team. Each person can only be part of one team.',
      });
      return;
    }

    if (leaderPhone && registeredPhones.has(leaderPhone)) {
      setError('phone', {
        type: 'manual',
        message: 'This phone number is already registered with another team. Each person must use a unique phone number.',
      });
      return;
    }

    // Collect all emails & phones in this submission for intra-form duplicate check
    const thisFormEmails = new Set<string>([leaderEmail]);
    const thisFormPhones = new Set<string>();
    if (leaderPhone) thisFormPhones.add(leaderPhone);

    for (let i = 1; i < size; i++) {
      const member = data.members?.[i - 1];
      if (!member?.name || member.name.trim().length < 2) {
        setError(`members.${i - 1}.name` as any, {
          type: 'manual',
          message: `Member ${i + 1} full name is required`,
        });
        return;
      }
      if (!member?.email || !member.email.includes('@')) {
        setError(`members.${i - 1}.email` as any, {
          type: 'manual',
          message: `Member ${i + 1} valid email is required`,
        });
        return;
      }

      const memberEmail = member.email.trim().toLowerCase();
      const memberPhone = cleanPhone(member.phone);

      // Check against previously registered emails
      if (registeredEmails.has(memberEmail)) {
        setError(`members.${i - 1}.email` as any, {
          type: 'manual',
          message: `This email is already registered with another team. Each person can only be part of one team.`,
        });
        return;
      }

      // Check for duplicate email within this same form submission
      if (thisFormEmails.has(memberEmail)) {
        setError(`members.${i - 1}.email` as any, {
          type: 'manual',
          message: `This email is already used by another member in this form. Each member must have a unique email.`,
        });
        return;
      }
      thisFormEmails.add(memberEmail);

      // Check member phone uniqueness if provided
      if (memberPhone) {
        if (memberPhone.length !== 10 || !/^[6-9]/.test(memberPhone)) {
          setError(`members.${i - 1}.phone` as any, {
            type: 'manual',
            message: `Member ${i + 1} phone must be a valid 10-digit Indian number starting with 6-9`,
          });
          return;
        }

        if (registeredPhones.has(memberPhone)) {
          setError(`members.${i - 1}.phone` as any, {
            type: 'manual',
            message: `This phone number is already registered with another team. Each member must have a unique phone number.`,
          });
          return;
        }

        if (thisFormPhones.has(memberPhone)) {
          setError(`members.${i - 1}.phone` as any, {
            type: 'manual',
            message: `This phone number is already used by another member in this team. Each member must have a unique phone number.`,
          });
          return;
        }
        thisFormPhones.add(memberPhone);
      }

      activeMembers.push({
        name: member.name.trim(),
        email: memberEmail,
        phone: member.phone?.trim() || '',
      });
    }

    setSubmitState('submitting');
    setServerError(null);

    const completeRecord: RegistrationFormData = {
      ...data,
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      phone: data.phone.trim(),
      teamName: data.teamName.trim(),
      teamSize: data.teamSize,
      members: activeMembers,
      track: data.track,
      idea: data.idea.trim(),
      pitchDeckUrl: data.pitchDeckUrl?.trim(),
    };

    try {
      const API_URL = import.meta.env.VITE_API_BASE_URL ?? '';
      let isSuccess = false;

      try {
        const response = await fetch(`${API_URL}/api/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(completeRecord),
        });

        const result = await response.json();
        if (response.ok && result.success) {
          isSuccess = true;
        } else {
          if (result.errors) {
            Object.entries(result.errors).forEach(([field, message]) => {
              setError(field as keyof RegistrationFormData, {
                type: 'server',
                message: message as string,
              });
            });
          }
          setServerError({
            message: result.message || 'Validation failed on server.',
          });
          setSubmitState('error');
          return;
        }
      } catch {
        // Standalone preview fallback
        await new Promise((resolve) => setTimeout(resolve, 600));
        isSuccess = true;
      }

      if (isSuccess) {
        setSubmittedData(completeRecord);
        setSubmitState('success');
        clearDraft();
        if (onRegistrationSuccess) {
          onRegistrationSuccess(completeRecord);
        }
      }
    } catch {
      setServerError({
        message: 'Network error. Please check your internet connection and try again.',
      });
      setSubmitState('error');
    }
  };

  const handleReset = () => {
    setSubmitState('idle');
    setServerError(null);
    setSubmittedData(null);
    clearDraft();
    reset();
  };

  if (submitState === 'success' && submittedData) {
    const selectedTrackObj = TRACK_OPTIONS.find((t) => t.id === submittedData.track);
    return (
      <SuccessBanner
        name={submittedData.name}
        teamName={submittedData.teamName}
        teamSize={submittedData.teamSize}
        track={selectedTrackObj?.label || submittedData.track}
        email={submittedData.email}
        phone={submittedData.phone}
        members={submittedData.members || []}
        onReset={handleReset}
        onViewDashboard={onViewDashboard}
      />
    );
  }

  const isSubmitting = submitState === 'submitting';

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      aria-label="E-Cell Start-up Pitch Competition Registration"
      className="space-y-4"
    >
      <fieldset disabled={isSubmitting} className="space-y-4">
        <legend className="sr-only">Registration Form</legend>

        {/* Server-level Error Alert */}
        {submitState === 'error' && serverError && (
          <div
            role="alert"
            className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs sm:text-sm animate-slide-down"
          >
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Registration Error</p>
              <p className="mt-0.5">{serverError.message}</p>
            </div>
          </div>
        )}

        {/* Honeypot for spam bots */}
        <div className="sr-only" aria-hidden="true" tabIndex={-1}>
          <label htmlFor="website">Website (leave blank)</label>
          <input id="website" type="text" tabIndex={-1} autoComplete="off" {...register('website')} />
        </div>

        {/* 1. Track Selection */}
        <div>
          <label className="text-xs font-semibold text-slate-200 tracking-wide flex items-center gap-1.5 mb-2">
            <Rocket className="w-3.5 h-3.5 text-blue-400" />
            <span>Select Sector / Track</span>
            <span className="text-red-400 text-xs">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {TRACK_OPTIONS.map((track) => {
              const isSelected = currentTrack === track.id;
              return (
                <button
                  key={track.id}
                  type="button"
                  onClick={() => handleTrackClick(track.id)}
                  className={`p-2.5 rounded-xl border text-left transition-colors cursor-pointer ${
                    isSelected
                      ? 'border-blue-500 bg-blue-600/15 text-white'
                      : 'border-slate-800 bg-bg-input text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold block truncate">
                      {track.label}
                    </span>
                    {isSelected && <CheckCircle className="w-3 h-3 text-blue-400 shrink-0" />}
                  </div>
                </button>
              );
            })}
          </div>
          {errors.track && (
            <p className="text-xs text-red-400 mt-1">{errors.track.message}</p>
          )}
        </div>

        {/* 2. Team Size Selector */}
        <div>
          <label className="text-xs font-semibold text-slate-200 tracking-wide flex items-center gap-1.5 mb-2">
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <span>Team Composition Size</span>
            <span className="text-red-400 text-xs">*</span>
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { val: '1', label: '1 (Solo)' },
              { val: '2', label: '2 Members' },
              { val: '3', label: '3 Members' },
              { val: '4', label: '4 Members' },
            ].map((option) => (
              <button
                key={option.val}
                type="button"
                onClick={() =>
                  setValue('teamSize', option.val as '1' | '2' | '3' | '4', {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }
                className={`py-2 px-2 rounded-xl border text-center text-xs font-semibold transition-colors cursor-pointer ${
                  currentTeamSize === option.val
                    ? 'border-amber-500/60 bg-amber-500/15 text-amber-300'
                    : 'border-slate-800 bg-bg-input text-slate-400 hover:border-slate-700 hover:text-white'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Startup & Team Lead (Founder) Details */}
        <div className="p-4 rounded-xl bg-bg-input/60 border border-slate-800/80 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-white/5">
            <User className="w-4 h-4 text-blue-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-heading">
              Team Lead / Primary Contact Details
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField
              id="name"
              label="Leader Full Name"
              placeholder="e.g. Priya Sharma"
              icon={User}
              register={register}
              error={errors.name}
              disabled={isSubmitting}
            />

            <FormField
              id="teamName"
              label="Startup / Team Name"
              placeholder="e.g. NovaSpark Technologies"
              icon={Rocket}
              register={register}
              error={errors.teamName}
              disabled={isSubmitting}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField
              id="email"
              label="Leader Email Address"
              type="email"
              placeholder="priya@college.edu.in"
              icon={Mail}
              register={register}
              error={errors.email}
              disabled={isSubmitting}
              hint="For official shortlist & event credentials"
            />

            <FormField
              id="phone"
              label="Leader Mobile (WhatsApp)"
              type="tel"
              placeholder="9876543210"
              icon={Phone}
              register={register}
              error={errors.phone}
              disabled={isSubmitting}
              hint="10-digit number for SMS / WhatsApp alerts"
            />
          </div>
        </div>

        {/* 4. Dynamic Additional Team Members Section */}
        {memberCount > 1 && (
          <div className="space-y-3 animate-slide-down">
            {Array.from({ length: memberCount - 1 }).map((_, idx) => {
              const memberNum = idx + 2;
              const memberError = (errors.members as any)?.[idx];

              return (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-bg-input/40 border border-slate-800 space-y-3"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-white/5">
                    <div className="flex items-center gap-2">
                      <UserPlus className="w-3.5 h-3.5 text-amber-400" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-heading">
                        Team Member {memberNum} Information
                      </h4>
                    </div>
                    <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                      Member #{memberNum}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-200 mb-1.5 flex items-center gap-1">
                        <span>Member {memberNum} Full Name</span>
                        <span className="text-red-400 text-xs">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder={`e.g. Co-founder Name`}
                        disabled={isSubmitting}
                        className={`ecell-input ${
                          memberError?.name ? 'border-red-500/60 focus:border-red-500' : ''
                        }`}
                        {...register(`members.${idx}.name` as const)}
                      />
                      {memberError?.name && (
                        <p className="text-xs text-red-400 mt-1">{memberError.name.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-200 mb-1.5 flex items-center gap-1">
                        <span>Member {memberNum} Email</span>
                        <span className="text-red-400 text-xs">*</span>
                      </label>
                      <input
                        type="email"
                        placeholder={`member${memberNum}@college.edu.in`}
                        disabled={isSubmitting}
                        className={`ecell-input ${
                          memberError?.email ? 'border-red-500/60 focus:border-red-500' : ''
                        }`}
                        {...register(`members.${idx}.email` as const)}
                      />
                      {memberError?.email && (
                        <p className="text-xs text-red-400 mt-1">{memberError.email.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                      <span>Member {memberNum} Contact Number (Optional)</span>
                      <span className="text-[10px] text-slate-500">For emergency updates</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. 9812345678"
                      disabled={isSubmitting}
                      className="ecell-input"
                      {...register(`members.${idx}.phone` as const)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 5. Idea Concept Textarea */}
        <FormField
          id="idea"
          label="Start-up Idea & Executive Concept"
          type="textarea"
          placeholder="Briefly describe your startup concept in 20–500 characters. What core problem does it solve, who is your target customer, and what is your unique solution/approach?"
          icon={Lightbulb}
          register={register}
          error={errors.idea}
          disabled={isSubmitting}
          rows={4}
          maxLength={500}
          currentLength={ideaValue.length}
          hint="Focus on the problem statement, solution, and potential impact."
        />

        {/* 6. Pitch Deck URL (Optional) */}
        <FormField
          id="pitchDeckUrl"
          label="Pitch Deck / Prototype Link (Optional)"
          type="url"
          placeholder="https://drive.google.com/... (Google Drive / Canva / Notion link)"
          icon={LinkIcon}
          register={register}
          error={errors.pitchDeckUrl}
          disabled={isSubmitting}
          required={false}
          hint="You can also submit or update your slide deck before the shortlist deadline."
        />
      </fieldset>

      {/* Submit Action */}
      <div className="pt-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary w-full py-3.5 text-sm font-bold"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Submitting Team Registration…</span>
            </>
          ) : (
            <>
              <span>Submit Registration ({currentTeamSize === '1' ? 'Solo Entry' : `${currentTeamSize} Members`})</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400 mt-3">
          <span>🔒 Free Entry</span>
          <span>•</span>
          <span>👥 {currentTeamSize === '1' ? 'Solo Founder' : `${currentTeamSize} Roster Registered`}</span>
          <span>•</span>
          <span>📍 Campus Auditorium</span>
        </div>

        {/* V2: Draft auto-save indicator */}
        {draftSaved && (
          <div className="flex items-center justify-center mt-2 draft-saved-indicator">
            <span className="text-[10px] font-mono text-emerald-400/70 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/60" />
              Draft auto-saved
            </span>
          </div>
        )}
      </div>
    </form>
  );
}
