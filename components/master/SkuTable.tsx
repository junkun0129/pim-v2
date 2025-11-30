import React from 'react';
import type { Sku, Series, Category, Attribute, AttributeSet } from '../../types';
import Badge from '../ui/Badge';
import { ICONS } from '../../constants';
import Button from '../ui/Button';
import { getCategoryPath } from '../../utils';

interface SkuTableProps {
    skus: Sku[];
    dataMap: {
        series: Series[];
        categories: Category[];
        attributes: Attribute[];
        attributeSets: AttributeSet[];
    };
    onDelete: (id: string) => void;
    onViewSku: (skuId: string) => void;
    onEdit: (sku: Sku) => void;
    selectedIds?: Set<string>;
    onToggleSelect?: (id: string) => void;
    onToggleAll?: (checked: boolean) => void;
    isAllSelected?: boolean;
}

export default function SkuTable({ skus, dataMap, onDelete, onViewSku, onEdit, selectedIds, onToggleSelect, onToggleAll, isAllSelected }: SkuTableProps) {
    const getSeriesName = (id?: string) => id ? dataMap.series.find(s => s.id === id)?.name : 'N/A';
    const getAttributeName = (id: string) => dataMap.attributes.find(a => a.id === id)?.name || '不明';

    return (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden border border-zinc-200 dark:border-zinc-700">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-400 whitespace-nowrap">
                        <tr>
                            <th scope="col" className="p-4 w-4">
                                {onToggleAll && (
                                    <input type="checkbox" className="w-4 h-4 rounded" checked={isAllSelected || false} onChange={(e) => onToggleAll(e.target.checked)} />
                                )}
                            </th>
                            <th scope="col" className="px-6 py-3">画像</th>
                            <th scope="col" className="px-6 py-3">名前</th>
                            <th scope="col" className="px-6 py-3">SKU ID</th>
                            <th scope="col" className="px-6 py-3">価格</th>
                            <th scope="col" className="px-6 py-3">シリーズ</th>
                            <th scope="col" className="px-6 py-3">カテゴリ</th>
                            <th scope="col" className="px-6 py-3">操作</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-700">
                        {skus.map((sku) => {
                            const series = sku.seriesId ? dataMap.series.find(s => s.id === sku.seriesId) : null;
                            const imageUrl = sku.imageUrl || series?.imageUrl;
                            const isSelected = selectedIds?.has(sku.id);
                            return (
                                <tr key={sku.id} className={`hover:bg-slate-50 dark:hover:bg-slate-600 ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-white dark:bg-slate-800'}`}>
                                    <td className="w-4 p-4 whitespace-nowrap">
                                        {onToggleSelect && <input type="checkbox" className="w-4 h-4 rounded" checked={isSelected || false} onChange={() => onToggleSelect(sku.id)} />}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {imageUrl ? <img src={imageUrl} alt="" className="w-10 h-10 object-cover rounded-md" /> : <div className="w-10 h-10 bg-slate-200 rounded-md" />}
                                    </td>
                                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">
                                        <button onClick={() => onViewSku(sku.id)} className="text-sky-600 hover:underline">{sku.name}</button>
                                    </td>
                                    <td className="px-6 py-4 font-mono whitespace-nowrap">{sku.skuId}</td>
                                    <td className="px-6 py-4 font-bold whitespace-nowrap">{sku.price ? `¥${sku.price.toLocaleString()}` : '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{getSeriesName(sku.seriesId)}</td>
                                    <td className="px-6 py-4 max-w-xs">
                                        <div className="flex gap-1 overflow-x-auto no-scrollbar mask-linear-fade">
                                            {sku.categoryIds.map(catId => <Badge key={catId} className="whitespace-nowrap">{getCategoryPath(catId, dataMap.categories).split('>').pop()}</Badge>)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <Button onClick={() => onEdit(sku)} variant="secondary" size="sm">編集</Button>
                                            <Button onClick={() => onDelete(sku.id)} variant="danger" size="sm">{ICONS.trash}</Button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}