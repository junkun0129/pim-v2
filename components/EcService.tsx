
import React, { useState } from 'react';
import type { Sku, Series, Inventory, CustomerOrder, Branch } from '../types';
import Card from './ui/Card';
import Button from './ui/Button';
import Badge from './ui/Badge';
import { ICONS } from '../constants';

interface EcServiceProps {
    skus: Sku[];
    series: Series[];
    inventory: Inventory[];
    ecBranch: Branch | undefined;
    customerOrders: CustomerOrder[];
    onPlaceOrder: (skuId: string, quantity: number) => void;
}

export default function EcService({ skus, series, inventory, ecBranch, customerOrders, onPlaceOrder }: EcServiceProps) {
    const [viewMode, setViewMode] = useState<'STORE' | 'ADMIN'>('STORE');

    if (!ecBranch) {
        return (
            <div className="p-8 text-center text-red-500">
                <h2 className="text-xl font-bold">EC設定エラー</h2>
                <p>ECタイプの店舗が見つかりません。店舗設定を確認してください。</p>
            </div>
        );
    }

    // --- Storefront Logic ---
    const storeItems = skus.map(sku => {
        const stock = inventory.find(i => i.skuId === sku.id && i.branchId === ecBranch.id);
        const parentSeries = series.find(s => s.id === sku.seriesId);
        return {
            ...sku,
            imageUrl: sku.imageUrl || parentSeries?.imageUrl,
            stockQuantity: stock ? stock.quantity : 0,
        };
    });

    // --- Render Functions ---

    const renderStorefront = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {storeItems.map(item => (
                <Card key={item.id} className="flex flex-col h-full overflow-hidden !p-0">
                    <div className="aspect-square w-full bg-slate-200 dark:bg-slate-700 relative">
                        {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                                No Image
                            </div>
                        )}
                        {item.stockQuantity === 0 && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <span className="text-white font-bold text-lg border-2 border-white px-4 py-1">SOLD OUT</span>
                            </div>
                        )}
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                        <div className="flex-1">
                            <h3 className="font-bold text-slate-900 dark:text-white mb-1 line-clamp-2">{item.name}</h3>
                            <p className="text-xs text-slate-500 mb-2">{item.skuId}</p>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-lg font-bold text-sky-600">
                                    {item.price ? `¥${item.price.toLocaleString()}` : '価格未定'}
                                </span>
                                <span className={`text-xs px-2 py-1 rounded-full ${item.stockQuantity > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    在庫: {item.stockQuantity}
                                </span>
                            </div>
                        </div>
                        <Button 
                            className="w-full mt-4" 
                            onClick={() => onPlaceOrder(item.id, 1)}
                            disabled={item.stockQuantity === 0 || !item.price}
                        >
                            {item.stockQuantity > 0 ? 'カートに入れる / 購入' : '売り切れ'}
                        </Button>
                    </div>
                </Card>
            ))}
        </div>
    );

    const renderAdmin = () => (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden">
             <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 dark:text-white">受注一覧 (発送元: {ecBranch.name})</h3>
                <div className="text-sm text-slate-500">合計件数: {customerOrders.length}件</div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-400">
                        <tr>
                            <th className="px-6 py-3">受注ID</th>
                            <th className="px-6 py-3">注文日時</th>
                            <th className="px-6 py-3">顧客名</th>
                            <th className="px-6 py-3">商品</th>
                            <th className="px-6 py-3 text-right">数量</th>
                            <th className="px-6 py-3 text-right">合計金額</th>
                            <th className="px-6 py-3 text-center">ステータス</th>
                        </tr>
                    </thead>
                    <tbody>
                        {customerOrders.length === 0 ? (
                            <tr><td colSpan={7} className="px-6 py-8 text-center">注文はまだありません</td></tr>
                        ) : (
                            customerOrders.map(order => {
                                const sku = skus.find(s => s.id === order.skuId);
                                return (
                                    <tr key={order.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700">
                                        <td className="px-6 py-4 font-mono text-xs">{order.id}</td>
                                        <td className="px-6 py-4">{order.orderDate}</td>
                                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{order.customerName}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="ml-2">
                                                    <div className="text-slate-900 dark:text-white">{sku?.name || order.skuId}</div>
                                                    <div className="text-xs text-slate-400">{sku?.skuId}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">{order.quantity}</td>
                                        <td className="px-6 py-4 text-right font-medium">¥{order.totalPrice.toLocaleString()}</td>
                                        <td className="px-6 py-4 text-center">
                                            <Badge color={order.status === 'SHIPPED' ? 'blue' : order.status === 'DELIVERED' ? 'green' : 'gray'}>
                                                {order.status}
                                            </Badge>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        {ICONS.globe}
                        ECサービス
                    </h1>
                    <p className="text-sm text-slate-500">オンラインストアの管理と販売シミュレーション</p>
                </div>
                <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-lg">
                    <button
                        onClick={() => setViewMode('STORE')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                            viewMode === 'STORE'
                                ? 'bg-white dark:bg-slate-600 text-sky-600 dark:text-sky-300 shadow-sm'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                        }`}
                    >
                        ストア (顧客ビュー)
                    </button>
                    <button
                        onClick={() => setViewMode('ADMIN')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                            viewMode === 'ADMIN'
                                ? 'bg-white dark:bg-slate-600 text-sky-600 dark:text-sky-300 shadow-sm'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                        }`}
                    >
                        管理画面 (受注)
                    </button>
                </div>
            </div>

            {viewMode === 'STORE' ? renderStorefront() : renderAdmin()}
        </div>
    );
}