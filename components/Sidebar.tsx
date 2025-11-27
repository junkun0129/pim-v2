
import React, { useState } from 'react';
import type { ViewType } from '../types';
import { ICONS } from '../constants';

interface SidebarProps {
    activeView: ViewType;
    setActiveView: (view: ViewType) => void;
}

const NavItem: React.FC<{
    icon: React.ReactNode;
    label: string;
    view: ViewType;
    isActive: boolean;
    isCollapsed: boolean;
    onClick: () => void;
}> = ({ icon, label, isActive, isCollapsed, onClick }) => (
    <button
        onClick={onClick}
        className={`group flex items-center ${isCollapsed ? 'justify-center px-2' : 'px-3'} py-2.5 mx-auto text-sm font-medium transition-all duration-200 rounded-lg mb-1 relative overflow-hidden w-full ${
            isActive
                ? 'bg-zinc-800 text-white shadow-md'
                : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'
        }`}
        title={isCollapsed ? label : undefined}
    >
        {isActive && (
             <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-500 rounded-l-lg shadow-[0_0_10px_rgba(139,92,246,0.5)]"></div>
        )}
        <span className={`transition-transform duration-200 ${isActive ? 'scale-110 text-primary-400' : 'group-hover:scale-110'}`}>
            {icon}
        </span>
        {!isCollapsed && (
            <span className={`ml-3 transition-transform duration-200 ${isActive ? 'translate-x-1' : ''} whitespace-nowrap`}>{label}</span>
        )}
    </button>
);

export default function Sidebar({ activeView, setActiveView }: SidebarProps) {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const navItems: { view: ViewType; label: string; icon: React.ReactNode }[] = [
        { view: 'SKUs', label: 'SKU管理', icon: ICONS.dashboard },
        { view: 'Series', label: 'シリーズ', icon: ICONS.series },
        { view: 'Categories', label: 'カテゴリ', icon: ICONS.category },
        { view: 'Attributes', label: '属性', icon: ICONS.list },
        { view: 'Attribute Sets', label: '属性セット', icon: ICONS.attributes },
    ];
    
    // Separator for functional areas
    const omsNavItems: { view: ViewType; label: string; icon: React.ReactNode }[] = [
        { view: 'Orders', label: '在庫・発注', icon: ICONS.truck },
        { view: 'EC', label: 'ECストア', icon: ICONS.globe },
        { view: 'CREATIVE', label: 'POP作成', icon: ICONS.palette },
        { view: 'CATALOG', label: 'Webカタログ', icon: ICONS.book },
    ];

    return (
        <aside className={`flex flex-col bg-zinc-900 border-r border-zinc-800 shadow-2xl transition-all duration-300 z-20 shrink-0 h-screen ${isCollapsed ? 'w-20' : 'w-64'}`}>
            <div className={`flex items-center gap-3 h-20 border-b border-zinc-800/50 ${isCollapsed ? 'justify-center px-0' : 'px-6'}`}>
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-primary-500/30 shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                </div>
                {!isCollapsed && (
                    <h1 className="text-xl font-bold text-white tracking-tight font-['Plus_Jakarta_Sans'] whitespace-nowrap overflow-hidden">
                        PIM <span className="text-primary-400 font-light">Pro</span>
                    </h1>
                )}
            </div>

            <nav className="flex-1 px-3 py-6 space-y-6 overflow-y-auto custom-scrollbar overflow-x-hidden">
                <div>
                    {!isCollapsed && (
                        <div className="px-3 mb-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest whitespace-nowrap">
                            Master Data
                        </div>
                    )}
                    {navItems.map((item) => (
                        <NavItem
                            key={item.view}
                            icon={item.icon}
                            label={item.label}
                            view={item.view}
                            isActive={activeView === item.view}
                            isCollapsed={isCollapsed}
                            onClick={() => setActiveView(item.view)}
                        />
                    ))}
                </div>

                <div>
                    {!isCollapsed && (
                        <div className="px-3 mb-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest whitespace-nowrap">
                            Retail & Operations
                        </div>
                    )}
                    {omsNavItems.map((item) => (
                        <NavItem
                            key={item.view}
                            icon={item.icon}
                            label={item.label}
                            view={item.view}
                            isActive={activeView === item.view}
                            isCollapsed={isCollapsed}
                            onClick={() => setActiveView(item.view)}
                        />
                    ))}
                </div>
            </nav>

            <div className="p-4 border-t border-zinc-800">
                <button 
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="w-full flex items-center justify-center p-2 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
                >
                    {isCollapsed ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="13 17 18 12 13 7"></polyline><polyline points="6 17 11 12 6 7"></polyline></svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="11 17 6 12 11 7"></polyline><polyline points="18 17 13 12 18 7"></polyline></svg>
                    )}
                </button>
            </div>
        </aside>
    );
}
