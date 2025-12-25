
import React from 'react';

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
    label?: string;
    containerClassName?: string;
};

export default function Select({ label, id, multiple, className, containerClassName, ...props }: SelectProps) {
    const selectId = id || (label ? `select-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);
    // Use a fixed height for single select to ensure alignment, taller for multiple
    const multipleClasses = multiple ? 'h-32 py-2' : 'h-[42px]'; 

    return (
        <div className={containerClassName}>
            {label && (
                <label htmlFor={selectId} className="block text-xs font-bold text-zinc-500 mb-1.5 uppercase tracking-wide">
                    {label}
                </label>
            )}
            <div className="relative">
                <select
                    id={selectId}
                    multiple={multiple}
                    className={`
                        appearance-none w-full px-3 py-2.5
                        bg-white dark:bg-zinc-900 
                        border border-zinc-300 dark:border-zinc-700 
                        rounded-lg shadow-sm text-sm 
                        text-zinc-900 dark:text-white
                        placeholder:text-zinc-400
                        focus:outline-none focus:border-zinc-800 focus:ring-1 focus:ring-zinc-800 
                        dark:focus:border-zinc-500 dark:focus:ring-zinc-500
                        transition-all duration-200
                        disabled:bg-zinc-50 disabled:text-zinc-500 dark:disabled:bg-zinc-800
                        ${multipleClasses} 
                        ${className || ''}
                    `}
                    {...props}
                />
                {!multiple && (
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-zinc-500">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" /></svg>
                    </div>
                )}
            </div>
        </div>
    );
}
