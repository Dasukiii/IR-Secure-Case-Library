import type { InputHTMLAttributes } from 'react';
import { forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, helperText, className = '', id, ...props }, ref) => {
        const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="block text-sm font-medium text-slate-700 mb-1.5"
                    >
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    id={inputId}
                    className={`
            w-full px-3.5 py-2.5 text-sm
            border rounded-lg
            bg-white text-slate-900
            placeholder:text-slate-400
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-offset-0
            ${error
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                            : 'border-slate-200 focus:border-sky-500 focus:ring-sky-500/20'
                        }
            disabled:opacity-50 disabled:bg-slate-50 disabled:cursor-not-allowed
            ${className}
          `}
                    {...props}
                />
                {error && (
                    <p className="mt-1.5 text-sm text-red-600">{error}</p>
                )}
                {helperText && !error && (
                    <p className="mt-1.5 text-sm text-slate-500">{helperText}</p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';
