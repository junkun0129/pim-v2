import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Sku, Series, Category, AttributeSet, Attribute, Permission } from '../../types';
import SkuTable from './SkuTable';
import SkuModal from '../modals/SkuModal';
import ImportModal from '../modals/ImportModal';
import Button from '../ui/Button';
import { ICONS } from '../../constants';
import Select from '../ui/Select';
import Modal from '../ui/Modal';
import Badge from '../ui/Badge';
import { getCategoryPath } from '../../utils';

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
    userPermissions: Permission[];
}

interface AttributeFilter {
    attributeId: string;
    value: string;
}

export default function SkuView({ skus, dataMap, addSku, updateSku, deleteSku, onViewSku, onImportSkus, userPermissions }: SkuViewProps) {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [editingSku, setEditingSku] = useState<Sku | undefined>(undefined);
    
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [seriesFilter, setSeriesFilter] = useState('');
    const [attributeFilters, setAttributeFilters] = useState<AttributeFilter[]>([]);
    const [targetAttrId, setTargetAttrId] = useState('');
    const [targetAttrValue, setTargetAttrValue] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [selectedSkuIds, setSelectedSkuIds] = useState<Set<string>>(new Set());

    const canCreate = userPermissions.includes('MASTER_CREATE');
    const canImport = userPermissions.includes('MASTER_IMPORT');

    const filteredSkus = useMemo(() => {
        return skus.filter(sku => {
            const nameMatch = sku.name.toLowerCase().includes(searchTerm.toLowerCase());
            const skuIdMatch = sku.skuId.toLowerCase().includes(searchTerm.toLowerCase());
            const categoryMatch = categoryFilter ? sku.categoryIds.includes(categoryFilter) : true;
            const seriesMatch = seriesFilter ? sku.seriesId === seriesFilter : true;
            if (!((nameMatch || skuIdMatch) && categoryMatch && seriesMatch)) return false;
            
            if (attributeFilters.length > 0) {
                const matchesAllAttributes = attributeFilters.every(filter => {
                    const directValue = sku.attributeValues[filter.attributeId];
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

    useEffect(() => { setCurrentPage(1); }, [searchTerm, categoryFilter, seriesFilter, attributeFilters, itemsPerPage]);

    const totalPages = Math.ceil(filteredSkus.length / itemsPerPage);
    const paginatedSkus = filteredSkus.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleToggleSelect = (id: string) => {
        const newSelected = new Set(selectedSkuIds);
        if (newSelected.has(id)) newSelected.delete(id);
        else newSelected.add(id);
        setSelectedSkuIds(newSelected);
    };

    const handleToggleAllPage = (checked: boolean) => {
        const newSelected = new Set(selectedSkuIds);
        paginatedSkus.forEach(sku => checked ? newSelected.add(sku.id) : newSelected.delete(sku.id));
        setSelectedSkuIds(newSelected);
    };

    const isAllPageSelected = paginatedSkus.length > 0 && paginatedSkus.every(s => selectedSkuIds.has(s.id));

    const handleAddAttributeFilter = () => {
        if (targetAttrId && targetAttrValue) {
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

    const handleOpenCreateModal = () => { setEditingSku(undefined); setIsModalOpen(true); };
    const handleOpenEditModal = (sku: Sku) => { setEditingSku(sku); setIsModalOpen(true); };
    const handleSaveSku = (skuData: Omit<Sku, 'id'>) => {
        if (editingSku) updateSku({ ...editingSku, ...skuData });
        else addSku(skuData);
    };

    const handleViewInternal = (id: string) => {
        navigate(`/skus/${id}`);
    };

    const activeFilterCount = (categoryFilter ? 1 : 0) + (seriesFilter ? 1 : 0) + attributeFilters.length;
    const getAttributeName = (id: string) => dataMap.attributes.find(a => a.id === id)?.name || id;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <h1 className="text-2xl md:text-3xl font-bold text-zinc-800 dark:text-white font-['Plus_Jakarta_Sans']">SKU Management</h1>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
                    {canImport && (
                        <Button variant="secondary" onClick={() => setIsImportModalOpen(true)} className="flex-1 sm:flex-none">
                            {ICONS.upload} <span className="ml-2">Import</span>
                        </Button>
                    )}
                    {canCreate && (
                        <Button onClick={handleOpenCreateModal} className="flex-1 sm:flex-none shadow-lg shadow-zinc-900/20">
                            {ICONS.plus} <span className="ml-2">Add SKU</span>
                        </Button>
                    )}
                </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-2 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row gap-2">
                 <div className="relative flex-grow">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">{ICONS.search}</span>
                    <input type="text" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-transparent border-none text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:ring-0" />
                 </div>
                 <Button variant="secondary" onClick={() => setIsFilterModalOpen(true)}>
                    {ICONS.settings} Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
                 </Button>
            </div>

            {activeFilterCount > 0 && (
                <div className="flex flex-wrap gap-2">
                    {categoryFilter && <Badge color="blue">Category: {getCategoryPath(categoryFilter, dataMap.categories).split('>').pop()}</Badge>}
                    {attributeFilters.map((f, i) => <Badge key={i} color="green">{getAttributeName(f.attributeId)}: {f.value} <button onClick={() => handleRemoveAttributeFilter(i)}>×</button></Badge>)}
                    <button onClick={() => { setCategoryFilter(''); setAttributeFilters([]); }} className="text-xs text-red-500 hover:underline">Clear All</button>
                </div>
            )}

            <SkuTable 
                skus={paginatedSkus} 
                dataMap={dataMap} 
                onDelete={deleteSku} 
                onViewSku={handleViewInternal} 
                onEdit={handleOpenEditModal}
                selectedIds={selectedSkuIds}
                onToggleSelect={handleToggleSelect}
                onToggleAll={handleToggleAllPage}
                isAllSelected={isAllPageSelected}
            />

            {filteredSkus.length > 0 && (
                <div className="flex items-center justify-between text-sm text-zinc-500">
                    <div>{currentPage} / {totalPages} (Total: {filteredSkus.length})</div>
                    <div className="flex gap-2">
                        <Button size="sm" variant="secondary" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Prev</Button>
                        <Button size="sm" variant="secondary" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next</Button>
                    </div>
                </div>
            )}

            {isModalOpen && (
                <SkuModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveSku} dataMap={dataMap} sku={editingSku} />
            )}
            {isImportModalOpen && (
                <ImportModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} onImport={onImportSkus || (() => {})} />
            )}
             <Modal isOpen={isFilterModalOpen} onClose={() => setIsFilterModalOpen(false)} title="詳細検索・絞り込み">
                <div className="space-y-6">
                    <Select label="カテゴリ" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                        <option value="">すべてのカテゴリ</option>
                        {dataMap.categories.map(c => <option key={c.id} value={c.id}>{getCategoryPath(c.id, dataMap.categories)}</option>)}
                    </Select>
                    
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase">属性フィルタ</label>
                        <div className="flex gap-2">
                            <Select value={targetAttrId} onChange={(e) => setTargetAttrId(e.target.value)} className="flex-1">
                                <option value="">属性を選択...</option>
                                {dataMap.attributes.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                            </Select>
                            <input type="text" value={targetAttrValue} onChange={(e) => setTargetAttrValue(e.target.value)} placeholder="値" className="border rounded px-2 text-sm w-24" />
                            <Button size="sm" onClick={handleAddAttributeFilter}>追加</Button>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4"><Button onClick={() => setIsFilterModalOpen(false)}>完了</Button></div>
                </div>
            </Modal>
        </div>
    );
}