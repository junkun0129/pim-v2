
import React, { useState, useMemo, useEffect } from 'react';
import type { Sku, Series, Category, AttributeSet, Attribute } from '../types';
import SkuTable from './SkuTable';
import SkuModal from './modals/SkuModal';
import ImportModal from './modals/ImportModal';
import Button from './ui/Button';
import { ICONS } from '../constants';
import Card from './ui/Card';
import Select from './ui/Select';
import Modal from './ui/Modal';
import Badge from './ui/Badge';
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
    updateSku: (sku: Sku) => void;
    deleteSku: (id: string) => void;
    onViewSku: (skuId: string) => void;
    onImportSkus?: (skus: Omit<Sku, 'id'>[]) => void;
}

interface AttributeFilter {
    attributeId: string;
    value: string;
}

const ITEMS_PER_PAGE = 10;

export default function SkuView({ skus, dataMap, addSku, updateSku, deleteSku, onViewSku, onImportSkus }: SkuViewProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [editingSku, setEditingSku] = useState<Sku | undefined>(undefined);
    
    // Filter State
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [seriesFilter, setSeriesFilter] = useState('');
    
    // Attribute Filter State
    const [attributeFilters, setAttributeFilters] = useState<AttributeFilter[]>([]);
    const [targetAttrId, setTargetAttrId] = useState('');
    const [targetAttrValue, setTargetAttrValue] = useState('');

    // Pagination & Selection State
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedSkuIds, setSelectedSkuIds] = useState<Set<string>>(new Set());

    const filteredSkus = useMemo(() => {
        return skus.filter(sku => {
            // 1. Basic Filters
            const nameMatch = sku.name.toLowerCase().includes(searchTerm.toLowerCase());
            const skuIdMatch = sku.skuId.toLowerCase().includes(searchTerm.toLowerCase());
            const categoryMatch = categoryFilter ? sku.categoryIds.includes(categoryFilter) : true;
            const seriesMatch = seriesFilter ? sku.seriesId === seriesFilter : true;
            
            if (!((nameMatch || skuIdMatch) && categoryMatch && seriesMatch)) {
                return false;
            }

            // 2. Attribute Filters
            if (attributeFilters.length > 0) {
                const matchesAllAttributes = attributeFilters.every(filter => {
                    // Check SKU's own attributes
                    const directValue = sku.attributeValues[filter.attributeId];
                    
                    // Check Parent Series attributes (Inheritance)
                    const parentSeries = dataMap.series.find(s => s.id === sku.seriesId);
                    const inheritedValue = parentSeries?.attributeValues[filter.attributeId];
                    
                    const actualValue = directValue || inheritedValue || '';
                    
                    return actualValue.toLowerCase().includes(filter.value.toLowerCase());
                });

                if (!matchesAllAttributes) return false;
            }

            return true;
        });
    }, [skus, searchTerm, categoryFilter, seriesFilter, attributeFilters, dataMap.series]);

    // Reset pagination when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, categoryFilter, seriesFilter, attributeFilters]);

    // Pagination Calculations
    const totalPages = Math.ceil(filteredSkus.length / ITEMS_PER_PAGE);
    const paginatedSkus = filteredSkus.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    // Selection Handlers
    const handleToggleSelect = (id: string) => {
        const newSelected = new Set(selectedSkuIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedSkuIds(newSelected);
    };

    const handleToggleAllPage = (checked: boolean) => {
        const newSelected = new Set(selectedSkuIds);
        paginatedSkus.forEach(sku => {
            if (checked) {
                newSelected.add(sku.id);
            } else {
                newSelected.delete(sku.id);
            }
        });
        setSelectedSkuIds(newSelected);
    };

    const isAllPageSelected = paginatedSkus.length > 0 && paginatedSkus.every(s => selectedSkuIds.has(s.id));

    const handleAddAttributeFilter = () => {
        if (targetAttrId && targetAttrValue) {
            // Avoid duplicates
            if (!attributeFilters.some(f => f.attributeId === targetAttrId && f.value === targetAttrValue)) {
                setAttributeFilters(prev => [...prev, { attributeId: targetAttrId, value: targetAttrValue }]);
            }
            setTargetAttrValue('');
            setTargetAttrId('');
        }
    };

    const handleRemoveAttributeFilter = (index: number) => {
        setAttributeFilters(prev => prev.filter((_, i) => i !== index));
    };

    const handleOpenCreateModal = () => {
        setEditingSku(undefined);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (sku: Sku) => {
        setEditingSku(sku);
        setIsModalOpen(true);
    };

    const handleSaveSku = (skuData: Omit<Sku, 'id'>) => {
        if (editingSku) {
            updateSku({ ...editingSku, ...skuData });
        } else {
            addSku(skuData);
        }
    };

    const handleExport = () => {
        // Export selected items if any, otherwise all filtered
        const targetSkus = selectedSkuIds.size > 0 
            ? skus.filter(s => selectedSkuIds.has(s.id)) 
            : filteredSkus;

        const headers = ['id', 'name', 'skuId', 'barcode', 'price', 'imageUrl'];
        const rows = targetSkus.map(sku => {
            return [
                sku.id,
                `"${sku.name.replace(/"/g, '""')}"`,
                sku.skuId,
                sku.barcode || '',
                sku.price || 0,
                sku.imageUrl || ''
            ].join(',');
        });

        const csvContent = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `skus_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Generate Import Template / Sheet
    const handleGenerateTemplate = () => {
        const targetSkus = selectedSkuIds.size > 0 
            ? skus.filter(s => selectedSkuIds.has(s.id)) 
            : []; // If nothing selected, maybe generate empty template? Or alert.
        
        if (targetSkus.length === 0) {
            alert("テンプレートを生成するには、リストからSKUを選択してください。");
            return;
        }

        // 1. Collect all unique attributes used by selected SKUs (and their series)
        const allUsedAttributeIds = new Set<string>();
        
        targetSkus.forEach(sku => {
            // Direct attributes
            Object.keys(sku.attributeValues).forEach(k => allUsedAttributeIds.add(k));
            
            // Series attributes
            if (sku.seriesId) {
                const ser = dataMap.series.find(s => s.id === sku.seriesId);
                if (ser) {
                    Object.keys(ser.attributeValues).forEach(k => allUsedAttributeIds.add(k));
                }
            }
        });

        const attributeHeaders = Array.from(allUsedAttributeIds).map(id => {
            const attr = dataMap.attributes.find(a => a.id === id);
            return attr ? attr.name : id;
        });

        // 2. Build CSV Headers
        const staticHeaders = ['name', 'skuId', 'price', 'barcode'];
        const csvHeaderRow = [...staticHeaders, ...attributeHeaders].join(',');

        // 3. Build Rows
        const rows = targetSkus.map(sku => {
            const ser = sku.seriesId ? dataMap.series.find(s => s.id === sku.seriesId) : null;
            
            const staticData = [
                `"${sku.name.replace(/"/g, '""')}"`,
                sku.skuId,
                sku.price || 0,
                sku.barcode || ''
            ];

            const dynamicData = Array.from(allUsedAttributeIds).map(attrId => {
                // Check SKU first, then Series (Inheritance)
                const val = sku.attributeValues[attrId] || (ser?.attributeValues[attrId]) || '';
                return `"${val.replace(/"/g, '""')}"`;
            });

            return [...staticData, ...dynamicData].join(',');
        });

        const csvContent = [csvHeaderRow, ...rows].join('\n');
        
        // BOM for Excel compatibility with UTF-8
        const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
        const blob = new Blob([bom, csvContent], { type: 'text/csv;charset=utf-8;' });
        
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `import_template_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getAttributeName = (id: string) => dataMap.attributes.find(a => a.id === id)?.name || id;
    const activeFilterCount = (categoryFilter ? 1 : 0) + (seriesFilter ? 1 : 0) + attributeFilters.length;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <h1 className="text-2xl md:text-3xl font-bold text-zinc-800 dark:text-white font-['Plus_Jakarta_Sans']">SKU Management</h1>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
                    <Button variant="secondary" onClick={() => setIsImportModalOpen(true)} className="flex-1 sm:flex-none">
                        {ICONS.upload} <span className="ml-2">Import</span>
                    </Button>
                     <div className="relative group">
                         {/* Split Export Button */}
                        <div className="flex rounded-lg shadow-sm">
                            <Button variant="secondary" onClick={handleExport} className="rounded-r-none border-r-0 flex-1 sm:flex-none">
                                {ICONS.download} <span className="ml-2">Export</span>
                            </Button>
                            <Button variant="secondary" onClick={handleGenerateTemplate} className="rounded-l-none px-2" title="選択したSKUからインポート用シートを作成">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>
                            </Button>
                        </div>
                    </div>
                    <Button onClick={handleOpenCreateModal} className="flex-1 sm:flex-none shadow-lg shadow-zinc-900/20">
                        {ICONS.plus} <span className="ml-2">Add SKU</span>
                    </Button>
                </div>
            </div>

            {/* Compact Search & Filter Bar */}
            <div className="bg-white dark:bg-zinc-900 p-2 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row gap-2">
                <div className="relative flex-grow">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
                        {ICONS.search}
                    </span>
                    <input
                        type="text"
                        placeholder="名前またはSKU IDで検索..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-transparent border-none text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:ring-0"
                    />
                </div>
                <Button 
                    variant="secondary" 
                    onClick={() => setIsFilterModalOpen(true)}
                    className={`shrink-0 ${activeFilterCount > 0 ? 'bg-sky-50 border-sky-200 text-sky-700 dark:bg-sky-900/20 dark:border-sky-800 dark:text-sky-300' : ''}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
                    Filters
                    {activeFilterCount > 0 && (
                        <span className="ml-2 bg-sky-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                            {activeFilterCount}
                        </span>
                    )}
                </Button>
            </div>

            {/* Active Filter Chips & Selection Info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
                {/* Left: Filters */}
                {activeFilterCount > 0 ? (
                    <div className="flex flex-wrap gap-2 items-center">
                        <span className="text-xs font-bold text-zinc-400 uppercase mr-2">Filters:</span>
                        
                        {categoryFilter && (
                             <Badge color="blue" className="flex items-center gap-1 pr-1">
                                カテゴリ: {getCategoryPath(categoryFilter, dataMap.categories).split('>').pop()}
                                <button onClick={() => setCategoryFilter('')} className="p-0.5 hover:bg-blue-200 rounded-full"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
                            </Badge>
                        )}
                        
                        {seriesFilter && (
                             <Badge color="purple" className="flex items-center gap-1 pr-1">
                                シリーズ: {dataMap.series.find(s => s.id === seriesFilter)?.name}
                                <button onClick={() => setSeriesFilter('')} className="p-0.5 hover:bg-purple-200 rounded-full"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
                            </Badge>
                        )}

                        {attributeFilters.map((filter, index) => (
                            <Badge key={index} color="green" className="flex items-center gap-1 pr-1">
                                {getAttributeName(filter.attributeId)}: {filter.value}
                                <button onClick={() => handleRemoveAttributeFilter(index)} className="p-0.5 hover:bg-emerald-200 rounded-full"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
                            </Badge>
                        ))}

                        <button 
                            onClick={() => {
                                setCategoryFilter('');
                                setSeriesFilter('');
                                setAttributeFilters([]);
                            }}
                            className="text-xs text-red-500 hover:text-red-700 hover:underline ml-2"
                        >
                            Clear All
                        </button>
                    </div>
                ) : <div></div>}

                {/* Right: Selection Count */}
                {selectedSkuIds.size > 0 && (
                    <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-lg border border-blue-100 dark:border-blue-800">
                        <span className="text-xs font-bold text-blue-700 dark:text-blue-300">
                            {selectedSkuIds.size} 件選択中
                        </span>
                        <button 
                            onClick={() => setSelectedSkuIds(new Set())}
                            className="text-xs text-blue-500 hover:text-blue-700 underline"
                        >
                            クリア
                        </button>
                    </div>
                )}
            </div>

            <SkuTable 
                skus={paginatedSkus} 
                dataMap={dataMap} 
                onDelete={deleteSku} 
                onViewSku={onViewSku} 
                onEdit={handleOpenEditModal}
                selectedIds={selectedSkuIds}
                onToggleSelect={handleToggleSelect}
                onToggleAll={handleToggleAllPage}
                isAllSelected={isAllPageSelected}
            />

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-zinc-200 dark:border-zinc-800 pt-4">
                    <div className="text-sm text-zinc-500">
                        全 {filteredSkus.length} 件中 {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredSkus.length)} 件を表示
                    </div>
                    <div className="flex gap-2">
                        <Button 
                            variant="secondary" 
                            size="sm" 
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                        >
                            前へ
                        </Button>
                        <div className="flex items-center px-2">
                            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                {currentPage} / {totalPages}
                            </span>
                        </div>
                        <Button 
                            variant="secondary" 
                            size="sm" 
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                        >
                            次へ
                        </Button>
                    </div>
                </div>
            )}
            
            {/* Filter Modal */}
            <Modal isOpen={isFilterModalOpen} onClose={() => setIsFilterModalOpen(false)} title="詳細検索・絞り込み">
                <div className="space-y-6">
                    {/* Basic Filters */}
                    <div className="space-y-4">
                        <Select 
                            label="カテゴリ"
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                        >
                            <option value="">すべてのカテゴリ</option>
                            {dataMap.categories.map(c => <option key={c.id} value={c.id}>{getCategoryPath(c.id, dataMap.categories)}</option>)}
                        </Select>
                        
                        <Select
                            label="シリーズ"
                            value={seriesFilter}
                            onChange={(e) => setSeriesFilter(e.target.value)}
                        >
                            <option value="">すべてのシリーズ</option>
                            {dataMap.series.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </Select>
                    </div>

                    <div className="border-t border-zinc-100 dark:border-zinc-800 my-4"></div>

                    {/* Attribute Filters */}
                    <div>
                        <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase tracking-wide">属性フィルタ追加</label>
                        <div className="space-y-3 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-100 dark:border-zinc-800">
                             <Select 
                                value={targetAttrId}
                                onChange={(e) => setTargetAttrId(e.target.value)}
                            >
                                <option value="">属性を選択...</option>
                                {dataMap.attributes.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                            </Select>
                            <input 
                                type="text"
                                value={targetAttrValue}
                                onChange={(e) => setTargetAttrValue(e.target.value)}
                                placeholder="値を入力 (例: Red, 64GB)"
                                className="w-full px-3 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:border-zinc-800"
                                onKeyDown={(e) => e.key === 'Enter' && handleAddAttributeFilter()}
                            />
                            <Button onClick={handleAddAttributeFilter} disabled={!targetAttrId || !targetAttrValue} variant="secondary" className="w-full">
                                条件リストに追加
                            </Button>
                        </div>
                    </div>

                    {/* Active Filters inside Modal */}
                    {attributeFilters.length > 0 && (
                        <div>
                             <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase tracking-wide">適用中の属性フィルタ</label>
                             <div className="flex flex-wrap gap-2">
                                {attributeFilters.map((filter, index) => (
                                    <Badge key={index} color="green" className="flex items-center gap-1">
                                        {getAttributeName(filter.attributeId)}: {filter.value}
                                        <button onClick={() => handleRemoveAttributeFilter(index)} className="ml-1 text-emerald-700 hover:text-emerald-900">×</button>
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end pt-4">
                        <Button onClick={() => setIsFilterModalOpen(false)}>完了</Button>
                    </div>
                </div>
            </Modal>

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <SkuModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveSku}
                    dataMap={dataMap}
                    sku={editingSku}
                />
            )}

            {isImportModalOpen && (
                <ImportModal
                    isOpen={isImportModalOpen}
                    onClose={() => setIsImportModalOpen(false)}
                    onImport={(newSkus) => {
                         if (onImportSkus) onImportSkus(newSkus);
                    }}
                />
            )}
        </div>
    );
}
