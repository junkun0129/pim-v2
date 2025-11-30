import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Sku, Series, Category, Attribute, AttributeSet, Asset } from '../../types';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { getCategoryPath } from '../../utils';
import SkuModal from '../modals/SkuModal';
import { ICONS } from '../../constants';

interface SkuDetailViewProps {
    sku?: Sku;
    skus?: Sku[]; 
    dataMap: {
        series: Series[];
        categories: Category[];
        attributes: Attribute[];
        attributeSets: AttributeSet[];
    };
    onBack: () => void;
    onEdit?: (sku: Sku) => void;
}

export default function SkuDetailView({ sku: propSku, skus, dataMap, onBack, onEdit }: SkuDetailViewProps) {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const sku = propSku || (skus && id ? skus.find(s => s.id === id) : undefined);

    if (!sku) {
        return <div className="p-8 text-center">SKU not found</div>;
    }

    const series = sku.seriesId ? dataMap.series.find(s => s.id === sku.seriesId) : null;
    const imageUrl = sku.imageUrl || series?.imageUrl;
    const attributeSource = series || sku;
    const allAttributeIds = attributeSource.attributeSetIds.flatMap(setId => 
        dataMap.attributeSets.find(as => as.id === setId)?.attributeIds || []
    );
    const assets = sku.assets || [];

    const handleSaveEdit = (updatedData: Omit<Sku, 'id'>) => {
        if (onEdit) {
            onEdit({ ...sku, ...updatedData });
            setIsEditModalOpen(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                     <Button onClick={() => navigate('/skus')} variant="secondary">
                        &larr; Back to List
                    </Button>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-white">{sku.name}</h1>
                </div>
                {onEdit && <Button onClick={() => setIsEditModalOpen(true)}>Edit</Button>}
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        {imageUrl ? <img src={imageUrl} className="w-full h-auto object-cover rounded-lg aspect-square" /> : <div className="w-full bg-slate-200 aspect-square rounded flex items-center justify-center">No Image</div>}
                        <div className="mt-4 p-4 bg-sky-50 dark:bg-sky-900/20 rounded-lg text-center">
                            <p className="text-sm text-sky-600 dark:text-sky-300 font-medium">Price</p>
                            <p className="text-2xl font-bold text-sky-800 dark:text-sky-100">¥{sku.price?.toLocaleString()}</p>
                        </div>
                    </Card>
                </div>
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <h2 className="text-xl font-semibold mb-4">Details</h2>
                        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
                            <div><dt className="text-xs font-bold text-slate-400">Name</dt><dd>{sku.name}</dd></div>
                            <div><dt className="text-xs font-bold text-slate-400">SKU ID</dt><dd>{sku.skuId}</dd></div>
                            <div><dt className="text-xs font-bold text-slate-400">Barcode</dt><dd>{sku.barcode || '-'}</dd></div>
                            <div><dt className="text-xs font-bold text-slate-400">Series</dt><dd>{series?.name || '-'}</dd></div>
                        </dl>
                    </Card>
                    <Card>
                         <h2 className="text-xl font-semibold mb-4">Attributes</h2>
                         <div className="space-y-2">
                             {allAttributeIds.map(attrId => {
                                 const attr = dataMap.attributes.find(a => a.id === attrId);
                                 return (
                                    <div key={attrId} className="flex justify-between border-b pb-1">
                                        <span className="text-slate-500">{attr?.name}</span>
                                        <span className="font-medium">{attributeSource.attributeValues[attrId] || '-'}</span>
                                    </div>
                                 )
                             })}
                         </div>
                    </Card>
                </div>
            </div>

            {isEditModalOpen && onEdit && (
                <SkuModal 
                    isOpen={isEditModalOpen} 
                    onClose={() => setIsEditModalOpen(false)} 
                    onSave={handleSaveEdit} 
                    dataMap={dataMap} 
                    sku={sku}
                />
            )}
        </div>
    );
}