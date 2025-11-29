
import React, { useState, useMemo, useEffect } from 'react';
import type { Sku, Series, Category, Attribute, ExportChannel, ExportColumn, AttributeSet } from '../types';
import Card from './ui/Card';
import Button from './ui/Button';
import Badge from './ui/Badge';
import Input from './ui/Input';
import Select from './ui/Select';
import Modal from './ui/Modal';
import { ICONS } from '../constants';
import { getCategoryPath } from '../utils';

interface ChannelExportManagerProps {
    skus: Sku[];
    series: Series[];
    categories: Category[];
    attributes: Attribute[];
    attributeSets: AttributeSet[];
    channels: ExportChannel[];
    onAddChannel: (channel: ExportChannel) => void;
    onUpdateChannel: (channel: ExportChannel) => void;
    onDeleteChannel: (id: string) => void;
}

interface AttributeFilter {
    attributeId: string;
    value: string;
}

export default function ChannelExportManager({ skus, series, categories, attributes, attributeSets, channels, onAddChannel, onUpdateChannel, onDeleteChannel }: ChannelExportManagerProps) {
    const [viewMode, setViewMode] = useState<'LIST' | 'EDIT'>('LIST');
    const [editingChannel, setEditingChannel] = useState<ExportChannel | null>(null);

    // Edit State
    const [editName, setEditName] = useState('');
    const [editFormat, setEditFormat] = useState<'CSV' | 'TSV'>('CSV');
    const [editColumns, setEditColumns] = useState<ExportColumn[]>([]);

    // Execution / Selection State
    const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false);
    const [targetChannel, setTargetChannel] = useState<ExportChannel | null>(null);
    const [selectedSkuIds, setSelectedSkuIds] = useState<Set<string>>(new Set());
    
    // Filters
    const [filterText, setFilterText] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [attributeSetFilter, setAttributeSetFilter] = useState('');
    const [attributeFilters, setAttributeFilters] = useState<AttributeFilter[]>([]);
    
    // Pagination for Selection Modal
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);
    
    // UI State for adding attribute filter
    const [targetAttrId, setTargetAttrId] = useState('');
    const [targetAttrValue, setTargetAttrValue] = useState('');

    const availableSourceFields = [
        { value: 'id', label: 'Internal ID' },
        { value: 'name', label: '商品名' },
        { value: 'skuId', label: 'SKU ID' },
        { value: 'price', label: '価格' },
        { value: 'barcode', label: 'バーコード' },
        { value: 'seriesId', label: 'シリーズID' },
        // Add attributes dynamically
        ...attributes.map(a => ({ value: `attribute.${a.id}`, label: `属性: ${a.name}` }))
    ];

    // Filter SKUs for the selection modal
    const filteredSkus = useMemo(() => {
        return skus.filter(sku => {
            // 1. Text Search
            if (filterText) {
                const matchText = sku.name.toLowerCase().includes(filterText.toLowerCase()) || 
                                sku.skuId.toLowerCase().includes(filterText.toLowerCase());
                if (!matchText) return false;
            }

            // 2. Category Filter
            if (categoryFilter) {
                if (!sku.categoryIds.includes(categoryFilter)) return false;
            }

            // 3. Attribute Set Filter
            if (attributeSetFilter) {
                // Check SKU own sets and Series sets
                const parentSeries = series.find(s => s.id === sku.seriesId);
                const skuHasSet = sku.attributeSetIds.includes(attributeSetFilter);
                const seriesHasSet = parentSeries?.attributeSetIds.includes(attributeSetFilter);
                
                if (!skuHasSet && !seriesHasSet) return false;
            }

            // 4. Attribute Value Filters (Combine Logic: AND)
            if (attributeFilters.length > 0) {
                const matchesAll = attributeFilters.every(filter => {
                    const parentSeries = series.find(s => s.id === sku.seriesId);
                    
                    const directValue = sku.attributeValues[filter.attributeId];
                    const seriesValue = parentSeries?.attributeValues[filter.attributeId];
                    const actualValue = directValue || seriesValue || '';
                    
                    return actualValue.toLowerCase().includes(filter.value.toLowerCase());
                });
                if (!matchesAll) return false;
            }

            return true;
        });
    }, [skus, series, filterText, categoryFilter, attributeSetFilter, attributeFilters]);

    // Reset pagination when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [filterText, categoryFilter, attributeSetFilter, attributeFilters, itemsPerPage]);

    // Pagination Calculation
    const totalPages = Math.ceil(filteredSkus.length / itemsPerPage);
    const paginatedSkus = filteredSkus.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleStartEdit = (channel?: ExportChannel) => {
        if (channel) {
            setEditingChannel(channel);
            setEditName(channel.name);
            setEditFormat(channel.fileFormat);
            setEditColumns(JSON.parse(JSON.stringify(channel.columns)));
        } else {
            setEditingChannel(null);
            setEditName('');
            setEditFormat('CSV');
            setEditColumns([]);
        }
        setViewMode('EDIT');
    };

    const handleSaveChannel = () => {
        const newChannel: ExportChannel = {
            id: editingChannel ? editingChannel.id : `ch-${Date.now()}`,
            name: editName,
            fileFormat: editFormat,
            columns: editColumns,
            lastExported: editingChannel?.lastExported
        };

        if (editingChannel) {
            onUpdateChannel(newChannel);
        } else {
            onAddChannel(newChannel);
        }
        setViewMode('LIST');
    };

    const handleAddColumn = () => {
        setEditColumns([...editColumns, {
            id: `col-${Date.now()}`,
            headerName: '',
            sourceField: 'name',
            defaultValue: ''
        }]);
    };

    const updateColumn = (id: string, updates: Partial<ExportColumn>) => {
        setEditColumns(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    };

    const removeColumn = (id: string) => {
        setEditColumns(prev => prev.filter(c => c.id !== id));
    };

    // --- Selection Logic ---

    const openSelectionModal = (channel: ExportChannel) => {
        setTargetChannel(channel);
        setSelectedSkuIds(new Set()); 
        // Reset filters
        setFilterText('');
        setCategoryFilter('');
        setAttributeSetFilter('');
        setAttributeFilters([]);
        setIsSelectionModalOpen(true);
    };

    const toggleSkuSelection = (id: string) => {
        const newSet = new Set(selectedSkuIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedSkuIds(newSet);
    };

    const toggleAllFiltered = () => {
        const newSet = new Set(selectedSkuIds);
        // Only consider currently filtered SKUs for select all logic
        const allSelected = filteredSkus.length > 0 && filteredSkus.every(s => newSet.has(s.id));
        
        filteredSkus.forEach(s => {
            if (allSelected) newSet.delete(s.id);
            else newSet.add(s.id);
        });
        setSelectedSkuIds(newSet);
    };

    // --- Filter Handlers ---
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

    const getAttributeName = (id: string) => attributes.find(a => a.id === id)?.name || id;


    // --- Execute Logic ---
    const handleExecuteExport = () => {
        if (!targetChannel) return;
        
        const channel = targetChannel;
        const targetSkus = skus.filter(s => selectedSkuIds.has(s.id));
        
        if (targetSkus.length === 0) {
            alert("エクスポートするSKUを選択してください。");
            return;
        }

        // Generate CSV/TSV content
        const delimiter = channel.fileFormat === 'CSV' ? ',' : '\t';
        
        // Header
        const headerRow = channel.columns.map(c => `"${c.headerName}"`).join(delimiter);

        // Body
        const bodyRows = targetSkus.map(sku => {
            const parentSeries = series.find(s => s.id === sku.seriesId);
            
            return channel.columns.map(col => {
                let value = '';

                // Helper to extract value from field path
                const extractValue = (fieldPath: string) => {
                    if (fieldPath.startsWith('attribute.')) {
                        const attrId = fieldPath.split('.')[1];
                        return sku.attributeValues[attrId] || parentSeries?.attributeValues[attrId] || '';
                    } else {
                         // @ts-ignore
                        return String(sku[fieldPath] || '');
                    }
                };

                // 1. Try Primary Source
                value = extractValue(col.sourceField);

                // 2. Try Fallback Source (if primary is empty)
                if ((!value || value === 'undefined') && col.fallbackSourceField) {
                    value = extractValue(col.fallbackSourceField);
                }

                // 3. Use Default Value (if still empty)
                if ((!value || value === 'undefined') && col.defaultValue) {
                    value = col.defaultValue;
                }
                
                // Escape quotes
                const escaped = value.replace(/"/g, '""');
                return `"${escaped}"`;
            }).join(delimiter);
        });

        const content = [headerRow, ...bodyRows].join('\n');
        
        // Download
        const bom = new Uint8Array([0xEF, 0xBB, 0xBF]); // UTF-8 BOM
        const blob = new Blob([bom, content], { type: `text/${channel.fileFormat === 'CSV' ? 'csv' : 'tab-separated-values'};charset=utf-8;` });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${channel.name}_export_${new Date().toISOString().split('T')[0]}.${channel.fileFormat.toLowerCase()}`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Update last exported timestamp (mock)
        onUpdateChannel({ ...channel, lastExported: new Date().toLocaleString() });
        setIsSelectionModalOpen(false);
    };

    // --- Views ---

    const renderList = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        {ICONS.exportCloud} チャネル連携 (エクスポート)
                    </h1>
                    <p className="text-slate-500">外部ECモールやシステム向けのCSV出力設定を管理します</p>
                </div>
                <Button onClick={() => handleStartEdit()}>
                    {ICONS.plus} 新規チャネル追加
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {channels.map(channel => (
                    <Card key={channel.id} className="flex flex-col h-full hover:shadow-lg transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white">{channel.name}</h3>
                                <Badge color="gray" className="mt-1">{channel.fileFormat}</Badge>
                            </div>
                            <Button size="sm" variant="secondary" onClick={() => handleStartEdit(channel)}>
                                設定
                            </Button>
                        </div>
                        
                        <div className="text-sm text-slate-500 mb-6 flex-1 space-y-2">
                            <p>マッピングカラム数: <span className="font-bold">{channel.columns.length}</span></p>
                            <p>最終出力: {channel.lastExported || 'なし'}</p>
                        </div>

                        <div className="flex gap-2">
                            <Button onClick={() => openSelectionModal(channel)} className="flex-1">
                                {ICONS.download} エクスポート...
                            </Button>
                            <Button variant="danger" size="sm" onClick={() => onDeleteChannel(channel.id)}>
                                {ICONS.trash}
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );

    const renderEditor = () => (
        <div className="space-y-6 max-w-5xl mx-auto">
             <div className="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-700 pb-4">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                    {editingChannel ? 'チャネル設定編集' : '新規チャネル設定'}
                </h2>
                <div className="flex gap-2">
                    <Button variant="secondary" onClick={() => setViewMode('LIST')}>キャンセル</Button>
                    <Button onClick={handleSaveChannel} disabled={!editName}>保存</Button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
                <Input label="チャネル名" value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="例: Amazon JP" />
                <Select label="ファイル形式" value={editFormat} onChange={(e) => setEditFormat(e.target.value as any)}>
                    <option value="CSV">CSV (カンマ区切り)</option>
                    <option value="TSV">TSV (タブ区切り)</option>
                </Select>
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-slate-700 dark:text-slate-300">カラムマッピング設定</h3>
                        <p className="text-xs text-slate-500 mt-1">異なる属性セットを持つSKUを1つのシートにまとめる場合、予備データソース(Fallback)を設定すると便利です。</p>
                    </div>
                    <Button size="sm" variant="secondary" onClick={handleAddColumn}>+ カラム追加</Button>
                </div>
                
                <div className="bg-slate-50 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-700">
                            <tr>
                                <th className="px-3 py-2 text-left font-medium text-slate-500 w-10">#</th>
                                <th className="px-3 py-2 text-left font-medium text-slate-500">出力ヘッダー名</th>
                                <th className="px-3 py-2 text-left font-medium text-slate-500 w-1/4">内部データソース(優先)</th>
                                <th className="px-3 py-2 text-left font-medium text-slate-500 w-1/4">予備データソース (Fallback)</th>
                                <th className="px-3 py-2 text-left font-medium text-slate-500">固定値</th>
                                <th className="px-3 py-2 w-10"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                            {editColumns.map((col, idx) => (
                                <tr key={col.id}>
                                    <td className="px-3 py-2 text-slate-400">{idx + 1}</td>
                                    <td className="px-3 py-2">
                                        <input 
                                            type="text" 
                                            value={col.headerName} 
                                            onChange={(e) => updateColumn(col.id, { headerName: e.target.value })}
                                            className="w-full bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-600 rounded px-2 py-1"
                                            placeholder="例: size"
                                        />
                                    </td>
                                    <td className="px-3 py-2">
                                        <select 
                                            value={col.sourceField} 
                                            onChange={(e) => updateColumn(col.id, { sourceField: e.target.value })}
                                            className="w-full bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-600 rounded px-2 py-1"
                                        >
                                            {availableSourceFields.map(field => (
                                                <option key={field.value} value={field.value}>{field.label}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="px-3 py-2">
                                         <select 
                                            value={col.fallbackSourceField || ''} 
                                            onChange={(e) => updateColumn(col.id, { fallbackSourceField: e.target.value })}
                                            className="w-full bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-600 rounded px-2 py-1 text-slate-600 dark:text-slate-300"
                                        >
                                            <option value="">(なし)</option>
                                            {availableSourceFields.map(field => (
                                                <option key={field.value} value={field.value}>{field.label}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="px-3 py-2">
                                        <input 
                                            type="text" 
                                            value={col.defaultValue || ''} 
                                            onChange={(e) => updateColumn(col.id, { defaultValue: e.target.value })}
                                            className="w-full bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-600 rounded px-2 py-1"
                                            placeholder="固定値"
                                        />
                                    </td>
                                    <td className="px-3 py-2 text-center">
                                        <button onClick={() => removeColumn(col.id)} className="text-red-400 hover:text-red-600">×</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {editColumns.length === 0 && (
                        <div className="p-8 text-center text-slate-400">
                            カラムが設定されていません。「+ カラム追加」ボタンを押して設定を開始してください。
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    if (viewMode === 'EDIT') return renderEditor();

    return (
        <>
            {renderList()}
            
            {/* SKU Selection Modal - Now Bigger */}
            <Modal isOpen={isSelectionModalOpen} onClose={() => setIsSelectionModalOpen(false)} title={`出力対象SKU選択: ${targetChannel?.name}`} maxWidth="max-w-5xl">
                <div className="flex flex-col h-[75vh]">
                    
                    {/* Compact Filters Section */}
                    <div className="bg-slate-50 dark:bg-zinc-800/50 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800 mb-3 shrink-0">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2">
                            <Input 
                                value={filterText} 
                                onChange={(e) => setFilterText(e.target.value)} 
                                placeholder="検索..." 
                                className="col-span-1 md:col-span-2 text-xs"
                            />
                            <Select 
                                value={categoryFilter} 
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="h-9 py-1 text-xs"
                                containerClassName="text-xs"
                            >
                                <option value="">カテゴリ</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{getCategoryPath(c.id, categories)}</option>)}
                            </Select>
                            <Select 
                                value={attributeSetFilter} 
                                onChange={(e) => setAttributeSetFilter(e.target.value)}
                                className="h-9 py-1 text-xs"
                                containerClassName="text-xs"
                            >
                                <option value="">属性セット</option>
                                {attributeSets.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                            </Select>
                        </div>

                        {/* Attribute Filters Compact Row */}
                        <div className="flex gap-2 items-center">
                            <Select 
                                value={targetAttrId}
                                onChange={(e) => setTargetAttrId(e.target.value)}
                                className="flex-1 h-9 py-1 text-xs"
                                containerClassName="text-xs w-40"
                            >
                                <option value="">属性...</option>
                                {attributes.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                            </Select>
                            <Input 
                                value={targetAttrValue}
                                onChange={(e) => setTargetAttrValue(e.target.value)}
                                placeholder="値"
                                className="flex-1 text-xs h-9"
                            />
                            <Button size="sm" variant="secondary" onClick={handleAddAttributeFilter} disabled={!targetAttrId || !targetAttrValue} className="h-9 whitespace-nowrap">追加</Button>
                        </div>
                            
                        {attributeFilters.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-slate-200 dark:border-zinc-700">
                                {attributeFilters.map((filter, index) => (
                                    <Badge key={index} color="green" className="flex items-center gap-1 text-[10px]">
                                        {getAttributeName(filter.attributeId)}: {filter.value}
                                        <button onClick={() => handleRemoveAttributeFilter(index)} className="ml-1 text-emerald-700 hover:text-emerald-900">×</button>
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>

                    
                    <div className="flex items-center justify-between text-xs px-2 mb-1 shrink-0">
                        <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 dark:text-slate-300">
                            <input type="checkbox" onChange={toggleAllFiltered} checked={filteredSkus.length > 0 && filteredSkus.every(s => selectedSkuIds.has(s.id))} />
                            表示中の全件を選択 ({filteredSkus.length}件)
                        </label>
                        <span className="text-slate-500">選択中: <span className="font-bold text-blue-600">{selectedSkuIds.size}</span> 件</span>
                    </div>

                    <div className="flex-1 overflow-y-auto border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900">
                        <table className="w-full text-sm text-left relative">
                            <thead className="bg-slate-50 dark:bg-zinc-800 text-xs uppercase sticky top-0 z-10 shadow-sm">
                                <tr>
                                    <th className="px-4 py-2 w-10"></th>
                                    <th className="px-4 py-2 w-32">SKU ID</th>
                                    <th className="px-4 py-2">商品名</th>
                                    <th className="px-4 py-2 w-48">カテゴリ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                {paginatedSkus.map(sku => (
                                    <tr key={sku.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50 cursor-pointer" onClick={() => toggleSkuSelection(sku.id)}>
                                        <td className="px-4 py-2">
                                            <input 
                                                type="checkbox" 
                                                checked={selectedSkuIds.has(sku.id)} 
                                                onChange={() => {}} // handled by row click
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                        </td>
                                        <td className="px-4 py-2 font-mono text-xs">{sku.skuId}</td>
                                        <td className="px-4 py-2 text-sm">{sku.name}</td>
                                        <td className="px-4 py-2 text-xs text-slate-500 truncate max-w-xs">
                                            {sku.categoryIds.map(cId => getCategoryPath(cId, categories).split('>').pop()).join(', ')}
                                        </td>
                                    </tr>
                                ))}
                                {paginatedSkus.length === 0 && (
                                    <tr><td colSpan={4} className="text-center py-8 text-slate-400">該当するSKUがありません</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination & Footer Actions */}
                    <div className="pt-3 border-t dark:border-zinc-700 shrink-0 mt-auto flex flex-col md:flex-row gap-4 items-center justify-between">
                        {/* Pagination Controls */}
                        {filteredSkus.length > 0 && (
                            <div className="flex items-center gap-2 text-xs text-zinc-500">
                                <select 
                                    value={itemsPerPage}
                                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                                    className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 rounded py-1"
                                >
                                    <option value={10}>10件 / ページ</option>
                                    <option value={20}>20件 / ページ</option>
                                    <option value={50}>50件 / ページ</option>
                                </select>
                                
                                <div className="flex gap-1 items-center ml-2">
                                    <button 
                                        className="px-2 py-1 rounded bg-slate-100 dark:bg-zinc-800 disabled:opacity-50"
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                    >
                                        &larr;
                                    </button>
                                    <span className="font-medium mx-1">
                                        {currentPage} / {Math.max(1, totalPages)}
                                    </span>
                                    <button 
                                        className="px-2 py-1 rounded bg-slate-100 dark:bg-zinc-800 disabled:opacity-50"
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                    >
                                        &rarr;
                                    </button>
                                </div>
                                <span className="ml-1">
                                    (全{filteredSkus.length}件)
                                </span>
                            </div>
                        )}

                        <div className="flex gap-2 w-full md:w-auto justify-end">
                            <Button variant="secondary" onClick={() => setIsSelectionModalOpen(false)}>キャンセル</Button>
                            <Button onClick={handleExecuteExport} disabled={selectedSkuIds.size === 0}>
                                {selectedSkuIds.size}件をエクスポート
                            </Button>
                        </div>
                    </div>
                </div>
            </Modal>
        </>
    );
}
