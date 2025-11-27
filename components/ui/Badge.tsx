import React from 'react';

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
    children: React.ReactNode;
    color?: 'blue' | 'green' | 'purple' | 'gray' | 'red';
};

export default function Badge({ children, color = 'blue', ...props }: BadgeProps) {
    const colorClasses = {
        blue: 'bg-blue-50 text-blue-700 border-blue-200',
        green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        purple: 'bg-purple-50 text-purple-700 border-purple-200',
        gray: 'bg-zinc-100 text-zinc-600 border-zinc-200',
        red: 'bg-red-50 text-red-700 border-red-200',
    }
    
    // Fallback for default
    const selectedColor = colorClasses[color] || colorClasses.gray;

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${selectedColor}`} {...props}>
            {children}
        </span>
    );
}