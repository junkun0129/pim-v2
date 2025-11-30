import React, { useState } from 'react';
import type { User, Role, Permission } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import Input from '../ui/Input';
import Modal from '../ui/Modal';
import { ICONS } from '../../constants';

export default function AdminPanel(props: any) {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                {ICONS.settings} Admin Panel (Moved)
            </h1>
            <Card>Admin Panel Content Placeholder</Card>
        </div>
    );
}