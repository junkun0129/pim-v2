import React, { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
    id: string;
    type: ToastType;
    message: string;
}

interface ToastProps {
    toast: ToastMessage;
    onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose(toast.id);
        }, 3000);
        return () => clearTimeout(timer);
    }, [toast.id, onClose]);

    const typeStyles = {
        success: { bg: 'bg-zinc-900', icon: 'text-emerald-400' },
        error:   { bg: 'bg-red-600', icon: 'text-white' },
        info:    { bg: 'bg-zinc-800', icon: 'text-sky-400' },
    };

    const style = typeStyles[toast.type];

    return (
        <div className={`${style.bg} text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 min-w-[320px] animate-fade-in-up transition-all border border-white/10`}>
            {toast.type === 'success' && (
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${style.icon}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
            )}
            {toast.type === 'error' && (
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${style.icon}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
            )}
            <span className="flex-1 text-sm font-medium tracking-wide">{toast.message}</span>
            <button onClick={() => onClose(toast.id)} className="opacity-60 hover:opacity-100 transition-opacity">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
            </button>
        </div>
    );
};

export const ToastContainer: React.FC<{ toasts: ToastMessage[]; removeToast: (id: string) => void }> = ({ toasts, removeToast }) => (
    <div className="fixed bottom-6 right-6 z-[100] space-y-3">
        {toasts.map(t => <Toast key={t.id} toast={t} onClose={removeToast} />)}
    </div>
);