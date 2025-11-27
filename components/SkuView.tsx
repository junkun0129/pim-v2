
import React, { useState, useMemo } from 'react';
import type { Sku, Series, Category, AttributeSet, Attribute } from '../types';
import SkuTable from './SkuTable';
import SkuModal from './modals/SkuModal';
import Button from './ui/Button';
import { ICONS } from '../constants';
import Card from './ui/Card';
import Select from './ui/Select';
import { getCategoryPath } from '../utils';

interface SkuViewProps {
    skus: Sku[];
    dataMap: {
        series: Series[];
        categories: Category[];
        attributeSets: AttributeSet[];
        attributes: Attribute[];
    };
    addSku: (sku: Omit<Sku, 'id'>) => void;
    deleteSku: (id: string) => void;
    onViewSku: (skuId: string) => void;
}

export default function SkuView({ skus, dataMap, addSku, deleteSku, onViewSku }: SkuViewProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [seriesFilter, setSeriesFilter] = useState('');

    const filteredSkus = useMemo(() => {
        return skus.filter(sku => {
            const nameMatch = sku.name.toLowerCase().includes(searchTerm.toLowerCase());
            const skuIdMatch = sku.skuId.toLowerCase().includes(searchTerm.toLowerCase());
            const categoryMatch = categoryFilter ? sku.categoryIds.includes(categoryFilter) : true;
            const seriesMatch = seriesFilter ? sku.seriesId === seriesFilter : true;
            return (nameMatch || skuIdMatch) && categoryMatch && seriesMatch;
        });
    }, [skus, searchTerm, categoryFilter, seriesFilter]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <h1 className="text-3xl font-bold text-zinc-800 dark:text-white font-['Plus_Jakarta_Sans']">SKU Management</h1>
                <Button onClick={() => setIsModalOpen(true)} className="w-full md:w-auto shadow-lg shadow-zinc-900/20">
                    {ICONS.plus}
                    新規SKUを追加
                </Button>
            </div>

            <Card className="border-0 shadow-lg dark:shadow-none dark:border dark:border-zinc-800">
                <div className="space-y-4 md:space-y-0 md:flex md:items-end md:gap-4">
                    <div className="relative flex-grow">
                        <label className="block text-xs font-bold text-zinc-500 mb-1.5 uppercase tracking-wide">Search</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
                               {ICONS.search}
                            </span>
                            <input
                                type="text"
                                placeholder="名前またはSKU IDで検索..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 h-[42px] border rounded-lg bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-sm focus:outline-none focus:border-zinc-800 focus:ring-1 focus:ring-zinc-800 dark:focus:border-zinc-500 dark:focus:ring-zinc-500 transition-colors"
                            />
                        </div>
                    </div>
                    
                    <Select 
                        label="Category Filter"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        containerClassName="w-full md:w-1/4"
                    >
                        <option value="">すべてのカテゴリ</option>
                        {dataMap.categories.map(c => <option key={c.id} value={c.id}>{getCategoryPath(c.id, dataMap.categories)}</option>)}
                    </Select>
                    
                    <Select
                        label="Series Filter"
                        value={seriesFilter}
                        onChange={(e) => setSeriesFilter(e.target.value)}
                        containerClassName="w-full md:w-1/4"
                    >
                        <option value="">すべてのシリーズ</option>
                        {dataMap.series.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </Select>
                </div>
            </Card>

            <SkuTable skus={filteredSkus} dataMap={dataMap} onDelete={deleteSku} onViewSku={onViewSku}/>
            
            {isModalOpen && (
                <SkuModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={addSku}
                    dataMap={dataMap}
                />
            )}
        </div>
    );
}
