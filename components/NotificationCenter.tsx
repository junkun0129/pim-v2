
import React from 'react';
import type { AppNotification, User } from '../types';
import Card from './ui/Card';
import Button from './ui/Button';
import Badge from './ui/Badge';
import { ICONS } from '../constants';

interface NotificationCenterProps {
    notifications: AppNotification[];
    users: User[];
    onMarkAllRead: () => void;
    onClearAll: () => void;
}

export default function NotificationCenter({ notifications, users, onMarkAllRead, onClearAll }: NotificationCenterProps) {
    
    const getUser = (id: string) => users.find(u => u.id === id) || { name: 'System', avatarUrl: '' };

    const sortedNotifications = [...notifications].sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const getTypeStyles = (type: AppNotification['type']) => {
        switch(type) {
            case 'SYSTEM': return 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400';
            case 'PROJECT': return 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300';
            case 'ORDER': return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300';
            case 'ALERT': return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300';
            default: return 'bg-zinc-100 text-zinc-600';
        }
    };

    const getTypeIcon = (type: AppNotification['type']) => {
        switch(type) {
            case 'SYSTEM': return ICONS.settings;
            case 'PROJECT': return ICONS.users;
            case 'ORDER': return ICONS.truck;
            case 'ALERT': return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>;
            default: return ICONS.bell;
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                        {ICONS.bell} Notifications
                    </h1>
                    <p className="text-slate-500 mt-1">システム内の活動履歴と通知を確認します</p>
                </div>
                <div className="flex gap-2">
                    {unreadCount > 0 && (
                        <Button variant="secondary" onClick={onMarkAllRead}>
                            すべて既読にする
                        </Button>
                    )}
                    <Button variant="ghost" onClick={onClearAll} className="text-red-500 hover:bg-red-50 hover:text-red-600">
                        履歴をクリア
                    </Button>
                </div>
            </div>

            <div className="space-y-4">
                {sortedNotifications.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-zinc-800 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-zinc-700 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                            {ICONS.bell}
                        </div>
                        <p className="text-slate-500 font-medium">通知はありません</p>
                    </div>
                ) : (
                    sortedNotifications.map(notif => {
                        const actor = getUser(notif.actorId);
                        const isSystem = notif.actorId === 'SYSTEM';
                        
                        return (
                            <Card key={notif.id} className={`flex gap-4 transition-all ${notif.isRead ? 'opacity-80' : 'border-l-4 border-l-blue-500 shadow-md'}`}>
                                {/* Icon / Avatar Column */}
                                <div className="flex flex-col items-center gap-2 pt-1 min-w-[48px]">
                                    {isSystem ? (
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getTypeStyles(notif.type)}`}>
                                            {getTypeIcon(notif.type)}
                                        </div>
                                    ) : (
                                        <div className="relative">
                                            <img src={actor.avatarUrl} alt={actor.name} className="w-10 h-10 rounded-full border border-slate-200 dark:border-zinc-700" />
                                            <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-2 border-white dark:border-zinc-900 ${getTypeStyles(notif.type)}`}>
                                                <div className="scale-75">{getTypeIcon(notif.type)}</div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Content Column */}
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className={`font-bold text-base ${notif.isRead ? 'text-slate-700 dark:text-slate-300' : 'text-slate-900 dark:text-white'}`}>
                                                {notif.title}
                                            </h3>
                                            <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                                                {notif.message}
                                            </p>
                                        </div>
                                        <span className="text-xs text-slate-400 whitespace-nowrap ml-4">
                                            {notif.timestamp}
                                        </span>
                                    </div>
                                    
                                    <div className="mt-3 flex items-center gap-2 text-xs">
                                        <Badge color="gray" className="rounded-full px-2">
                                            {notif.type}
                                        </Badge>
                                        {!isSystem && (
                                            <span className="text-slate-400">
                                                by <span className="font-medium text-slate-600 dark:text-slate-300">{actor.name}</span>
                                            </span>
                                        )}
                                        {!notif.isRead && (
                                            <span className="ml-auto text-blue-600 font-bold px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 rounded text-[10px]">NEW</span>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        );
                    })
                )}
            </div>
        </div>
    );
}
