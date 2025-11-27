import React from 'react';

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
    label?: string;
};

export default function Input({ label, id, className, ...props }: InputProps) {
    const inputId = id || (label ? `input-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);
    return (
        <div className={className}>
            {label && (
                <label htmlFor={inputId} className="block text-xs font-semibold text-zinc-500 mb-1.5 uppercase tracking-wide">
                    {label}
                </label>
            )}
            <input
                id={inputId}
                className="w-full px-3 py-2.5 bg-white border border-zinc-300 rounded-lg shadow-sm text-sm placeholder:text-zinc-400 focus:outline-none focus:border-zinc-800 focus:ring-1 focus:ring-zinc-800 transition-colors disabled:bg-zinc-50 disabled:text-zinc-500"
                {...props}
            />
        </div>
    );
}