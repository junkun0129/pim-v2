import React from 'react';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
};

export default function Button({ children, className, variant = 'primary', size = 'md', ...props }: ButtonProps) {
    const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none tracking-tight';

    const variantClasses = {
        primary: 'bg-zinc-900 hover:bg-zinc-800 text-white shadow-lg shadow-zinc-900/10 focus:ring-zinc-900 border border-transparent',
        secondary: 'bg-white hover:bg-zinc-50 text-zinc-700 border border-zinc-200 shadow-sm focus:ring-zinc-200',
        danger: 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 focus:ring-red-500',
        ghost: 'bg-transparent hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900'
    };

    const sizeClasses = {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base',
    };

    const combinedClasses = [
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className,
    ].join(' ');

    return (
        <button className={combinedClasses} {...props}>
            {children}
        </button>
    );
}