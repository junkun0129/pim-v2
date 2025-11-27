
import React, { useState, useMemo, useEffect } from 'react';
import Button from './ui/Button';
import Card from './ui/Card';
import Input from './ui/Input';
import Modal from './ui/Modal';
import { ICONS } from '../constants';
import type { Attribute, AttributeSet, Category, Series, Sku } from '../types';
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

    // Ensure attribute values keys exist when sets change, but preserve existing values
    useEffect(() => {
        const newValues: Record<string, string> = { ...attributeValues };
        // relevantAttributes.forEach(attr => {
        //     if (newValues[attr.id] === undefined) {
        //         newValues[attr.id] = '';
        //     }
        // });
        // setAttributeValues(newValues);
    }, [relevantAttributes]);

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            
             // Mock mode fallback
             if (APP_CONFIG.useMockData) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setImageUrl(reader.result as string);
                };
                reader.readAsDataURL(file);
                return;
            }

            // Real API Upload
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
}> = ({ category, allCategories, onDelete }) => {
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
                    <Button onClick={() => onDelete(category.id)} variant="danger" size="sm">
                        {ICONS.trash}
                    </Button>
                </div>
            </div>
            {children.length > 0 && (
                <div className="ml-6 mt-2 pl-4 border-l-2 border-slate-300 dark:border-slate-600">
                    {children.map(child => (
                        <CategoryNode key={child.id} category={child} allCategories={allCategories} onDelete={onDelete} />
                    ))}
                </div>
            )}
        </div>
    );
};


export default function GenericManager({ title, items, onAdd, onDelete, onUpdateAttributeSet, onUpdateSeries, dataMap }: GenericManagerProps) {
    const [isItemModalOpen, setIsItemModalOpen] = useState(false);
    const [newItemName, setNewItemName] = useState('');

    const [isAttributeModalOpen, setIsAttributeModalOpen] = useState(false);
    const [editingSet, setEditingSet] = useState<AttributeSet | null>(null);
    const [editingSeries, setEditingSeries] = useState<Series | undefined>(undefined);

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
    
    const singularTitle = title === 'シリーズ' ? 'シリーズ' : (title.endsWith('s') ? title.slice(0, -1) : title);

    const renderSimpleList = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map(item => (
                <Card key={item.id} className="flex justify-between items-center">
                    <span className="font-semibold text-slate-800 dark:text-white">{item.name}</span>
                    <Button onClick={() => onDelete(item.id)} variant="danger" size="sm">
                        {ICONS.trash}
                    </Button>
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
                    <CategoryNode key={root.id} category={root} allCategories={categories} onDelete={onDelete} />
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
                                <Button onClick={() => onDelete(set.id)} variant="danger" size="sm">{ICONS.trash}</Button>
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
                        <Button onClick={() => openAttributeModal(set)} variant="secondary" size="sm" className="w-full mt-4">
                            属性を編集
                        </Button>
                    </Card>
                );
            })}
        </div>
    );
    
    const renderSeries = () => {
        const seriesItems = items as Series[];
        return(
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden">
             <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">画像</th>
                            <th scope="col" className="px-6 py-3">名前</th>
                            <th scope="col" className="px-6 py-3">カテゴリ</th>
                            <th scope="col" className="px-6 py-3">属性値</th>
                            <th scope="col" className="px-6 py-3">操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        {seriesItems.map(series => {
                           const allAttributeIds = series.attributeSetIds.flatMap(setId => 
                                dataMap?.attributeSets.find(as => as.id === setId)?.attributeIds || []
                            );
                            return (
                                <tr key={series.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600">
                                    <td className="px-6 py-4">
                                        {series.imageUrl ? (
                                            <img src={series.imageUrl} alt={series.name} className="w-12 h-12 object-cover rounded-md" />
                                        ) : (
                                            <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-md flex items-center justify-center text-slate-400">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{series.name}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {series.categoryIds.map(id => <Badge key={id}>{getCategoryPath(id, dataMap?.categories || [])}</Badge>)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {allAttributeIds.map(attrId => (
                                                <Badge key={attrId} color="green">
                                                    {dataMap?.attributes.find(a => a.id === attrId)?.name}: {series.attributeValues[attrId] || 'N/A'}
                                                </Badge>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <Button onClick={() => openSeriesEdit(series)} variant="secondary" size="sm">編集</Button>
                                            <Button onClick={() => onDelete(series.id)} variant="danger" size="sm">{ICONS.trash}</Button>
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
             </div>
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
                <Button onClick={() => title === 'シリーズ' ? openSeriesCreate() : setIsItemModalOpen(true)}>
                    {ICONS.plus}
                    新規{singularTitle}を追加
                </Button>
            </div>
            
            {items.length > 0 ? renderContent() : (
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
