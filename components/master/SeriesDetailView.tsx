import React, { useState } from 'react';
import type { Sku, Series, Category, Attribute, AttributeSet, Asset } from '../../types';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { getCategoryPath } from '../../utils';
import { ICONS } from '../../constants';
import SkuModal from '../modals/SkuModal';

interface SeriesDetailViewProps {
    series: Series;
    childSkus: Sku[];
    dataMap: {
        categories: Category[];
        attributes: Attribute[];
        attributeSets: AttributeSet[];
    };
    onBack: () => void;
    onEdit?: (series: Series) => void;
    onViewSku: (skuId: string) => void;
    onAddSku?: (sku: Omit<Sku, 'id'>) => void;
}

export default function SeriesDetailView({ series, childSkus, dataMap, onBack, onEdit, onViewSku, onAddSku }: SeriesDetailViewProps) {
    return (
        <div className="space-y-6">
            <div className="flex justify-between">
                <div className="flex gap-4 items-center">
                    <Button onClick={onBack} variant="secondary">&larr; Back</Button>
                    <h1 className="text-3xl font-bold">{series.name}</h1>
                </div>
                {onEdit && <Button onClick={() => onEdit(series)}>Edit</Button>}
            </div>
            <Card>
                <h2 className="text-xl font-bold mb-4">SKUs</h2>
                <div className="space-y-2">
                    {childSkus.map(sku => (
                        <div key={sku.id} className="flex justify-between p-2 hover:bg-slate-50 cursor-pointer" onClick={() => onViewSku(sku.id)}>
                            <span>{sku.name}</span>
                            <span>{sku.skuId}</span>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
}