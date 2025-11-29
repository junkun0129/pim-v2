
import React from 'react';
import type { ExtensionMetadata, ExtensionType } from '../types';
import Card from './ui/Card';
import Button from './ui/Button';
import Badge from './ui/Badge';
import { ICONS } from '../constants';
import { MOCK_EXTENSIONS } from '../mockData';

interface ExtensionStoreProps {
    activeExtensions: ExtensionType[];
    onToggleExtension: (id: ExtensionType) => void;
}

export default function ExtensionStore({ activeExtensions, onToggleExtension }: ExtensionStoreProps) {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    {ICONS.store} Extension Store
                </h1>
                <p className="text-slate-500 mt-1">必要な機能をオンデマンドで追加・購入できます。</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {MOCK_EXTENSIONS.map((ext) => {
                    const isActive = activeExtensions.includes(ext.id);
                    return (
                        <Card key={ext.id} className={`flex flex-col h-full transition-all duration-300 ${isActive ? 'border-blue-500 shadow-md ring-1 ring-blue-500 dark:border-blue-500' : ''}`}>
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-xl ${isActive ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-slate-100 text-slate-500 dark:bg-zinc-800 dark:text-zinc-400'}`}>
                                    {ext.icon}
                                </div>
                                <Badge color={isActive ? 'green' : 'gray'}>
                                    {isActive ? '利用中' : '未購入'}
                                </Badge>
                            </div>
                            
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">{ext.name}</h3>
                            <p className="text-sm text-slate-500 mb-6 flex-1 leading-relaxed">
                                {ext.description}
                            </p>
                            
                            <div className="mt-auto">
                                <div className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                                    ¥{ext.price.toLocaleString()} <span className="text-xs font-normal text-slate-400">/ 月</span>
                                </div>
                                <Button 
                                    className={`w-full ${isActive ? 'bg-red-50 text-red-600 hover:bg-red-100 border-red-200' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                                    variant={isActive ? 'ghost' : 'primary'}
                                    onClick={() => onToggleExtension(ext.id)}
                                >
                                    {isActive ? '解約・無効化' : '購入・有効化'}
                                </Button>
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
