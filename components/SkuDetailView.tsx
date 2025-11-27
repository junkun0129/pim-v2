
import React from 'react';
import type { Sku, Series, Category, Attribute, AttributeSet } from '../types';
import Button from './ui/Button';
import Card from './ui/Card';
import Badge from './ui/Badge';
import { getCategoryPath } from '../utils';

interface SkuDetailViewProps {
    sku: Sku;
    dataMap: {
        series: Series[];
        categories: Category[];
        attributes: Attribute[];
        attributeSets: AttributeSet[];
    };
    onBack: () => void;
}

export default function SkuDetailView({ sku, dataMap, onBack }: SkuDetailViewProps) {
    const series = sku.seriesId ? dataMap.series.find(s => s.id === sku.seriesId) : null;
    const imageUrl = sku.imageUrl || series?.imageUrl;

    const getAttributeName = (id: string) => dataMap.attributes.find(a => a.id === id)?.name || '不明';
    
    const attributeSource = series || sku;
    const allAttributeIds = attributeSource.attributeSetIds.flatMap(setId => 
        dataMap.attributeSets.find(as => as.id === setId)?.attributeIds || []
    );

    // Combine assets from SKU and Series (optional: series assets could be inherited)
    const assets = sku.assets || [];
    
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                 <Button onClick={onBack} variant="secondary">
                    &larr; SKU一覧に戻る
                </Button>
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white">{sku.name}</h1>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <Card>
                        {imageUrl ? (
                            <img src={imageUrl} alt={sku.name} className="w-full h-auto object-cover rounded-lg aspect-square" />
                        ) : (
                            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center text-slate-400 aspect-square">
                                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                            </div>
                        )}
                        <div className="mt-4 p-4 bg-sky-50 dark:bg-sky-900/20 rounded-lg text-center">
                            <p className="text-sm text-sky-600 dark:text-sky-300 font-medium">販売価格</p>
                            <p className="text-2xl font-bold text-sky-800 dark:text-sky-100">
                                {sku.price ? `¥${sku.price.toLocaleString()}` : '-'}
                            </p>
                        </div>
                    </Card>
                    
                    {/* Assets Gallery */}
                    <Card className="mt-6">
                        <h2 className="text-lg font-semibold mb-3">アセット (広告・素材)</h2>
                        {assets.length > 0 ? (
                            <div className="grid grid-cols-2 gap-2">
                                {assets.map(asset => (
                                    <div key={asset.id} className="group relative aspect-square bg-slate-100 dark:bg-slate-700 rounded-md overflow-hidden border border-slate-200 dark:border-slate-600">
                                        <img src={asset.url} alt={asset.name} className="w-full h-full object-contain" />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                             <a href={asset.url} target="_blank" rel="noopener noreferrer" className="text-white text-xs hover:underline">
                                                 表示
                                             </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-500 text-center py-4">アセットがありません</p>
                        )}
                    </Card>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <h2 className="text-xl font-semibold mb-4">基本情報</h2>
                        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                            <dt className="font-medium text-slate-500">名前</dt>
                            <dd className="text-slate-900 dark:text-white">{sku.name}</dd>
                            
                            <dt className="font-medium text-slate-500">SKU ID</dt>
                            <dd className="text-slate-900 dark:text-white">{sku.skuId}</dd>

                            <dt className="font-medium text-slate-500">バーコード (JAN/EAN)</dt>
                            <dd className="text-slate-900 dark:text-white font-mono">{sku.barcode || '-'}</dd>

                            <dt className="font-medium text-slate-500">シリーズ</dt>
                            <dd className="text-slate-900 dark:text-white">{series?.name || 'N/A'}</dd>
                        </dl>
                    </Card>

                    <Card>
                         <h2 className="text-xl font-semibold mb-4">カテゴリ</h2>
                         <div className="flex flex-wrap gap-2">
                            {sku.categoryIds.map(catId => <Badge key={catId}>{getCategoryPath(catId, dataMap.categories)}</Badge>)}
                            {sku.categoryIds.length === 0 && <p className="text-sm text-slate-500">カテゴリがありません</p>}
                         </div>
                    </Card>

                    <Card>
                         <h2 className="text-xl font-semibold mb-4">属性値</h2>
                         <div className="space-y-3">
                             {allAttributeIds.length > 0 ? (
                                allAttributeIds.map(attrId => (
                                    <div key={attrId} className="flex justify-between items-center text-sm">
                                        <span className="font-medium text-slate-500">{getAttributeName(attrId)}</span>
                                        <span className="font-semibold text-slate-800 dark:text-white">{attributeSource.attributeValues[attrId] || 'N/A'}</span>
                                    </div>
                                ))
                             ) : (
                                <p className="text-sm text-slate-500">属性値がありません</p>
                             )}
                              {series && allAttributeIds.length > 0 && 
                                <div className="pt-2 border-t dark:border-slate-700 mt-3">
                                    <Badge color="purple">シリーズから継承</Badge>
                                </div>
                              }
                         </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
