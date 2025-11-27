
import React, { useState, useMemo } from 'react';
import type { Sku, Branch, Inventory, Order, Series } from '../types';
import Card from './ui/Card';
import Button from './ui/Button';
import Badge from './ui/Badge';
import Modal from './ui/Modal';
import Input from './ui/Input';
import { ICONS } from '../constants';

interface OrderManagerProps {
    skus: Sku[];
    series: Series[];
    branches: Branch[];
    inventory: Inventory[];
    orders: Order[];
    onCreateOrder: (order: Omit<Order, 'id' | 'status' | 'orderDate'>) => void;
    currentBranchId: string;
    setCurrentBranchId: (id: string) => void;
}

export default function OrderManager({ 
    skus, 
    series,
    branches, 
    inventory, 
    orders, 
    onCreateOrder,
    currentBranchId,
    setCurrentBranchId
}: OrderManagerProps) {
    const [activeTab, setActiveTab] = useState<'INVENTORY' | 'HISTORY'>('INVENTORY');
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
    const [selectedSkuForOrder, setSelectedSkuForOrder] = useState<string | null>(null);
    const [orderQuantity, setOrderQuantity] = useState<number>(10);
    const [isBranchDropdownOpen, setIsBranchDropdownOpen] = useState(false);

    const currentBranch = branches.find(b => b.id === currentBranchId) || branches[0];

    // Combine Master SKU data with Local Inventory Data
    const branchInventoryDisplay = useMemo(() => {
        return skus.map(sku => {
            const stockRecord = inventory.find(inv => inv.skuId === sku.id && inv.branchId === currentBranchId);
            const parentSeries = series.find(s => s.id === sku.seriesId);
            const imageUrl = sku.imageUrl || parentSeries?.imageUrl;

            return {
                ...sku,
                imageUrl,
                quantity: stockRecord ? stockRecord.quantity : 0,
                lastUpdated: stockRecord ? stockRecord.lastUpdated : '-',
                status: stockRecord && stockRecord.quantity < 10 ? 'LOW' : 'OK'
            };
        });
    }, [skus, inventory, currentBranchId, series]);

    const branchOrders = useMemo(() => {
        return orders
            .filter(o => o.branchId === currentBranchId)
            .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
    }, [orders, currentBranchId]);

    const handleOpenOrderModal = (skuId: string) => {
        setSelectedSkuForOrder(skuId);
        setOrderQuantity(10);
        setIsOrderModalOpen(true);
    };

    const handleSubmitOrder = () => {
        if (selectedSkuForOrder && currentBranchId) {
            onCreateOrder({
                branchId: currentBranchId,
                skuId: selectedSkuForOrder,
                quantity: orderQuantity
            });
            setIsOrderModalOpen(false);
        }
    };

    const getSkuName = (id: string) => skus.find(s => s.id === id)?.name || id;

    const renderInventoryTab = () => (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-400">
                        <tr>
                            <th className="px-6 py-3">商品画像</th>
                            <th className="px-6 py-3">SKU名</th>
                            <th className="px-6 py-3">ID</th>
                            <th className="px-6 py-3 text-right">現在在庫</th>
                            <th className="px-6 py-3">ステータス</th>
                            <th className="px-6 py-3 text-center">アクション</th>
                        </tr>
                    </thead>
                    <tbody>
                        {branchInventoryDisplay.map((item) => (
                            <tr key={item.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600">
                                <td className="px-6 py-4">
                                     {item.imageUrl ? (
                                        <img src={item.imageUrl} alt={item.name} className="w-10 h-10 object-cover rounded-md" />
                                    ) : (
                                        <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-md flex items-center justify-center text-slate-400 text-xs">No Img</div>
                                    )}
                                </td>
                                <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                                    {item.name}
                                </td>
                                <td className="px-6 py-4">{item.skuId}</td>
                                <td className="px-6 py-4 text-right font-bold text-lg">
                                    {item.quantity}
                                </td>
                                <td className="px-6 py-4">
                                    {item.quantity === 0 ? (
                                        <Badge color="gray">在庫なし</Badge>
                                    ) : item.status === 'LOW' ? (
                                        <Badge color="red" className="bg-red-100 text-red-800">残りわずか</Badge>
                                    ) : (
                                        <Badge color="green">在庫あり</Badge>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <Button size="sm" onClick={() => handleOpenOrderModal(item.id)}>
                                        <span className="flex items-center">
                                            {ICONS.clipboard}
                                            <span className="ml-1">発注</span>
                                        </span>
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderOrdersTab = () => (
        <div className="space-y-4">
            {branchOrders.length === 0 ? (
                <div className="text-center py-10 text-slate-500">発注履歴がありません。</div>
            ) : (
                branchOrders.map(order => {
                    const sku = skus.find(s => s.id === order.skuId);
                    const statusColor = {
                        PENDING: 'bg-yellow-100 text-yellow-800',
                        APPROVED: 'bg-blue-100 text-blue-800',
                        SHIPPED: 'bg-purple-100 text-purple-800',
                        RECEIVED: 'bg-green-100 text-green-800',
                        CANCELLED: 'bg-red-100 text-red-800',
                    }[order.status];
                    
                    const statusLabel = {
                        PENDING: '承認待ち',
                        APPROVED: '承認済み',
                        SHIPPED: '配送中',
                        RECEIVED: '受取完了',
                        CANCELLED: 'キャンセル',
                    }[order.status];

                    return (
                        <Card key={order.id} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-full ${statusColor}`}>
                                    {ICONS.truck}
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">{order.orderDate}</p>
                                    <h4 className="font-bold text-slate-800 dark:text-white text-lg">
                                        {sku?.name || '不明なSKU'}
                                    </h4>
                                    <p className="text-sm text-slate-600 dark:text-slate-300">
                                        注文数: <span className="font-bold">{order.quantity}</span> 個
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColor}`}>
                                    {statusLabel}
                                </span>
                                <div className="text-right text-xs text-slate-400">
                                    ORDER ID: {order.id}
                                </div>
                            </div>
                        </Card>
                    );
                })
            )}
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header / Branch Selector */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-4 rounded-lg shadow">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        {ICONS.shop}
                        店舗在庫・発注管理
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        現在、<span className="font-bold text-sky-600">{currentBranch?.name}</span> ({currentBranch?.location}) として操作中
                    </p>
                </div>
                
                {/* Custom Dropdown Branch Selector */}
                <div className="relative z-20">
                    <button
                        onClick={() => setIsBranchDropdownOpen(!isBranchDropdownOpen)}
                        className="flex items-center gap-3 px-5 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600 transition-all group"
                    >
                         <span className="text-xs font-medium text-slate-400 dark:text-slate-400 uppercase tracking-wide">店舗切替</span>
                         <span className="h-4 w-px bg-slate-300 dark:bg-slate-600"></span>
                         <span className="font-bold text-slate-700 dark:text-white">{currentBranch?.name}</span>
                         <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-slate-400 transition-transform duration-200 ${isBranchDropdownOpen ? 'rotate-180' : ''}`}><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </button>
                    
                    {isBranchDropdownOpen && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setIsBranchDropdownOpen(false)}></div>
                            <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-100 dark:border-slate-700 z-20 overflow-hidden ring-1 ring-black/5 animate-fade-in-up">
                                <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-sm">
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">利用可能な店舗一覧</p>
                                </div>
                                <ul className="max-h-80 overflow-y-auto py-2">
                                    {branches.map(branch => (
                                        <li key={branch.id}>
                                            <button
                                                onClick={() => {
                                                    setCurrentBranchId(branch.id);
                                                    setIsBranchDropdownOpen(false);
                                                }}
                                                className={`w-full text-left px-5 py-3 flex items-start gap-4 transition-all duration-200 border-l-4 ${
                                                    currentBranchId === branch.id 
                                                    ? 'bg-sky-50 dark:bg-sky-900/20 border-sky-500' 
                                                    : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-700/50'
                                                }`}
                                            >
                                                <div className={`mt-0.5 p-2 rounded-lg ${currentBranchId === branch.id ? 'bg-sky-100 text-sky-600 dark:bg-sky-800 dark:text-sky-200' : 'bg-slate-100 text-slate-400 dark:bg-slate-700 dark:text-slate-500'}`}>
                                                    {ICONS.shop}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between">
                                                        <p className={`text-sm font-bold ${currentBranchId === branch.id ? 'text-sky-700 dark:text-sky-400' : 'text-slate-700 dark:text-slate-200'}`}>{branch.name}</p>
                                                        {currentBranchId === branch.id && (
                                                            <span className="text-sky-600 dark:text-sky-400">
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                                                        {branch.location}
                                                    </p>
                                                </div>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-700">
                <button
                    className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${
                        activeTab === 'INVENTORY'
                            ? 'border-sky-600 text-sky-600 dark:text-sky-400'
                            : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                    }`}
                    onClick={() => setActiveTab('INVENTORY')}
                >
                    在庫一覧 ({branchInventoryDisplay.length})
                </button>
                <button
                    className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${
                        activeTab === 'HISTORY'
                            ? 'border-sky-600 text-sky-600 dark:text-sky-400'
                            : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                    }`}
                    onClick={() => setActiveTab('HISTORY')}
                >
                    発注履歴 ({branchOrders.length})
                </button>
            </div>

            {/* Content */}
            {activeTab === 'INVENTORY' ? renderInventoryTab() : renderOrdersTab()}

            {/* Order Modal */}
            <Modal 
                isOpen={isOrderModalOpen} 
                onClose={() => setIsOrderModalOpen(false)} 
                title="発注依頼"
            >
                <div className="space-y-4">
                    <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-md mb-4">
                        <p className="text-sm text-slate-500 dark:text-slate-400">対象商品</p>
                        <p className="text-lg font-bold text-slate-800 dark:text-white">
                            {selectedSkuForOrder ? getSkuName(selectedSkuForOrder) : ''}
                        </p>
                    </div>

                    <Input 
                        label="発注数量" 
                        type="number" 
                        min="1"
                        value={orderQuantity}
                        onChange={(e) => setOrderQuantity(parseInt(e.target.value) || 0)}
                    />

                    <p className="text-sm text-slate-500">
                        ※ 発注は本部承認後に配送手配されます。通常2-3営業日で到着します。
                    </p>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button variant="secondary" onClick={() => setIsOrderModalOpen(false)}>キャンセル</Button>
                        <Button onClick={handleSubmitOrder}>発注確定</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
