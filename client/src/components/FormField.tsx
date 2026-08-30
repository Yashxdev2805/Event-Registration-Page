import { useState, useEffect } from 'react';
import type { UseFormRegister, FieldError } from 'react-hook-form';
import type { LucideIcon } from 'lucide-react';
import type { RegistrationFormData } from '../schemas/registration.schema';

interface FormFieldProps {
  id: keyof RegistrationFormData;
  label: string;
  type?: 'text' | 'email' | 'tel' | 'url' | 'textarea';
  placeholder?: string;
  register: UseFormRegister<RegistrationFormData>;
  error?: FieldError;
  disabled?: boolean;
  rows?: number;
  maxLength?: number;
  currentLength?: number;
  hint?: string;
  icon?: LucideIcon;
  required?: boolean;
}

export function FormField({
  id,
  label,
  type = 'text',
  placeholder,
  register,
  error,
  disabled,
  rows = 4,
  maxLength,
  currentLength = 0,
  hint,
  icon: Icon,
  required = true,
}: FormFieldProps) {
  const hasError = !!error;
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  // V2: Trigger shake animation each time a new error appears
  const [shakeKey, setShakeKey] = useState(0);
  useEffect(() => {
    if (hasError) {
      setShakeKey((prev) => prev + 1);
    }
  }, [hasError, error?.message]);

  return (
    <div className="mb-3.5">
      {/* Label and Character Count */}
      <div className="flex items-center justify-between mb-1.5">
        <label
          htmlFor={id}
          className="text-xs font-semibold text-slate-200 tracking-wide flex items-center gap-1.5"
        >
          {Icon && <Icon className="w-3.5 h-3.5 text-blue-400" />}
          <span>{label}</span>
          {required && (
            <span className="text-red-400 text-xs" aria-hidden="true">
              *
            </span>
          )}
        </label>

        {maxLength && currentLength !== undefined && (
          <span
            className={`text-[11px] font-mono tabular-nums ${
              currentLength >= maxLength
                ? 'text-red-400 font-bold'
                : currentLength > maxLength * 0.8
                ? 'text-amber-400'
                : 'text-slate-400'
            }`}
          >
            {currentLength}/{maxLength}
          </span>
        )}
      </div>

      {hint && (
        <p id={hintId} className="text-[11px] text-slate-400 mb-1.5">
          {hint}
        </p>
      )}

      {/* Input container — V2: shake-error on validation failure */}
      <div className={`relative ${hasError ? 'shake-error' : ''}`} key={hasError ? shakeKey : 'stable'}>
        {type === 'tel' && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none text-xs font-mono text-slate-400 border-r border-slate-700 pr-2.5 z-10 select-none">
            <span>🇮🇳</span>
            <span className="text-slate-200 font-bold">+91</span>
          </div>
        )}

        {type === 'textarea' ? (
          <textarea
            id={id}
            rows={rows}
            placeholder={placeholder}
            disabled={disabled}
            aria-invalid={hasError}
            aria-describedby={hasError ? errorId : hint ? hintId : undefined}
            className={`ecell-input resize-none sm:resize-y leading-relaxed ${
              hasError
                ? 'border-red-500/60 focus:border-red-500 focus:ring-red-500/20'
                : ''
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            {...register(id)}
          />
        ) : (
          <input
            id={id}
            type={type}
            placeholder={placeholder}
            disabled={disabled}
            aria-invalid={hasError}
            aria-describedby={hasError ? errorId : hint ? hintId : undefined}
            autoComplete={
              id === 'email'
                ? 'email'
                : id === 'phone'
                ? 'tel'
                : id === 'name'
                ? 'name'
                : undefined
            }
            style={type === 'tel' ? { paddingLeft: '4.85rem' } : undefined}
            className={`ecell-input ${type === 'tel' ? 'pl-20!' : ''} ${
              hasError
                ? 'border-red-500/60 focus:border-red-500 focus:ring-red-500/20'
                : ''
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            {...register(id)}
          />
        )}
      </div>

      {/* Inline Error Message */}
      <div className="min-h-4.5 mt-1">
        {hasError && (
          <p
            id={errorId}
            role="alert"
            aria-live="polite"
            className="flex items-center gap-1.5 text-xs text-red-400 font-medium animate-slide-down"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
            {error.message}
          </p>
        )}
      </div>
    </div>
  );
}
