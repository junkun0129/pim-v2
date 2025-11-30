import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useData } from '../contexts/DataContext';
import { ToastContainer } from '../components/ui/Toast';
import { ViewType } from '../types';

export default function MainLayout() {
    const { currentUser, currentUserRole, users, setCurrentUserId, handleLogout, notifications, toasts, removeToast } = useData();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const getActiveView = (path: string): ViewType => {
        if (path.includes('/series')) return 'Series';
        if (path.includes('/categories')) return 'Categories';
        if (path.includes('/attributes')) return 'Attributes';
        if (path.includes('/sets')) return 'Attribute Sets';
        if (path.includes('/orders')) return 'Orders';
        if (path.includes('/ec')) return 'EC';
        if (path.includes('/creative')) return 'CREATIVE';
        if (path.includes('/catalog')) return 'CATALOG';
        if (path.includes('/projects')) return 'PROJECTS';
        if (path.includes('/export')) return 'CHANNEL_EXPORT';
        if (path.includes('/admin')) return 'ADMIN';
        if (path.includes('/store')) return 'EXTENSION_STORE';
        if (path.includes('/notifications')) return 'NOTIFICATIONS';
        return 'SKUs'; 
    };

    const handleNavigate = (view: ViewType) => {
        switch(view) {
            case 'SKUs': navigate('/skus'); break;
            case 'Series': navigate('/series'); break;
            case 'Categories': navigate('/categories'); break;
            case 'Attributes': navigate('/attributes'); break;
            case 'Attribute Sets': navigate('/sets'); break;
            case 'Orders': navigate('/orders'); break;
            case 'EC': navigate('/ec'); break;
            case 'CREATIVE': navigate('/creative'); break;
            case 'CATALOG': navigate('/catalog'); break;
            case 'PROJECTS': navigate('/projects'); break;
            case 'CHANNEL_EXPORT': navigate('/export'); break;
            case 'ADMIN': navigate('/admin'); break;
            case 'EXTENSION_STORE': navigate('/store'); break;
            case 'NOTIFICATIONS': navigate('/notifications'); break;
            default: navigate('/skus');
        }
        setIsMobileMenuOpen(false);
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <div className="flex h-screen bg-zinc-50 dark:bg-black text-zinc-900 font-sans overflow-hidden">
            <ToastContainer toasts={toasts} removeToast={removeToast} />
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-zinc-900 text-white z-30 flex items-center px-4 justify-between shadow-md">
                <div className="flex items-center gap-2">
                     <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                    </div>
                    <span className="font-bold text-lg tracking-tight">PIM Pro</span>
                </div>
                <button 
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="p-2 text-zinc-400 hover:text-white rounded-md hover:bg-zinc-800 transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                </button>
            </div>

            <Sidebar 
                activeView={getActiveView(location.pathname)}
                setActiveView={handleNavigate}
                currentUser={currentUser}
                userRole={currentUserRole}
                availableUsers={users}
                onSwitchUser={(id) => setCurrentUserId(id)}
                isOpenMobile={isMobileMenuOpen}
                onCloseMobile={() => setIsMobileMenuOpen(false)}
                onLogout={handleLogout}
                unreadNotificationCount={unreadCount}
            />
            
            <main className="flex-1 overflow-auto pt-16 md:pt-0 relative w-full" id="main-content">
                <div className="max-w-7xl mx-auto p-4 md:p-8 pb-24">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}