
import React, { useState, useMemo } from 'react';
import type { Sku, Branch, Inventory, Order, Series, Complaint, Driver, StockTransfer } from '../types';
import Card from './ui/Card';
import Button from './ui/Button';
import Badge from './ui/Badge';
import Modal from './ui/Modal';
import Input from './ui/Input';
import Select from './ui/Select';
import { ICONS } from '../constants';

interface OrderManagerProps {
    skus: Sku[];
    series: Series[];
    branches: Branch[];
    inventory: Inventory[];
    orders: Order[];
    complaints: Complaint[];
    drivers: Driver[];
    transfers: StockTransfer[];
    onCreateOrder: (order: Omit<Order, 'id' | 'status' | 'orderDate'>) => void;
    onReplyComplaint: (id: string, response: string) => void;
    onRegisterDriver: (driver: Omit<Driver, 'id'>) => void;
    onAssignDriver: (orderId: string, driverId: string) => void;
    onTransferStock: (transfer: Omit<StockTransfer, 'id' | 'status' | 'date'>) => void;
    currentBranchId: string;
    setCurrentBranchId: (id: string) => void;
}

export default function OrderManager({ 
    skus, 
    series,
    branches, 
    inventory, 
    orders,
    complaints,
    drivers,
    transfers,
    onCreateOrder,
    onReplyComplaint,
    onRegisterDriver,
    onAssignDriver,
    onTransferStock,
    currentBranchId,
    setCurrentBranchId
}: OrderManagerProps) {
    const [activeTab, setActiveTab] = useState<'INVENTORY' | 'HISTORY' | 'MESSAGES' | 'LOGISTICS' | 'TRANSFER'>('INVENTORY');
    
    // Order Modal State
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
    const [selectedSkuForOrder, setSelectedSkuForOrder] = useState<string | null>(null);
    const [orderQuantity, setOrderQuantity] = useState<number>(10);
    
    // Branch Dropdown State
    const [isBranchDropdownOpen, setIsBranchDropdownOpen] = useState(false);

    // Complaint State
    const [replyText, setReplyText] = useState('');
    const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);

    // Driver State
    const [isDriverModalOpen, setIsDriverModalOpen] = useState(false);
    const [newDriverName, setNewDriverName] = useState('');
    const [newDriverPhone, setNewDriverPhone] = useState('');
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    const [selectedDriverId, setSelectedDriverId] = useState<string>('');

    // Transfer State
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const [transferTargetBranch, setTransferTargetBranch] = useState('');
    const [transferSkuId, setTransferSkuId] = useState('');
    const [transferQty, setTransferQty] = useState(1);

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

    const branchComplaints = useMemo(() => {
        return complaints.filter(c => c.branchId === currentBranchId);
    }, [complaints, currentBranchId]);

    const branchTransfers = useMemo(() => {
        return transfers.filter(t => t.fromBranchId === currentBranchId || t.toBranchId === currentBranchId);
    }, [transfers, currentBranchId]);

    // Handlers
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

    const handleSendReply = () => {
        if (selectedComplaintId && replyText) {
            onReplyComplaint(selectedComplaintId, replyText);
            setReplyText('');
            setSelectedComplaintId(null);
        }
    };

    const handleSubmitDriver = () => {
        if (newDriverName && newDriverPhone) {
            onRegisterDriver({ name: newDriverName, phone: newDriverPhone, status: 'AVAILABLE', currentLocation: '待機中' });
            setIsDriverModalOpen(false);
            setNewDriverName('');
            setNewDriverPhone('');
        }
    };

    const handleAssignDriverSubmit = () => {
        if (selectedOrderId && selectedDriverId) {
            onAssignDriver(selectedOrderId, selectedDriverId);
            setIsAssignModalOpen(false);
            setSelectedOrderId(null);
            setSelectedDriverId('');
        }
    };

    const handleTransferSubmit = () => {
        if (transferTargetBranch && transferSkuId && transferQty > 0) {
            onTransferStock({
                fromBranchId: currentBranchId,
                toBranchId: transferTargetBranch,
                skuId: transferSkuId,
                quantity: transferQty
            });
            setIsTransferModalOpen(false);
        }
    };

    const getSkuName = (id: string) => skus.find(s => s.id === id)?.name || id;
    const getBranchName = (id: string) => branches.find(b => b.id === id)?.name || id;
    const getDriverName = (id?: string) => drivers.find(d => d.id === id)?.name || '未割り当て';

    // --- Render Tabs ---

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
                                        {order.driverId && (
                                            <span className="ml-2 text-zinc-500">
                                                (担当: {getDriverName(order.driverId)})
                                            </span>
                                        )}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColor}`}>
                                    {statusLabel}
                                </span>
                                {order.status === 'APPROVED' && (
                                    <Button size="sm" onClick={() => { setSelectedOrderId(order.id); setIsAssignModalOpen(true); }}>
                                        ドライバー手配
                                    </Button>
                                )}
                            </div>
                        </Card>
                    );
                })
            )}
        </div>
    );

    const renderMessagesTab = () => (
        <div className="space-y-4">
            <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-4">本部への連絡・報告</h3>
            {branchComplaints.length === 0 ? (
                <p className="text-slate-500">メッセージはありません。</p>
            ) : (
                branchComplaints.map(comp => (
                    <Card key={comp.id} className="border-l-4 border-l-red-500">
                        <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold text-slate-900 dark:text-white">{comp.title}</h4>
                            <span className="text-xs text-slate-400">{comp.createdAt}</span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 mb-4">{comp.content}</p>
                        
                        {comp.response ? (
                            <div className="bg-slate-50 dark:bg-zinc-800 p-3 rounded-lg border border-slate-200 dark:border-zinc-700">
                                <p className="text-xs font-bold text-slate-500 mb-1">本部からの回答:</p>
                                <p className="text-sm text-slate-700 dark:text-slate-200">{comp.response}</p>
                            </div>
                        ) : (
                            <div className="mt-4 border-t pt-4 dark:border-zinc-700">
                                {selectedComplaintId === comp.id ? (
                                    <div className="flex gap-2">
                                        <input 
                                            type="text" 
                                            value={replyText} 
                                            onChange={(e) => setReplyText(e.target.value)}
                                            className="flex-1 border rounded px-3 py-1 text-sm dark:bg-zinc-900 dark:border-zinc-700"
                                            placeholder="返信を入力..."
                                        />
                                        <Button size="sm" onClick={handleSendReply}>送信</Button>
                                        <Button size="sm" variant="secondary" onClick={() => setSelectedComplaintId(null)}>取消</Button>
                                    </div>
                                ) : (
                                    <Button size="sm" variant="secondary" onClick={() => setSelectedComplaintId(comp.id)}>
                                        返信する
                                    </Button>
                                )}
                            </div>
                        )}
                    </Card>
                ))
            )}
        </div>
    );

    const renderLogisticsTab = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="font-bold text-lg text-slate-800 dark:text-white">登録ドライバー一覧</h3>
                <Button onClick={() => setIsDriverModalOpen(true)}>{ICONS.plus} ドライバー登録</Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {drivers.map(driver => (
                    <Card key={driver.id} className="flex items-center justify-between">
                        <div>
                            <h4 className="font-bold text-slate-900 dark:text-white">{driver.name}</h4>
                            <p className="text-sm text-slate-500">{driver.phone}</p>
                            <p className="text-xs text-slate-400 mt-1">現在地: {driver.currentLocation}</p>
                        </div>
                        <Badge color={driver.status === 'AVAILABLE' ? 'green' : driver.status === 'BUSY' ? 'red' : 'gray'}>
                            {driver.status}
                        </Badge>
                    </Card>
                ))}
            </div>
        </div>
    );

    const renderTransferTab = () => (
        <div className="space-y-6">
             <div className="flex justify-between items-center">
                <h3 className="font-bold text-lg text-slate-800 dark:text-white">店舗間在庫移動</h3>
                <Button onClick={() => setIsTransferModalOpen(true)}>{ICONS.plus} 在庫移動指示</Button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-400">
                        <tr>
                            <th className="px-6 py-3">日付</th>
                            <th className="px-6 py-3">移動元</th>
                            <th className="px-6 py-3">移動先</th>
                            <th className="px-6 py-3">商品</th>
                            <th className="px-6 py-3">数量</th>
                            <th className="px-6 py-3">ステータス</th>
                        </tr>
                    </thead>
                    <tbody>
                        {branchTransfers.map(tr => (
                            <tr key={tr.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700">
                                <td className="px-6 py-4">{tr.date}</td>
                                <td className="px-6 py-4">{getBranchName(tr.fromBranchId)}</td>
                                <td className="px-6 py-4">{getBranchName(tr.toBranchId)}</td>
                                <td className="px-6 py-4">{getSkuName(tr.skuId)}</td>
                                <td className="px-6 py-4 font-bold">{tr.quantity}</td>
                                <td className="px-6 py-4"><Badge color="green">{tr.status}</Badge></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
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
            <div className="flex border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
                <button className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap ${activeTab === 'INVENTORY' ? 'border-sky-600 text-sky-600 dark:text-sky-400' : 'border-transparent text-slate-500'}`} onClick={() => setActiveTab('INVENTORY')}>在庫一覧</button>
                <button className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap ${activeTab === 'HISTORY' ? 'border-sky-600 text-sky-600 dark:text-sky-400' : 'border-transparent text-slate-500'}`} onClick={() => setActiveTab('HISTORY')}>発注履歴</button>
                <button className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap ${activeTab === 'MESSAGES' ? 'border-sky-600 text-sky-600 dark:text-sky-400' : 'border-transparent text-slate-500'}`} onClick={() => setActiveTab('MESSAGES')}>メッセージ/報告</button>
                <button className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap ${activeTab === 'LOGISTICS' ? 'border-sky-600 text-sky-600 dark:text-sky-400' : 'border-transparent text-slate-500'}`} onClick={() => setActiveTab('LOGISTICS')}>配送/ドライバー</button>
                <button className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap ${activeTab === 'TRANSFER' ? 'border-sky-600 text-sky-600 dark:text-sky-400' : 'border-transparent text-slate-500'}`} onClick={() => setActiveTab('TRANSFER')}>店舗間移動</button>
            </div>

            {/* Content */}
            {activeTab === 'INVENTORY' && renderInventoryTab()}
            {activeTab === 'HISTORY' && renderOrdersTab()}
            {activeTab === 'MESSAGES' && renderMessagesTab()}
            {activeTab === 'LOGISTICS' && renderLogisticsTab()}
            {activeTab === 'TRANSFER' && renderTransferTab()}

            {/* Modals */}
            <Modal isOpen={isOrderModalOpen} onClose={() => setIsOrderModalOpen(false)} title="発注依頼">
                <div className="space-y-4">
                    <Input label="発注数量" type="number" min="1" value={orderQuantity} onChange={(e) => setOrderQuantity(parseInt(e.target.value) || 0)} />
                    <div className="flex justify-end gap-2 pt-4">
                        <Button variant="secondary" onClick={() => setIsOrderModalOpen(false)}>キャンセル</Button>
                        <Button onClick={handleSubmitOrder}>発注確定</Button>
                    </div>
                </div>
            </Modal>

            <Modal isOpen={isDriverModalOpen} onClose={() => setIsDriverModalOpen(false)} title="新規ドライバー登録">
                <div className="space-y-4">
                    <Input label="氏名/会社名" value={newDriverName} onChange={(e) => setNewDriverName(e.target.value)} />
                    <Input label="連絡先 (電話番号)" value={newDriverPhone} onChange={(e) => setNewDriverPhone(e.target.value)} />
                    <div className="flex justify-end gap-2 pt-4">
                        <Button variant="secondary" onClick={() => setIsDriverModalOpen(false)}>キャンセル</Button>
                        <Button onClick={handleSubmitDriver}>登録</Button>
                    </div>
                </div>
            </Modal>

            <Modal isOpen={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)} title="ドライバー手配">
                <div className="space-y-4">
                    <Select label="担当ドライバーを選択" value={selectedDriverId} onChange={(e) => setSelectedDriverId(e.target.value)}>
                        <option value="">選択してください</option>
                        {drivers.filter(d => d.status === 'AVAILABLE').map(d => (
                            <option key={d.id} value={d.id}>{d.name} ({d.currentLocation})</option>
                        ))}
                    </Select>
                     <div className="flex justify-end gap-2 pt-4">
                        <Button variant="secondary" onClick={() => setIsAssignModalOpen(false)}>キャンセル</Button>
                        <Button onClick={handleAssignDriverSubmit}>手配確定</Button>
                    </div>
                </div>
            </Modal>

            <Modal isOpen={isTransferModalOpen} onClose={() => setIsTransferModalOpen(false)} title="在庫移動指示">
                <div className="space-y-4">
                    <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded mb-2">
                        <span className="text-xs text-slate-500">移動元:</span>
                        <div className="font-bold">{currentBranch?.name}</div>
                    </div>
                    
                    <Select label="移動先店舗" value={transferTargetBranch} onChange={(e) => setTransferTargetBranch(e.target.value)}>
                        <option value="">選択してください</option>
                        {branches.filter(b => b.id !== currentBranchId).map(b => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                    </Select>
                    
                    <Select label="対象SKU" value={transferSkuId} onChange={(e) => setTransferSkuId(e.target.value)}>
                        <option value="">選択してください</option>
                        {skus.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                    </Select>
                    
                    <Input label="移動数量" type="number" min="1" value={transferQty} onChange={(e) => setTransferQty(parseInt(e.target.value) || 0)} />
                    
                    <div className="flex justify-end gap-2 pt-4">
                        <Button variant="secondary" onClick={() => setIsTransferModalOpen(false)}>キャンセル</Button>
                        <Button onClick={handleTransferSubmit}>移動指示</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
