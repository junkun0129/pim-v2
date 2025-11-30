import React, { useState } from 'react';
import type { Sku, Series, Inventory, CustomerOrder, Branch } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { ICONS } from '../../constants';

export default function EcService(props: any) {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                {ICONS.globe} EC Service (Moved)
            </h1>
            <Card>EC Service Content Placeholder</Card>
        </div>
    );
}