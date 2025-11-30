import React from 'react';
import type { AppNotification, User } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { ICONS } from '../../constants';

export default function NotificationCenter(props: any) {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                {ICONS.bell} Notification Center (Moved)
            </h1>
            <Card>Notification Center Content Placeholder</Card>
        </div>
    );
}