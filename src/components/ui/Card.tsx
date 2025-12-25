import React from 'react';

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
    children: React.ReactNode;
    className?: string;
    noPadding?: boolean;
};

export default function Card({ children, className, noPadding, ...props }: CardProps) {
    const combinedClasses = `
        bg-white dark:bg-zinc-900 
        ${noPadding ? '' : 'p-5 sm:p-7'} 
        rounded-xl 
        border border-zinc-200 dark:border-zinc-800 
        shadow-[0_2px_12px_-4px_rgba(0,0,0,0.02)] 
        transition-all duration-200
        hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]
        ${className || ''}
    `;
    return (
        <div className={combinedClasses} {...props}>
            {children}
        </div>
    );
}