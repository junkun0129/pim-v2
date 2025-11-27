
import React from 'react';
import type { Sku, Series, Category, Attribute, AttributeSet } from '../types';
import Badge from './ui/Badge';
import { ICONS } from '../constants';
import Button from './ui/Button';
import { getCategoryPath } from '../utils';

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
}

export default function SkuTable({ skus, dataMap, onDelete, onViewSku, onEdit }: SkuTableProps) {
    const getSeriesName = (id?: string) => id ? dataMap.series.find(s => s.id === id)?.name : 'N/A';
    
    const getAttributeName = (id: string) => dataMap.attributes.find(a => a.id === id)?.name || '不明';

    return (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">画像</th>
                            <th scope="col" className="px-6 py-3">名前</th>
                            <th scope="col" className="px-6 py-3">SKU ID / JAN</th>
                            <th scope="col" className="px-6 py-3">価格</th>
                            <th scope="col" className="px-6 py-3">シリーズ</th>
                            <th scope="col" className="px-6 py-3">カテゴリ</th>
                            <th scope="col" className="px-6 py-3">属性値</th>
                            <th scope="col" className="px-6 py-3">操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        {skus.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="text-center py-10 text-slate-500 dark:text-slate-400">
                                    SKUが見つかりません。
                                </td>
                            </tr>
                        ) : (
                            skus.map((sku) => {
                                const series = sku.seriesId ? dataMap.series.find(s => s.id === sku.seriesId) : null;
                                const imageUrl = sku.imageUrl || series?.imageUrl;
                                const attributeSource = series || sku;
                                
                                const allAttributeIds = attributeSource.attributeSetIds.flatMap(setId => 
                                    dataMap.attributeSets.find(as => as.id === setId)?.attributeIds || []
                                );

                                return (
                                <tr key={sku.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600">
                                    <td className="px-6 py-4">
                                        {imageUrl ? (
                                            <img src={imageUrl} alt={sku.name} className="w-12 h-12 object-cover rounded-md" />
                                        ) : (
                                            <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-md flex items-center justify-center text-slate-400">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">
                                        <button onClick={() => onViewSku(sku.id)} className="text-sky-600 dark:text-sky-400 hover:underline font-semibold text-left">
                                            {sku.name}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span>{sku.skuId}</span>
                                            {sku.barcode && <span className="text-xs text-slate-400 font-mono mt-0.5">{sku.barcode}</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">
                                        {sku.price ? `¥${sku.price.toLocaleString()}` : '-'}
                                    </td>
                                    <td className="px-6 py-4">{getSeriesName(sku.seriesId)}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {sku.categoryIds.map(catId => <Badge key={catId}>{getCategoryPath(catId, dataMap.categories)}</Badge>)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {allAttributeIds.map(attrId => (
                                                <Badge key={attrId} color="green">
                                                    {getAttributeName(attrId)}: {attributeSource.attributeValues[attrId] || 'N/A'}
                                                </Badge>
                                            ))}
                                            {series && allAttributeIds.length > 0 && <Badge color="purple">継承</Badge>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <Button onClick={() => onEdit(sku)} variant="secondary" size="sm">
                                                編集
                                            </Button>
                                            <Button onClick={() => onDelete(sku.id)} variant="danger" size="sm">
                                                {ICONS.trash}
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            )})
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
