import React, { useState } from 'react';
import type { Sku, Series, Category, Attribute, AttributeSet, Asset } from '../types';
import Button from './ui/Button';
import Card from './ui/Card';
import Badge from './ui/Badge';
import { getCategoryPath } from '../utils';
import { ICONS } from '../constants';
import SkuModal from './modals/SkuModal';

interface SeriesDetailViewProps {
    series: Series;
    childSkus: Sku[];
    dataMap: {
        categories: Category[];
        attributes: Attribute[];
        attributeSets: AttributeSet[];
    };
    onBack: () => void;
    onEdit?: (series: Series) => void;
    onViewSku: (skuId: string) => void;
    onAddSku?: (sku: Omit<Sku, 'id'>) => void;
}

export default function SeriesDetailView({ series, childSkus, dataMap, onBack, onEdit, onViewSku, onAddSku }: SeriesDetailViewProps) {
    const [isSkuModalOpen, setIsSkuModalOpen] = useState(false);

    const getAttributeName = (id: string) => dataMap.attributes.find(a => a.id === id)?.name || id;
    const getAttributeUnit = (id: string) => dataMap.attributes.find(a => a.id === id)?.unit || '';

    // Identify shared attributes
    const sharedAttributeIds = new Set<string>();
    series.attributeSetIds.forEach(setId => {
        const set = dataMap.attributeSets.find(s => s.id === setId);
        if (set && set.sharedAttributeIds) {
            set.sharedAttributeIds.forEach(id => sharedAttributeIds.add(id));
        }
    });

    const handleCreateSku = (newSku: Omit<Sku, 'id'>) => {
        if (onAddSku) {
            onAddSku(newSku);
            setIsSkuModalOpen(false);
        }
    };

    // Initialize new SKU with series preset
    const newSkuTemplate: Partial<Sku> = {
        seriesId: series.id,
        categoryIds: series.categoryIds,
        attributeSetIds: series.attributeSetIds,
        attributeValues: series.attributeValues
    };

    const assets = series.assets || [];

    const renderAsset = (asset: Asset) => {
        switch (asset.type) {
            case 'VIDEO':
                return (
                    <div key={asset.id} className="group relative bg-black rounded-md overflow-hidden aspect-square border border-zinc-800">
                        <video src={asset.url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                            </div>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2 text-xs text-white truncate">
                            {asset.name}
                        </div>
                        <a href={asset.url} target="_blank" rel="noopener noreferrer" className="absolute top-2 right-2 p-1 bg-white/10 hover:bg-white/30 rounded text-white" title="開く">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                        </a>
                    </div>
                );
            case 'FILE':
                return (
                    <div key={asset.id} className="group relative bg-slate-50 dark:bg-zinc-800 rounded-md overflow-hidden aspect-square border border-zinc-200 dark:border-zinc-700 flex flex-col items-center justify-center p-4 text-center hover:bg-slate-100 dark:hover:bg-zinc-700 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                        <p className="text-xs font-medium text-slate-700 dark:text-slate-300 line-clamp-2 break-all">{asset.name}</p>
                        <p className="text-[10px] text-slate-400 mt-1">{asset.size || 'Unknown size'}</p>
                        <a href={asset.url} download className="absolute inset-0 z-10" aria-label="Download"></a>
                    </div>
                );
            default: // IMAGE or DESIGN
                return (
                    <div key={asset.id} className="group relative aspect-square bg-slate-100 dark:bg-zinc-800 rounded-md overflow-hidden border border-slate-200 dark:border-zinc-700">
                        <img src={asset.url} alt={asset.name} className="w-full h-full object-contain" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                             <a href={asset.url} target="_blank" rel="noopener noreferrer" className="text-white text-xs hover:underline bg-black/50 px-2 py-1 rounded">
                                 拡大表示
                             </a>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                     <Button onClick={onBack} variant="secondary">
                        &larr; 一覧に戻る
                    </Button>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-white">{series.name}</h1>
                </div>
                {onEdit && (
                    <Button onClick={() => onEdit(series)}>
                        編集
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Image & Basic Info */}
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        {series.imageUrl ? (
                            <img src={series.imageUrl} alt={series.name} className="w-full h-auto object-cover rounded-lg aspect-video mb-4" />
                        ) : (
                            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center text-slate-400 aspect-video mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                            </div>
                        )}
                        
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">カテゴリ</h3>
                                <div className="flex flex-wrap gap-2">
                                    {series.categoryIds.map(catId => <Badge key={catId}>{getCategoryPath(catId, dataMap.categories)}</Badge>)}
                                </div>
                            </div>
                            
                            <div>
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">共通属性 (Shared Specs)</h3>
                                <div className="space-y-2">
                                    {Object.entries(series.attributeValues).map(([attrId, val]) => {
                                        if (!val) return null;
                                        return (
                                            <div key={attrId} className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-1 last:border-0">
                                                <span className="text-sm text-slate-500">{getAttributeName(attrId)}</span>
                                                <span className="text-sm font-bold text-slate-800 dark:text-white">
                                                    {val} <span className="text-xs font-normal text-slate-400">{getAttributeUnit(attrId)}</span>
                                                </span>
                                            </div>
                                        )
                                    })}
                                    {Object.keys(series.attributeValues).length === 0 && <span className="text-sm text-slate-400">設定なし</span>}
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Series Assets */}
                    <Card>
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-lg font-semibold">シリーズ資料・アセット</h2>
                            <span className="text-xs text-slate-400">{assets.length} items</span>
                        </div>
                        
                        {assets.length > 0 ? (
                            <div className="grid grid-cols-2 gap-3">
                                {assets.map(asset => renderAsset(asset))}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-500 text-center py-8 bg-slate-50 dark:bg-zinc-800 rounded-lg border border-dashed border-zinc-200 dark:border-zinc-700">アセットがありません</p>
                        )}
                        <p className="text-xs text-slate-400 mt-2 text-center">編集ボタンから追加できます</p>
                    </Card>
                </div>

                {/* Right Column: SKU List */}
                <div className="lg:col-span-2">
                    <Card className="h-full">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white">ラインナップ (SKU)</h2>
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-slate-500">{childSkus.length} アイテム</span>
                                {onAddSku && (
                                    <Button size="sm" onClick={() => setIsSkuModalOpen(true)}>
                                        {ICONS.plus} SKU追加
                                    </Button>
                                )}
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                                <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-400">
                                    <tr>
                                        <th className="px-4 py-3">画像</th>
                                        <th className="px-4 py-3">商品名</th>
                                        <th className="px-4 py-3">SKU ID</th>
                                        <th className="px-4 py-3 text-right">価格</th>
                                        <th className="px-4 py-3">独自属性</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-700">
                                    {childSkus.length === 0 ? (
                                        <tr><td colSpan={5} className="px-4 py-8 text-center">SKUが登録されていません</td></tr>
                                    ) : (
                                        childSkus.map(sku => (
                                            <tr key={sku.id} className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors cursor-pointer" onClick={() => onViewSku(sku.id)}>
                                                <td className="px-4 py-3">
                                                    <img src={sku.imageUrl || series.imageUrl || ''} alt="" className="w-10 h-10 object-cover rounded border border-zinc-200 dark:border-zinc-700" />
                                                </td>
                                                <td className="px-4 py-3 font-medium text-blue-600 dark:text-blue-400 hover:underline">
                                                    {sku.name}
                                                </td>
                                                <td className="px-4 py-3 font-mono text-xs">
                                                    {sku.skuId}
                                                </td>
                                                <td className="px-4 py-3 text-right font-bold text-slate-700 dark:text-white">
                                                    ¥{sku.price?.toLocaleString()}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex gap-1 flex-wrap">
                                                        {Object.entries(sku.attributeValues).map(([attrId, val]) => {
                                                            // Only show unique attributes here
                                                            if (sharedAttributeIds.has(attrId)) return null;
                                                            return (
                                                                <Badge key={attrId} color="gray">
                                                                    {getAttributeName(attrId)}: {val}
                                                                </Badge>
                                                            );
                                                        })}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Create SKU Modal within Series Context */}
            {isSkuModalOpen && onAddSku && (
                <SkuModal 
                    isOpen={isSkuModalOpen}
                    onClose={() => setIsSkuModalOpen(false)}
                    onSave={handleCreateSku}
                    dataMap={{ ...dataMap, series: [series] }}
                    sku={newSkuTemplate as any} // Pass partial data as "editing" to pre-fill
                />
            )}
        </div>
    );
}