import React from 'react';
import type { ExtensionMetadata, ExtensionType } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { ICONS } from '../../constants';
import { MOCK_EXTENSIONS } from '../../mockData';

export default function ExtensionStore(props: any) {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                {ICONS.store} Extension Store (Moved)
            </h1>
            <Card>Extension Store Content Placeholder</Card>
        </div>
    );
}