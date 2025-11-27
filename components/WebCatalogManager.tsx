
import React, { useState } from 'react';
import type { WebCatalog, CatalogSection, Sku, Category, Series } from '../types';
import Card from './ui/Card';
import Button from './ui/Button';
import Input from './ui/Input';
import Select from './ui/Select';
import Badge from './ui/Badge';
import { ICONS } from '../constants';
import { getCategoryPath } from '../utils';

interface WebCatalogManagerProps {
    catalogs: WebCatalog[];
    skus: Sku[];
    categories: Category[];
    series: Series[];
    onSaveCatalog: (catalog: WebCatalog) => void;
    onDeleteCatalog: (id: string) => void;
}

export default function WebCatalogManager({ catalogs, skus, categories, series, onSaveCatalog, onDeleteCatalog }: WebCatalogManagerProps) {
    const [viewMode, setViewMode] = useState<'LIST' | 'EDIT' | 'PREVIEW'>('LIST');
    const [activeCatalog, setActiveCatalog] = useState<WebCatalog | null>(null);

    // --- Editor State ---
    const [editName, setEditName] = useState('');
    const [editDesc, setEditDesc] = useState('');
    const [editColor, setEditColor] = useState('#3b82f6');
    const [editSections, setEditSections] = useState<CatalogSection[]>([]);

    const handleCreateNew = () => {
        const newCatalog: WebCatalog = {
            id: `cat-web-${Date.now()}`,
            name: '新しいカタログ',
            description: '',
            themeColor: '#3b82f6',
            sections: [],
            status: 'DRAFT',
            lastUpdated: new Date().toISOString()
        };
        startEdit(newCatalog);
    };

    const startEdit = (catalog: WebCatalog) => {
        setActiveCatalog(catalog);
        setEditName(catalog.name);
        setEditDesc(catalog.description);
        setEditColor(catalog.themeColor);
        setEditSections(JSON.parse(JSON.stringify(catalog.sections))); // Deep copy
        setViewMode('EDIT');
    };

    const saveChanges = () => {
        if (!activeCatalog) return;
        const updated: WebCatalog = {
            ...activeCatalog,
            name: editName,
            description: editDesc,
            themeColor: editColor,
            sections: editSections,
            lastUpdated: new Date().toISOString()
        };
        onSaveCatalog(updated);
        setViewMode('LIST');
        setActiveCatalog(null);
    };

    const handleAddSection = (type: 'HERO' | 'GRID_CATEGORY' | 'SPOTLIGHT_SKU') => {
        const newSection: CatalogSection = {
            id: `sec-${Date.now()}`,
            type,
            title: type === 'HERO' ? 'Hero Title' : type === 'GRID_CATEGORY' ? 'Category Name' : 'Product Spotlight',
            subtitle: type === 'HERO' ? 'Enter your subtitle here' : undefined,
            imageUrl: type === 'HERO' ? 'https://placehold.co/1200x400/e2e8f0/64748b?text=Hero+Image' : undefined,
        };
        setEditSections([...editSections, newSection]);
    };

    const updateSection = (id: string, updates: Partial<CatalogSection>) => {
        setEditSections(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    };

    const removeSection = (id: string) => {
        setEditSections(prev => prev.filter(s => s.id !== id));
    };
    
    const moveSection = (index: number, direction: 'up' | 'down') => {
        const newSections = [...editSections];
        if (direction === 'up' && index > 0) {
            [newSections[index], newSections[index - 1]] = [newSections[index - 1], newSections[index]];
        } else if (direction === 'down' && index < newSections.length - 1) {
             [newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]];
        }
        setEditSections(newSections);
    };

    // --- Render Helpers ---

    const renderPreviewContent = () => (
        <div className="bg-white min-h-screen">
             {/* Preview Header (Simulated) */}
             <div className="text-white py-4 px-6 shadow-md" style={{ backgroundColor: editColor }}>
                 <div className="container mx-auto flex justify-between items-center">
                    <h1 className="text-xl font-bold">{editName}</h1>
                    <nav className="space-x-4 text-sm font-medium opacity-90 hidden sm:block">
                        <span>Home</span>
                        <span>Products</span>
                        <span>Contact</span>
                    </nav>
                 </div>
             </div>

             <div className="container mx-auto">
                 {editSections.map(section => {
                     // --- RENDER HERO ---
                     if (section.type === 'HERO') {
                         return (
                             <div key={section.id} className="relative w-full h-80 md:h-96 overflow-hidden mb-12 rounded-b-xl shadow-lg">
                                 <img src={section.imageUrl} alt="Hero" className="w-full h-full object-cover" />
                                 <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-8 md:p-16">
                                     <h2 className="text-3xl md:text-5xl font-bold text-white mb-2 drop-shadow-md">{section.title}</h2>
                                     <p className="text-sm md:text-lg text-slate-200 drop-shadow-sm">{section.subtitle}</p>
                                     <button 
                                        className="mt-6 px-6 py-3 rounded-full font-bold text-white w-max transition-transform hover:scale-105 text-sm md:text-base"
                                        style={{ backgroundColor: editColor }}
                                     >
                                         View Collection
                                     </button>
                                 </div>
                             </div>
                         );
                     }
                     // --- RENDER GRID ---
                     if (section.type === 'GRID_CATEGORY') {
                         const catSkus = skus.filter(s => section.targetId && s.categoryIds.includes(section.targetId));
                         return (
                             <div key={section.id} className="py-12 px-6">
                                 <h3 className="text-2xl font-bold text-zinc-800 mb-8 border-l-4 pl-4" style={{ borderColor: editColor }}>{section.title}</h3>
                                 <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                     {catSkus.length > 0 ? catSkus.map(sku => (
                                         <div key={sku.id} className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 overflow-hidden">
                                             <div className="aspect-square bg-slate-100 relative overflow-hidden">
                                                 <img src={sku.imageUrl || 'https://placehold.co/300x300'} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt={sku.name} />
                                             </div>
                                             <div className="p-4">
                                                 <h4 className="font-bold text-slate-800 truncate text-sm md:text-base">{sku.name}</h4>
                                                 <p className="text-xs text-slate-500 mb-2">{sku.skuId}</p>
                                                 <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                                                     <span className="font-bold text-sm" style={{ color: editColor }}>¥{sku.price?.toLocaleString()}</span>
                                                     <button className="text-[10px] px-2 py-1 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors">Add</button>
                                                 </div>
                                             </div>
                                         </div>
                                     )) : (
                                         <div className="col-span-2 md:col-span-4 text-center py-10 text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                                             商品が見つかりません
                                         </div>
                                     )}
                                 </div>
                             </div>
                         );
                     }
                     // --- RENDER SPOTLIGHT ---
                     if (section.type === 'SPOTLIGHT_SKU') {
                         const sku = skus.find(s => s.id === section.targetId);
                         if (!sku) return null;
                         return (
                             <div key={section.id} className="py-16 px-6 bg-slate-50 mb-12">
                                 <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-10">
                                     <div className="w-full md:w-1/2">
                                         <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl relative">
                                              <img src={sku.imageUrl || 'https://placehold.co/600x600'} className="w-full h-full object-cover" alt={sku.name} />
                                              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-4 py-2 rounded-full text-xs font-bold shadow-sm">
                                                  RECOMMENDED
                                              </div>
                                         </div>
                                     </div>
                                     <div className="w-full md:w-1/2 space-y-6">
                                         <h3 className="text-2xl md:text-3xl font-bold text-slate-800">{section.title || sku.name}</h3>
                                         <p className="text-sm md:text-base text-slate-600 leading-relaxed">
                                             {sku.name}の魅力的な機能をご紹介します。最高品質の素材と最新のテクノロジーを融合させた、あなたの生活を豊かにする一品です。
                                         </p>
                                         <div className="grid grid-cols-2 gap-4">
                                             <div className="p-4 bg-white rounded-lg shadow-sm">
                                                 <p className="text-xs text-slate-400">SKU ID</p>
                                                 <p className="font-mono font-bold text-sm">{sku.skuId}</p>
                                             </div>
                                             <div className="p-4 bg-white rounded-lg shadow-sm">
                                                 <p className="text-xs text-slate-400">価格</p>
                                                 <p className="font-bold text-lg" style={{ color: editColor }}>¥{sku.price?.toLocaleString()}</p>
                                             </div>
                                         </div>
                                         <div className="pt-4">
                                            <button 
                                                className="w-full py-4 rounded-xl font-bold text-white shadow-lg transition-transform hover:-translate-y-1"
                                                style={{ backgroundColor: editColor }}
                                            >
                                                詳しく見る
                                            </button>
                                         </div>
                                     </div>
                                 </div>
                             </div>
                         );
                     }
                     return null;
                 })}
             </div>
             
             {/* Footer */}
             <div className="bg-zinc-900 text-slate-400 py-12 px-6 text-center mt-12">
                 <p className="text-xs md:text-sm">&copy; 2023 {editName}. All rights reserved.</p>
             </div>
        </div>
    );

    // --- VIEW: LIST ---
    if (viewMode === 'LIST') {
        return (
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                            {ICONS.book} Web Catalog
                        </h1>
                        <p className="text-slate-500 mt-1">プロモーション用の特設ページを作成・管理します</p>
                    </div>
                    <Button onClick={handleCreateNew} className="shadow-lg shadow-blue-500/20 bg-blue-600 hover:bg-blue-700 w-full md:w-auto">
                        {ICONS.plus} 新規カタログ作成
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {catalogs.map(catalog => (
                        <Card key={catalog.id} className="group relative overflow-hidden flex flex-col h-full hover:shadow-xl transition-all duration-300 !p-0 border-0">
                            {/* Header Color Strip */}
                            <div className="h-24 w-full relative" style={{ backgroundColor: catalog.themeColor }}>
                                <div className="absolute -bottom-6 left-6 w-12 h-12 rounded-lg bg-white dark:bg-zinc-800 shadow-md flex items-center justify-center border border-slate-100 dark:border-zinc-700 z-10">
                                    <div className="w-8 h-8 rounded bg-slate-100 dark:bg-zinc-700 flex items-center justify-center">
                                        <span className="font-bold text-xs text-slate-500">Web</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="pt-10 px-6 pb-6 flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">{catalog.name}</h3>
                                    <Badge color={catalog.status === 'PUBLISHED' ? 'green' : 'gray'}>
                                        {catalog.status}
                                    </Badge>
                                </div>
                                <p className="text-sm text-slate-500 mb-6 line-clamp-2 flex-1">{catalog.description || '説明なし'}</p>
                                
                                <div className="text-xs text-slate-400 mb-4">
                                    最終更新: {new Date(catalog.lastUpdated).toLocaleDateString()}
                                </div>

                                <div className="flex gap-2">
                                    <Button onClick={() => startEdit(catalog)} size="sm" variant="secondary" className="flex-1">
                                        編集
                                    </Button>
                                    <Button onClick={() => onDeleteCatalog(catalog.id)} size="sm" variant="ghost" className="text-red-500 hover:bg-red-50 hover:text-red-600">
                                        削除
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                    
                    {/* Empty State Create Card */}
                    <button 
                        onClick={handleCreateNew}
                        className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-xl hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-zinc-900 dark:hover:border-zinc-700 transition-all group h-full min-h-[240px]"
                    >
                        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-400 mb-4 group-hover:scale-110 transition-transform duration-300">
                            {ICONS.plus}
                        </div>
                        <span className="font-bold text-slate-600 dark:text-slate-300">新しいカタログを作成</span>
                    </button>
                </div>
            </div>
        );
    }

    // --- VIEW: PREVIEW ---
    if (viewMode === 'PREVIEW') {
        return (
            <div className="fixed inset-0 z-50 bg-white overflow-auto animate-fade-in">
                <div className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 z-50">
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-bold text-slate-400 hidden sm:inline">PREVIEW MODE</span>
                        <div className="h-4 w-px bg-slate-300 hidden sm:block"></div>
                        <span className="font-bold text-slate-800 truncate">{editName}</span>
                    </div>
                    <Button onClick={() => setViewMode('EDIT')}>
                        エディタに戻る
                    </Button>
                </div>
                <div className="pt-16">
                    {renderPreviewContent()}
                </div>
            </div>
        );
    }

    // --- VIEW: EDITOR ---
    return (
        <div className="h-full flex flex-col -m-4 md:-m-10">
            {/* Editor Header */}
            <div className="h-16 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-4 md:px-6 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2 md:gap-4">
                    <Button variant="ghost" size="sm" onClick={() => setViewMode('LIST')}>&larr; 一覧</Button>
                    <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-700 hidden md:block"></div>
                    <span className="font-bold text-slate-800 dark:text-white truncate max-w-[120px] md:max-w-none">カタログエディタ</span>
                </div>
                <div className="flex items-center gap-2 md:gap-3">
                    <Button variant="secondary" size="sm" onClick={() => setViewMode('PREVIEW')} className="hidden sm:flex">
                        プレビュー
                    </Button>
                    <Button onClick={saveChanges} size="sm" className="shadow-lg shadow-blue-500/20">
                        保存
                    </Button>
                </div>
            </div>

            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                {/* Left Panel: Settings & Sections */}
                <div className="w-full md:w-80 bg-white dark:bg-zinc-900 border-b md:border-b-0 md:border-r border-zinc-200 dark:border-zinc-800 flex flex-col overflow-y-auto custom-scrollbar h-[40%] md:h-full shrink-0">
                    <div className="p-4 md:p-6 border-b border-zinc-100 dark:border-zinc-800">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">基本設定</h3>
                        <div className="space-y-4">
                            <Input label="カタログ名" value={editName} onChange={(e) => setEditName(e.target.value)} />
                            <div className="hidden md:block">
                                <Input label="説明" value={editDesc} onChange={(e) => setEditDesc(e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 mb-1.5 uppercase tracking-wide">テーマカラー</label>
                                <div className="flex items-center gap-2">
                                    <input type="color" value={editColor} onChange={(e) => setEditColor(e.target.value)} className="h-8 w-8 rounded cursor-pointer border-0 p-0" />
                                    <span className="text-xs font-mono text-slate-500">{editColor}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 md:p-6 flex-1">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">セクション構成</h3>
                        <div className="space-y-3 mb-6">
                            {editSections.map((section, index) => (
                                <div key={section.id} className="bg-slate-50 dark:bg-zinc-800 rounded-lg p-3 border border-slate-200 dark:border-zinc-700 group">
                                    <div className="flex justify-between items-center mb-2">
                                        <Badge color="blue" className="text-[10px]">{section.type}</Badge>
                                        <div className="flex gap-1 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => moveSection(index, 'up')} disabled={index === 0} className="p-1 hover:bg-slate-200 rounded disabled:opacity-30">↑</button>
                                            <button onClick={() => moveSection(index, 'down')} disabled={index === editSections.length - 1} className="p-1 hover:bg-slate-200 rounded disabled:opacity-30">↓</button>
                                            <button onClick={() => removeSection(section.id)} className="p-1 hover:bg-red-100 text-red-500 rounded">×</button>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <input 
                                            type="text" 
                                            value={section.title || ''} 
                                            onChange={(e) => updateSection(section.id, { title: e.target.value })}
                                            className="w-full text-xs bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded px-2 py-1"
                                            placeholder="タイトル"
                                        />
                                        
                                        {section.type === 'HERO' && (
                                            <>
                                                <input 
                                                    type="text" 
                                                    value={section.subtitle || ''} 
                                                    onChange={(e) => updateSection(section.id, { subtitle: e.target.value })}
                                                    className="w-full text-xs bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded px-2 py-1"
                                                    placeholder="サブタイトル"
                                                />
                                            </>
                                        )}

                                        {section.type === 'GRID_CATEGORY' && (
                                            <select 
                                                value={section.targetId || ''}
                                                onChange={(e) => updateSection(section.id, { targetId: e.target.value })}
                                                className="w-full text-xs bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded px-2 py-1"
                                            >
                                                <option value="">カテゴリを選択</option>
                                                {categories.map(c => <option key={c.id} value={c.id}>{getCategoryPath(c.id, categories)}</option>)}
                                            </select>
                                        )}

                                        {section.type === 'SPOTLIGHT_SKU' && (
                                            <select 
                                                value={section.targetId || ''}
                                                onChange={(e) => updateSection(section.id, { targetId: e.target.value })}
                                                className="w-full text-xs bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded px-2 py-1"
                                            >
                                                <option value="">SKUを選択</option>
                                                {skus.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                            </select>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 gap-2">
                            <Button size="sm" variant="secondary" onClick={() => handleAddSection('HERO')} className="justify-start text-xs">
                                + ヒーローバナー
                            </Button>
                            <Button size="sm" variant="secondary" onClick={() => handleAddSection('GRID_CATEGORY')} className="justify-start text-xs">
                                + カテゴリ商品グリッド
                            </Button>
                            <Button size="sm" variant="secondary" onClick={() => handleAddSection('SPOTLIGHT_SKU')} className="justify-start text-xs">
                                + 商品スポットライト
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Live Preview Canvas */}
                <div className="flex-1 bg-slate-100 dark:bg-zinc-950 overflow-auto p-4 md:p-8 flex justify-center">
                    <div className="w-full max-w-4xl bg-white shadow-2xl min-h-[400px] md:min-h-[800px] rounded-lg overflow-hidden ring-1 ring-slate-900/5 origin-top md:scale-100 transition-transform">
                        {renderPreviewContent()}
                    </div>
                </div>
            </div>
        </div>
    );
}
