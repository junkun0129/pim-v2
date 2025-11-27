import React, { useState, useMemo, useEffect } from 'react';
import type { Sku, Series, Category, AttributeSet, ViewType, Attribute, Branch, Inventory, Order, CustomerOrder } from './types';
import Sidebar from './components/Sidebar';
import SkuView from './components/SkuView';
import GenericManager from './components/GenericManager';
import SkuDetailView from './components/SkuDetailView';
import OrderManager from './components/OrderManager';
import EcService from './components/EcService';
import CreativeStudio from './components/CreativeStudio';
import { MOCK_SKUS, MOCK_SERIES, MOCK_CATEGORIES, MOCK_ATTRIBUTES, MOCK_ATTRIBUTE_SETS, MOCK_BRANCHES, MOCK_INVENTORY, MOCK_ORDERS, MOCK_CUSTOMER_ORDERS } from './mockData';
import { APP_CONFIG } from './config';
import { api } from './api';
import { ToastContainer, ToastMessage, ToastType } from './components/ui/Toast';

export default function App() {
    // Start with empty state or mock data based on config
    const [skus, setSkus] = useState<Sku[]>([]);
    const [series, setSeries] = useState<Series[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [attributes, setAttributes] = useState<Attribute[]>([]);
    const [attributeSets, setAttributeSets] = useState<AttributeSet[]>([]);
    
    // New OMS State (Purely Mock/Local for now)
    const [branches, setBranches] = useState<Branch[]>([]);
    const [inventory, setInventory] = useState<Inventory[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [customerOrders, setCustomerOrders] = useState<CustomerOrder[]>([]);
    const [currentBranchId, setCurrentBranchId] = useState<string>('br1');

    const [activeView, setActiveView] = useState<ViewType>('SKUs');
    const [selectedSkuId, setSelectedSkuId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    // New loading state for Save/Delete actions
    const [isMutating, setIsMutating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // Toast State
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const addToast = (type: ToastType, message: string) => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts(prev => [...prev, { id, type, message }]);
    };

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    // Initial Data Fetch
    useEffect(() => {
        const loadData = async () => {
            // Always load OMS mock data since it's a new feature not in API yet
            setBranches(MOCK_BRANCHES);
            setInventory(MOCK_INVENTORY);
            setOrders(MOCK_ORDERS);
            setCustomerOrders(MOCK_CUSTOMER_ORDERS);

            if (APP_CONFIG.useMockData) {
                setSkus(MOCK_SKUS);
                setSeries(MOCK_SERIES);
                setCategories(MOCK_CATEGORIES);
                setAttributes(MOCK_ATTRIBUTES);
                setAttributeSets(MOCK_ATTRIBUTE_SETS);
            } else {
                setIsLoading(true);
                try {
                    const data = await api.fetchAllData();
                    setSkus(data.skus || []);
                    setSeries(data.series || []);
                    setCategories(data.categories || []);
                    setAttributes(data.attributes || []);
                    setAttributeSets(data.attributeSets || []);
                } catch (err: any) {
                    console.error("Failed to fetch data", err);
                    setError(err.message || "データの読み込みに失敗しました。");
                } finally {
                    setIsLoading(false);
                }
            }
        };
        loadData();
    }, []);

    const dataMap = useMemo(() => ({
        categories,
        attributeSets,
        attributes,
        series,
    }), [categories, attributeSets, attributes, series]);

    // --- Helpers to update state after API call or Mock action ---
    
    const wrapMutation = async (action: () => Promise<void>, successMessage: string) => {
        setIsMutating(true);
        try {
            await action();
            addToast('success', successMessage);
        } catch (err: any) {
            console.error(err);
            addToast('error', err.message || '操作に失敗しました');
        } finally {
            setIsMutating(false);
        }
    };

    const addSku = async (sku: Omit<Sku, 'id'>) => {
        await wrapMutation(async () => {
            let newSku: Sku;
            if (APP_CONFIG.useMockData) {
                newSku = { ...sku, id: `sku${Date.now()}` };
            } else {
                newSku = await api.createSku(sku);
            }
            
            setSkus(prev => [...prev, newSku]);
            
            if (newSku.seriesId) {
                setSeries(prev => prev.map(s => s.id === newSku.seriesId ? { ...s, childSkuIds: [...s.childSkuIds, newSku.id] } : s));
            }
        }, 'SKUを追加しました');
    };
    
    const addSeries = async (item: Omit<Series, 'id'|'childSkuIds'>) => {
        await wrapMutation(async () => {
            let newSeries: Series;
            if (APP_CONFIG.useMockData) {
                newSeries = { ...item, id: `ser${Date.now()}`, childSkuIds:[] };
            } else {
                newSeries = await api.createSeries(item);
            }
            setSeries(prev => [...prev, newSeries]);
        }, 'シリーズを追加しました');
    };
    
    const addCategory = async (item: { name: string; parentId?: string }) => {
        await wrapMutation(async () => {
            let newCategory: Category;
            if (APP_CONFIG.useMockData) {
                newCategory = { ...item, id: `cat${Date.now()}` };
            } else {
                newCategory = await api.createCategory(item);
            }
            setCategories(prev => [...prev, newCategory]);
        }, 'カテゴリを追加しました');
    };
    
    const addAttribute = async (item: { name: string }) => {
        await wrapMutation(async () => {
            let newAttr: Attribute;
            if (APP_CONFIG.useMockData) {
                newAttr = { ...item, id: `attr${Date.now()}` };
            } else {
                newAttr = await api.createAttribute(item);
            }
            setAttributes(prev => [...prev, newAttr]);
        }, '属性を追加しました');
    };

    const addAttributeSet = async (item: { name: string }) => {
         await wrapMutation(async () => {
            let newSet: AttributeSet;
            if (APP_CONFIG.useMockData) {
                newSet = { ...item, id: `as${Date.now()}`, attributeIds: [] };
            } else {
                newSet = await api.createAttributeSet(item);
            }
            setAttributeSets(prev => [...prev, newSet]);
        }, '属性セットを追加しました');
    };
    
    const deleteSku = async (id: string) => {
        if (!window.confirm('本当にこのSKUを削除しますか？')) return;
        await wrapMutation(async () => {
            if (!APP_CONFIG.useMockData) await api.deleteSku(id);
            setSkus(prev => prev.filter(s => s.id !== id));
        }, 'SKUを削除しました');
    };

    const deleteSeries = async (id: string) => {
        if (!window.confirm('本当にこのシリーズを削除しますか？')) return;
        await wrapMutation(async () => {
            if (!APP_CONFIG.useMockData) await api.deleteSeries(id);
            setSeries(prev => prev.filter(s => s.id !== id));
        }, 'シリーズを削除しました');
    };
    
    const deleteCategory = async (id: string) => {
        if (!window.confirm('このカテゴリを削除しますか？サブカテゴリもすべて削除されます。')) return;
        
        await wrapMutation(async () => {
            // Find all categories to delete (self + descendants)
            const idsToDelete = new Set<string>([id]);
            let currentLayer = [id];
            
            // Breadth-first search for descendants in local state
            while(currentLayer.length > 0) {
                const nextLayer: string[] = [];
                categories.forEach(c => {
                    if (c.parentId && currentLayer.includes(c.parentId)) {
                        idsToDelete.add(c.id);
                        nextLayer.push(c.id);
                    }
                });
                currentLayer = nextLayer;
            }

            if (!APP_CONFIG.useMockData) {
                const deletePromises = Array.from(idsToDelete).map(catId => api.deleteCategory(catId));
                await Promise.all(deletePromises);
            }
            
            setCategories(prev => prev.filter(c => !idsToDelete.has(c.id)));
        }, 'カテゴリとサブカテゴリを削除しました');
    };
    
    const deleteAttribute = async (id: string) => {
        if (!window.confirm('この属性を削除しますか？')) return;
        await wrapMutation(async () => {
            if (!APP_CONFIG.useMockData) await api.deleteAttribute(id);
            setAttributes(prev => prev.filter(a => a.id !== id));
        }, '属性を削除しました');
    };

    const deleteAttributeSet = async (id: string) => {
        if (!window.confirm('この属性セットを削除しますか？')) return;
        await wrapMutation(async () => {
            if (!APP_CONFIG.useMockData) await api.deleteAttributeSet(id);
            setAttributeSets(prev => prev.filter(a => a.id !== id));
        }, '属性セットを削除しました');
    };

    const updateAttributeSet = async (setId: string, attributeIds: string[]) => {
        await wrapMutation(async () => {
            if (!APP_CONFIG.useMockData) await api.updateAttributeSet(setId, attributeIds);
            setAttributeSets(prev => prev.map(set => 
                set.id === setId ? { ...set, attributeIds } : set
            ));
        }, '属性セットを更新しました');
    };
    
    const updateSeries = async (seriesToUpdate: Series) => {
        await wrapMutation(async () => {
            if (!APP_CONFIG.useMockData) await api.updateSeries(seriesToUpdate);
            setSeries(prev => prev.map(s => s.id === seriesToUpdate.id ? seriesToUpdate : s));
        }, 'シリーズを更新しました');
    };

    // --- OMS Actions ---
    const createOrder = (orderData: Omit<Order, 'id' | 'status' | 'orderDate'>) => {
        // This is a mock action for now
        const newOrder: Order = {
            id: `ord-${Date.now()}`,
            ...orderData,
            status: 'PENDING',
            orderDate: new Date().toISOString().split('T')[0]
        };
        setOrders(prev => [newOrder, ...prev]);
        addToast('success', '発注依頼を送信しました');
    };

    // --- EC Actions ---
    const handlePlaceEcOrder = (skuId: string, quantity: number) => {
        // 1. Find EC Branch
        const ecBranch = branches.find(b => b.type === 'EC');
        if (!ecBranch) {
            addToast('error', 'EC店舗設定が見つかりません');
            return;
        }

        // 2. Check Inventory
        const targetInventory = inventory.find(i => i.skuId === skuId && i.branchId === ecBranch.id);
        if (!targetInventory || targetInventory.quantity < quantity) {
            addToast('error', '在庫が不足しています');
            return;
        }

        // 3. Deduct Inventory (Mock Update)
        setInventory(prev => prev.map(i => {
            if (i.skuId === skuId && i.branchId === ecBranch.id) {
                return { ...i, quantity: i.quantity - quantity };
            }
            return i;
        }));

        // 4. Create Customer Order
        const sku = skus.find(s => s.id === skuId);
        const newCustomerOrder: CustomerOrder = {
            id: `co-${Date.now()}`,
            customerName: 'ゲスト購入者',
            skuId,
            quantity,
            totalPrice: (sku?.price || 0) * quantity,
            orderDate: new Date().toLocaleString(),
            status: 'PROCESSING'
        };

        setCustomerOrders(prev => [newCustomerOrder, ...prev]);
        addToast('success', '購入が完了しました！');
    };

    // --- Creative Studio Actions ---
    const handleSaveAsset = async (skuId: string, assetName: string, assetDataUrl: string) => {
        // In a real app, you would upload the assetDataUrl (blob) to S3 here
        // For now, we store the Data URL directly
        
        const newAsset = {
            id: `asset-${Date.now()}`,
            type: 'DESIGN' as const,
            name: assetName,
            url: assetDataUrl,
            createdAt: new Date().toISOString()
        };

        setSkus(prev => prev.map(s => {
            if (s.id === skuId) {
                return { ...s, assets: [...(s.assets || []), newAsset] };
            }
            return s;
        }));

        addToast('success', 'デザインを保存しました');
    };

    const handleViewSku = (skuId: string) => {
        setSelectedSkuId(skuId);
        setActiveView('SKU_DETAIL');
    };
    
    const handleBackToSkus = () => {
        setSelectedSkuId(null);
        setActiveView('SKUs');
    };

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex h-full items-center justify-center">
                    <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-900 mb-4"></div>
                        <p className="text-zinc-500 font-medium">Loading data...</p>
                    </div>
                </div>
            );
        }
        
        if (error) {
            return (
                <div className="flex h-full items-center justify-center text-red-600">
                    <div className="text-center p-8 bg-white dark:bg-zinc-800 rounded-xl shadow-xl max-w-lg border border-red-100">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        <p className="text-xl font-bold mb-2">Error Occurred</p>
                        <p className="mb-6 text-zinc-600 dark:text-zinc-300">{error}</p>
                        <button onClick={() => window.location.reload()} className="px-5 py-2.5 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors shadow-lg">Reload Page</button>
                    </div>
                </div>
            )
        }

        switch (activeView) {
            case 'SKUs':
                return <SkuView skus={skus} dataMap={dataMap} addSku={addSku} deleteSku={deleteSku} onViewSku={handleViewSku} />;
            case 'SKU_DETAIL': {
                const selectedSku = skus.find(s => s.id === selectedSkuId);
                if (!selectedSku) {
                    handleBackToSkus();
                    return null;
                }
                return <SkuDetailView sku={selectedSku} dataMap={dataMap} onBack={handleBackToSkus} />;
            }
            case 'Series':
                return <GenericManager title="シリーズ" items={series} onAdd={addSeries} onDelete={deleteSeries} onUpdateSeries={updateSeries} dataMap={dataMap} />;
            case 'Categories':
                return <GenericManager title="カテゴリ" items={categories} onAdd={addCategory} onDelete={deleteCategory} />;
            case 'Attributes':
                return <GenericManager title="属性" items={attributes} onAdd={addAttribute} onDelete={deleteAttribute} />;
            case 'Attribute Sets':
                return <GenericManager title="属性セット" items={attributeSets} onAdd={addAttributeSet} onDelete={deleteAttributeSet} onUpdateAttributeSet={updateAttributeSet} dataMap={dataMap} />;
            case 'Orders':
                return (
                    <OrderManager 
                        skus={skus} 
                        series={series}
                        branches={branches} 
                        inventory={inventory} 
                        orders={orders} 
                        onCreateOrder={createOrder}
                        currentBranchId={currentBranchId}
                        setCurrentBranchId={setCurrentBranchId}
                    />
                );
            case 'EC':
                return (
                    <EcService 
                        skus={skus}
                        series={series}
                        inventory={inventory}
                        ecBranch={branches.find(b => b.type === 'EC')}
                        customerOrders={customerOrders}
                        onPlaceOrder={handlePlaceEcOrder}
                    />
                );
            case 'CREATIVE':
                return (
                    <CreativeStudio 
                        skus={skus}
                        branches={branches}
                        onSaveAsset={handleSaveAsset}
                    />
                );
            default:
                return <SkuView skus={skus} dataMap={dataMap} addSku={addSku} deleteSku={deleteSku} onViewSku={handleViewSku} />;
        }
    };

    return (
        <div className="flex h-screen bg-gray-50/50 dark:bg-black font-sans overflow-hidden">
            <Sidebar activeView={activeView} setActiveView={setActiveView} />
            <main className="flex-1 p-6 md:p-10 overflow-y-auto relative custom-scrollbar">
                {isMutating && (
                    <div className="absolute inset-0 bg-white/60 dark:bg-black/60 z-50 flex items-center justify-center backdrop-blur-sm transition-all duration-300">
                        <div className="flex flex-col items-center p-6 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-100">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-zinc-900 dark:border-white mb-3"></div>
                            <span className="font-semibold text-zinc-600 dark:text-zinc-300">Processing...</span>
                        </div>
                    </div>
                )}
                {renderContent()}
                <ToastContainer toasts={toasts} removeToast={removeToast} />
            </main>
        </div>
    );
}