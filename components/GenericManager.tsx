
import React, { useState, useMemo, useEffect } from 'react';
import Button from './ui/Button';
import Card from './ui/Card';
import Input from './ui/Input';
import Modal from './ui/Modal';
import { ICONS } from '../constants';
import type { Attribute, AttributeSet, Category, Series, Sku, Permission } from '../types';
import Badge from './ui/Badge';
import Select from './ui/Select';
import { getCategoryPath } from '../utils';
import { api } from '../api';
import { APP_CONFIG } from '../config';


type Item = Category | Series | AttributeSet | Attribute;

interface GenericManagerProps {
    title: string;
    items: Item[];
    onAdd: (item: any) => void;
    onDelete: (id: string) => void;
    onUpdateAttributeSet?: (setId: string, attributeIds: string[]) => void;
    onUpdateSeries?: (series: Series) => void;
    dataMap?: {
        categories: Category[];
        attributes: Attribute[];
        attributeSets: AttributeSet[];
        series: Series[];
    };
    userPermissions: Permission[];
}


const SeriesModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (series: Omit<Series, 'id' | 'childSkuIds'>) => void;
    dataMap: NonNullable<GenericManagerProps['dataMap']>;
    seriesToEdit?: Series;
}> = ({ isOpen, onClose, onSave, dataMap, seriesToEdit }) => {
    
    const [name, setName] = useState('');
    const [categoryIds, setCategoryIds] = useState<string[]>([]);
    const [attributeSetIds, setAttributeSetIds] = useState<string[]>([]);
    const [attributeValues, setAttributeValues] = useState<Record<string, string>>({});
    const [imageUrl, setImageUrl] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        if (seriesToEdit) {
            setName(seriesToEdit.name);
            setCategoryIds(seriesToEdit.categoryIds);
            setAttributeSetIds(seriesToEdit.attributeSetIds);
            setAttributeValues(seriesToEdit.attributeValues);
            setImageUrl(seriesToEdit.imageUrl || '');
        } else {
            setName('');
            setCategoryIds([]);
            setAttributeSetIds([]);
            setAttributeValues({});
            setImageUrl('');
        }
    }, [seriesToEdit, isOpen]);

    const relevantAttributes = useMemo(() => {
        if (!attributeSetIds.length) return [];
        const attrIds = new Set<string>();
        attributeSetIds.forEach(setId => {
            const set = dataMap.attributeSets.find(s => s.id === setId);
            set?.attributeIds.forEach(id => attrIds.add(id));
        });
        return Array.from(attrIds).map(id => dataMap.attributes.find(a => a.id === id)).filter(Boolean) as Attribute[];
    }, [attributeSetIds, dataMap.attributeSets, dataMap.attributes]);

    useEffect(() => {
        const newValues: Record<string, string> = { ...attributeValues };
    }, [relevantAttributes]);

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            
             if (APP_CONFIG.useMockData) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setImageUrl(reader.result as string);
                };
                reader.readAsDataURL(file);
                return;
            }

            setIsUploading(true);
            try {
                const url = await api.uploadImage(file);
                setImageUrl(url);
            } catch (err) {
                console.error("Upload failed", err);
                alert("画像のアップロードに失敗しました。");
            } finally {
                setIsUploading(false);
            }
        }
    };

    const handleSave = () => {
        if (name) {
            onSave({ 
                name, 
                categoryIds, 
                attributeSetIds, 
                attributeValues, 
                imageUrl: imageUrl || undefined 
            });
            onClose();
        }
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={seriesToEdit ? "シリーズを編集" : "新規シリーズを追加"}>
            <div className="space-y-4">
                <Input label="シリーズ名" value={name} onChange={(e) => setName(e.target.value)} required />
                
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">画像</label>
                    <div className="mt-1 flex items-center gap-4">
                        <span className="h-20 w-20 rounded-md overflow-hidden bg-slate-200 dark:bg-slate-700 relative">
                             {isUploading ? (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                                </div>
                            ) : imageUrl ? (
                                <img src={imageUrl} alt="プレビュー" className="h-full w-full object-cover" />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center text-slate-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                </div>
                            )}
                        </span>
                        <div className="flex-1">
                             <input 
                                type="file" 
                                accept="image/*" 
                                onChange={handleImageChange} 
                                disabled={isUploading}
                                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100 disabled:opacity-50" 
                            />
                        </div>
                    </div>
                </div>

                <Select label="カテゴリ" multiple value={categoryIds} onChange={(e) => setCategoryIds(Array.from(e.target.selectedOptions, (option: HTMLOptionElement) => option.value))}>
                     {dataMap.categories.map(c => <option key={c.id} value={c.id}>{getCategoryPath(c.id, dataMap.categories)}</option>)}
                </Select>
                <Select label="属性セット" multiple value={attributeSetIds} onChange={(e) => setAttributeSetIds(Array.from(e.target.selectedOptions, (option: HTMLOptionElement) => option.value))}>
                    {dataMap.attributeSets.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </Select>
                
                {relevantAttributes.length > 0 && (
                    <div className="space-y-3 pt-2 border-t dark:border-slate-600">
                        <h4 className="font-semibold">属性値</h4>
                        {relevantAttributes.map(attr => (
                            <Input
                                key={attr.id}
                                label={attr.name}
                                value={attributeValues[attr.id] || ''}
                                onChange={(e) => setAttributeValues(prev => ({ ...prev, [attr.id]: e.target.value }))}
                            />
                        ))}
                    </div>
                )}

                <div className="flex justify-end gap-2 pt-4">
                    <Button variant="secondary" onClick={onClose}>キャンセル</Button>
                    <Button onClick={handleSave} disabled={isUploading}>
                         {isUploading ? '処理中...' : '保存'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

const CategoryModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (category: { name: string; parentId?: string }) => void;
    categories: Category[];
}> = ({ isOpen, onClose, onSave, categories }) => {
    const [name, setName] = useState('');
    const [parentId, setParentId] = useState('');

    const handleSave = () => {
        if (name) {
            onSave({ name, parentId: parentId || undefined });
            setName('');
            setParentId('');
            onClose();
        }
    };

    const handleClose = () => {
        setName('');
        setParentId('');
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="新規カテゴリを追加">
            <div className="space-y-4">
                <Input label="カテゴリ名" value={name} onChange={(e) => setName(e.target.value)} required />
                <Select label="親カテゴリ (任意)" value={parentId} onChange={(e) => setParentId(e.target.value)}>
                    <option value="">(なし)</option>
                    {categories.map(c => (
                        <option key={c.id} value={c.id}>{getCategoryPath(c.id, categories)}</option>
                    ))}
                </Select>
                <div className="flex justify-end gap-2 pt-2">
                    <Button variant="secondary" onClick={handleClose}>キャンセル</Button>
                    <Button onClick={handleSave}>保存</Button>
                </div>
            </div>
        </Modal>
    );
}


const CategoryNode: React.FC<{
    category: Category;
    allCategories: Category[];
    onDelete: (id: string) => void;
    canDelete: boolean;
}> = ({ category, allCategories, onDelete, canDelete }) => {
    const children = allCategories.filter(c => c.parentId === category.id);
    
    return (
        <div className="mb-2">
            <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 hover:border-sky-300 dark:hover:border-sky-600 transition-colors">
                <span className="font-medium text-slate-800 dark:text-white flex items-center">
                    {children.length > 0 && (
                        <span className="mr-2 text-slate-400">
                             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                        </span>
                    )}
                    {category.name}
                </span>
                <div className="flex items-center gap-2">
                    {canDelete && (
                        <Button onClick={() => onDelete(category.id)} variant="danger" size="sm">
                            {ICONS.trash}
                        </Button>
                    )}
                </div>
            </div>
            {children.length > 0 && (
                <div className="ml-6 mt-2 pl-4 border-l-2 border-slate-300 dark:border-slate-600">
                    {children.map(child => (
                        <CategoryNode key={child.id} category={child} allCategories={allCategories} onDelete={onDelete} canDelete={canDelete} />
                    ))}
                </div>
            )}
        </div>
    );
};


interface AttributeFilter {
    attributeId: string;
    value: string;
}

export default function GenericManager({ title, items, onAdd, onDelete, onUpdateAttributeSet, onUpdateSeries, dataMap, userPermissions }: GenericManagerProps) {
    const [isItemModalOpen, setIsItemModalOpen] = useState(false);
    const [newItemName, setNewItemName] = useState('');

    const [isAttributeModalOpen, setIsAttributeModalOpen] = useState(false);
    const [editingSet, setEditingSet] = useState<AttributeSet | null>(null);
    const [editingSeries, setEditingSeries] = useState<Series | undefined>(undefined);
    
    // Filter State for Series
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [attributeFilters, setAttributeFilters] = useState<AttributeFilter[]>([]);
    const [targetAttrId, setTargetAttrId] = useState('');
    const [targetAttrValue, setTargetAttrValue] = useState('');

    // Permissions
    const canCreate = userPermissions.includes('MASTER_CREATE');
    const canEdit = userPermissions.includes('MASTER_EDIT');
    const canDelete = userPermissions.includes('MASTER_DELETE');

    const handleSaveItem = () => {
        if (newItemName.trim()) {
            onAdd({ name: newItemName });
            setNewItemName('');
            setIsItemModalOpen(false);
        }
    };

    const handleSaveSeries = (seriesData: Omit<Series, 'id' | 'childSkuIds'>) => {
        if (editingSeries && onUpdateSeries) {
            onUpdateSeries({ ...editingSeries, ...seriesData });
        } else {
            onAdd(seriesData);
        }
        setEditingSeries(undefined);
    };

    const openSeriesCreate = () => {
        setEditingSeries(undefined);
        setIsItemModalOpen(true);
    };

    const openSeriesEdit = (series: Series) => {
        setEditingSeries(series);
        setIsItemModalOpen(true);
    };

    const openAttributeModal = (set: AttributeSet) => {
        setEditingSet(set);
        setIsAttributeModalOpen(true);
    };

    const handleUpdateAttributeSet = (updatedIds: string[]) => {
        if (editingSet && onUpdateAttributeSet) {
            onUpdateAttributeSet(editingSet.id, updatedIds);
        }
        setIsAttributeModalOpen(false);
        setEditingSet(null);
    };

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
    
    const singularTitle = title === 'シリーズ' ? 'シリーズ' : (title.endsWith('s') ? title.slice(0, -1) : title);

    const renderSimpleList = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map(item => (
                <Card key={item.id} className="flex justify-between items-center">
                    <span className="font-semibold text-slate-800 dark:text-white">{item.name}</span>
                    {canDelete && (
                        <Button onClick={() => onDelete(item.id)} variant="danger" size="sm">
                            {ICONS.trash}
                        </Button>
                    )}
                </Card>
            ))}
        </div>
    );
    
    const renderCategoryTree = () => {
        const categories = items as Category[];
        const rootCategories = categories.filter(c => !c.parentId);
        
        return (
            <div className="space-y-2">
                {rootCategories.map(root => (
                    <CategoryNode key={root.id} category={root} allCategories={categories} onDelete={onDelete} canDelete={canDelete} />
                ))}
            </div>
        );
    };

    const renderAttributeSets = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map(item => {
                const set = item as AttributeSet;
                return (
                    <Card key={set.id} className="flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-2">
                                <span className="font-semibold text-lg text-slate-800 dark:text-white">{set.name}</span>
                                {canDelete && <Button onClick={() => onDelete(set.id)} variant="danger" size="sm">{ICONS.trash}</Button>}
                            </div>
                            <div className="space-y-2 mt-4">
                                <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400">属性:</h4>
                                {set.attributeIds.length > 0 ? (
                                    <div className="flex flex-wrap items-start gap-1">
                                        {set.attributeIds.map(attrId => (
                                            <Badge key={attrId} color="gray">{dataMap?.attributes.find(a => a.id === attrId)?.name}</Badge>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-slate-400 italic">属性がありません</p>
                                )}
                            </div>
                        </div>
                        {canEdit && (
                            <Button onClick={() => openAttributeModal(set)} variant="secondary" size="sm" className="w-full mt-4">
                                属性を編集
                            </Button>
                        )}
                    </Card>
                );
            })}
        </div>
    );
    
    const renderSeries = () => {
        let seriesItems = items as Series[];

        // Filter Logic for Series
        seriesItems = seriesItems.filter(series => {
            const nameMatch = series.name.toLowerCase().includes(searchTerm.toLowerCase());
            const categoryMatch = categoryFilter ? series.categoryIds.includes(categoryFilter) : true;
            
            if (!nameMatch || !categoryMatch) return false;

            if (attributeFilters.length > 0) {
                const matchesAttributes = attributeFilters.every(filter => {
                    const val = series.attributeValues[filter.attributeId] || '';
                    return val.toLowerCase().includes(filter.value.toLowerCase());
                });
                if (!matchesAttributes) return false;
            }
            return true;
        });

        const activeFilterCount = (categoryFilter ? 1 : 0) + attributeFilters.length;

        return(
            <div className="space-y-4">
                 {/* Compact Search & Filter Bar */}
                 <div className="bg-white dark:bg-zinc-900 p-2 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row gap-2">
                    <div className="relative flex-grow">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
                            {ICONS.search}
                        </span>
                        <input
                            type="text"
                            placeholder="シリーズ名で検索..."
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

                {/* Active Filter Chips */}
                {activeFilterCount > 0 && (
                    <div className="flex flex-wrap gap-2 items-center px-1">
                        <span className="text-xs font-bold text-zinc-400 uppercase mr-2">Active Filters:</span>
                        
                        {categoryFilter && (
                             <Badge color="blue" className="flex items-center gap-1 pr-1">
                                カテゴリ: {getCategoryPath(categoryFilter, dataMap?.categories || []).split('>').pop()}
                                <button onClick={() => setCategoryFilter('')} className="p-0.5 hover:bg-blue-200 rounded-full"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
                            </Badge>
                        )}

                        {attributeFilters.map((filter, index) => (
                            <Badge key={index} color="green" className="flex items-center gap-1 pr-1">
                                {dataMap?.attributes.find(a => a.id === filter.attributeId)?.name}: {filter.value}
                                <button onClick={() => handleRemoveAttributeFilter(index)} className="p-0.5 hover:bg-emerald-200 rounded-full"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
                            </Badge>
                        ))}

                        <button 
                            onClick={() => {
                                setCategoryFilter('');
                                setAttributeFilters([]);
                            }}
                            className="text-xs text-red-500 hover:text-red-700 hover:underline ml-2"
                        >
                            Clear All
                        </button>
                    </div>
                )}

                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden border border-zinc-200 dark:border-zinc-700">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                            <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-400 whitespace-nowrap">
                                <tr>
                                    <th scope="col" className="px-6 py-3">画像</th>
                                    <th scope="col" className="px-6 py-3">名前</th>
                                    <th scope="col" className="px-6 py-3">カテゴリ</th>
                                    <th scope="col" className="px-6 py-3">属性値</th>
                                    <th scope="col" className="px-6 py-3">操作</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-700">
                                {seriesItems.length === 0 ? (
                                    <tr><td colSpan={5} className="px-6 py-8 text-center">条件に一致するシリーズはありません</td></tr>
                                ) : (
                                    seriesItems.map(series => {
                                    const allAttributeIds = series.attributeSetIds.flatMap(setId => 
                                            dataMap?.attributeSets.find(as => as.id === setId)?.attributeIds || []
                                        );
                                        return (
                                            <tr key={series.id} className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {series.imageUrl ? (
                                                        <img src={series.imageUrl} alt={series.name} className="w-10 h-10 object-cover rounded-md border border-zinc-200 dark:border-zinc-700" />
                                                    ) : (
                                                        <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-md flex items-center justify-center text-slate-400">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">{series.name}</td>
                                                <td className="px-6 py-4 max-w-xs">
                                                    <div className="flex gap-1 overflow-x-auto no-scrollbar">
                                                        {series.categoryIds.map(id => <Badge key={id} className="whitespace-nowrap">{getCategoryPath(id, dataMap?.categories || [])}</Badge>)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 max-w-xs">
                                                    <div className="flex gap-1 overflow-x-auto no-scrollbar">
                                                        {allAttributeIds.map(attrId => (
                                                            <Badge key={attrId} color="green" className="whitespace-nowrap">
                                                                {dataMap?.attributes.find(a => a.id === attrId)?.name}: {series.attributeValues[attrId] || 'N/A'}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        {canEdit && <Button onClick={() => openSeriesEdit(series)} variant="secondary" size="sm">編集</Button>}
                                                        {canDelete && <Button onClick={() => onDelete(series.id)} variant="danger" size="sm">{ICONS.trash}</Button>}
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Filter Modal for Series */}
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
                                {dataMap?.categories.map(c => <option key={c.id} value={c.id}>{getCategoryPath(c.id, dataMap.categories)}</option>)}
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
                                    {dataMap?.attributes.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                </Select>
                                <input 
                                    type="text" 
                                    value={targetAttrValue}
                                    onChange={(e) => setTargetAttrValue(e.target.value)}
                                    placeholder="値を入力"
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
                                            {dataMap?.attributes.find(a => a.id === filter.attributeId)?.name}: {filter.value}
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
            </div>
        )
    };

    const renderContent = () => {
        if (title === '属性セット') return renderAttributeSets();
        if (title === 'シリーズ') return renderSeries();
        if (title === 'カテゴリ') return renderCategoryTree();
        return renderSimpleList();
    };

    const isSimpleManager = title === '属性';

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white">{title}</h1>
                {canCreate && (
                    <Button onClick={() => title === 'シリーズ' ? openSeriesCreate() : setIsItemModalOpen(true)}>
                        {ICONS.plus}
                        新規{singularTitle}を追加
                    </Button>
                )}
            </div>
            
            {(items.length > 0 || title === 'シリーズ') ? renderContent() : (
                <Card className="text-center py-10 text-slate-500 dark:text-slate-400">
                    {title}が見つかりません。
                </Card>
            )}

            {isSimpleManager && (
                <Modal isOpen={isItemModalOpen} onClose={() => setIsItemModalOpen(false)} title={`新規${singularTitle}を追加`}>
                    <div className="space-y-4">
                        <Input
                            label="名前"
                            value={newItemName}
                            onChange={(e) => setNewItemName(e.target.value)}
                            placeholder={`${singularTitle}名を入力`}
                        />
                        <div className="flex justify-end gap-2">
                            <Button variant="secondary" onClick={() => setIsItemModalOpen(false)}>キャンセル</Button>
                            <Button onClick={handleSaveItem}>保存</Button>
                        </div>
                    </div>
                </Modal>
            )}
            
            {title === 'シリーズ' && dataMap && (
                <SeriesModal 
                    isOpen={isItemModalOpen} 
                    onClose={() => setIsItemModalOpen(false)} 
                    onSave={handleSaveSeries} 
                    dataMap={dataMap} 
                    seriesToEdit={editingSeries}
                />
            )}
            
            {title === 'カテゴリ' && (
                <CategoryModal isOpen={isItemModalOpen} onClose={() => setIsItemModalOpen(false)} onSave={onAdd} categories={items as Category[]} />
            )}

            {title === '属性セット' && editingSet && (
                <Modal isOpen={isAttributeModalOpen} onClose={() => setIsAttributeModalOpen(false)} title={`「${editingSet.name}」の属性を編集`}>
                    <AttributeSetEditModalContent
                        set={editingSet}
                        allAttributes={dataMap?.attributes || []}
                        onSave={handleUpdateAttributeSet}
                        onClose={() => setIsAttributeModalOpen(false)}
                    />
                </Modal>
            )}
        </div>
    );
}

const AttributeSetEditModalContent: React.FC<{
    set: AttributeSet;
    allAttributes: Attribute[];
    onSave: (selectedIds: string[]) => void;
    onClose: () => void;
}> = ({ set, allAttributes, onSave, onClose }) => {
    const [selectedIds, setSelectedIds] = useState(set.attributeIds);

    const handleSave = () => {
        onSave(selectedIds);
    };

    return (
        <div className="space-y-4">
            <Select 
                label="利用可能な属性" 
                multiple 
                value={selectedIds} 
                onChange={(e) => setSelectedIds(Array.from(e.target.selectedOptions, (opt: HTMLOptionElement) => opt.value))}>
                {allAttributes.map(attr => (
                    <option key={attr.id} value={attr.id}>{attr.name}</option>
                ))}
            </Select>
            <div className="flex justify-end gap-2">
                <Button variant="secondary" onClick={onClose}>キャンセル</Button>
                <Button onClick={handleSave}>保存</Button>
            </div>
        </div>
    )
}
