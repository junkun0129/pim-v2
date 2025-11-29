
import React, { useState, useMemo, useEffect } from 'react';
import type { Sku, Series, Category, AttributeSet, ViewType, Attribute, Branch, Inventory, Order, CustomerOrder, WebCatalog, Project, Complaint, Driver, StockTransfer, User, Role, SkuDraft, ExportChannel, DraftStatus, ExtensionType, AppNotification } from './types';
import Sidebar from './components/Sidebar';
import SkuView from './components/SkuView';
import GenericManager from './components/GenericManager';
import SkuDetailView from './components/SkuDetailView';
import SeriesDetailView from './components/SeriesDetailView';
import OrderManager from './components/OrderManager';
import EcService from './components/EcService';
import CreativeStudio from './components/CreativeStudio';
import WebCatalogManager from './components/WebCatalogManager';
import ProjectManager from './components/ProjectManager';
import ChannelExportManager from './components/ChannelExportManager';
import AdminPanel from './components/AdminPanel';
import LoginScreen from './components/LoginScreen';
import ExtensionStore from './components/ExtensionStore';
import NotificationCenter from './components/NotificationCenter';
import { MOCK_SKUS, MOCK_SERIES, MOCK_CATEGORIES, MOCK_ATTRIBUTES, MOCK_ATTRIBUTE_SETS, MOCK_BRANCHES, MOCK_INVENTORY, MOCK_ORDERS, MOCK_CUSTOMER_ORDERS, MOCK_CATALOGS, MOCK_PROJECTS, MOCK_COMPLAINTS, MOCK_DRIVERS, MOCK_TRANSFERS, MOCK_USERS, MOCK_ROLES, MOCK_DRAFTS, MOCK_EXPORT_CHANNELS, MOCK_NOTIFICATIONS } from './mockData';
import { APP_CONFIG } from './config';
import { api } from './api';
import { ToastContainer, ToastMessage, ToastType } from './components/ui/Toast';
import { ICONS } from './constants';

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
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [transfers, setTransfers] = useState<StockTransfer[]>([]);
    const [currentBranchId, setCurrentBranchId] = useState<string>('br1');

    // New Web Catalog State
    const [catalogs, setCatalogs] = useState<WebCatalog[]>([]);

    // New Project State
    const [projects, setProjects] = useState<Project[]>([]);
    const [drafts, setDrafts] = useState<SkuDraft[]>([]); 

    // New Export State
    const [exportChannels, setExportChannels] = useState<ExportChannel[]>([]);
    
    // User & Role State
    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    // Allow null for "Logged Out" state. Default to 'user_full' for dev convenience.
    const [currentUserId, setCurrentUserId] = useState<string | null>('user_full'); 

    // Notification State
    const [notifications, setNotifications] = useState<AppNotification[]>([]);

    const [activeView, setActiveView] = useState<ViewType>('SKUs');
    const [selectedSkuId, setSelectedSkuId] = useState<string | null>(null);
    const [selectedSeriesId, setSelectedSeriesId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    // New loading state for Save/Delete actions
    const [isMutating, setIsMutating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // Mobile Sidebar State
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    
    // Toast State
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const currentUser = useMemo(() => users.find(u => u.id === currentUserId) || null, [users, currentUserId]);
    const currentUserRole = useMemo(() => roles.find(r => r.id === currentUser?.roleId) || null, [roles, currentUser]);

    const addToast = (type: ToastType, message: string) => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts(prev => [...prev, { id, type, message }]);
    };

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    // Close mobile menu when view changes
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [activeView]);

    // Initial Data Fetch
    useEffect(() => {
        const loadData = async () => {
            // Always load OMS mock data since it's a new feature not in API yet
            setBranches(MOCK_BRANCHES);
            setInventory(MOCK_INVENTORY);
            setOrders(MOCK_ORDERS);
            setCustomerOrders(MOCK_CUSTOMER_ORDERS);
            setComplaints(MOCK_COMPLAINTS);
            setDrivers(MOCK_DRIVERS);
            setTransfers(MOCK_TRANSFERS);
            setCatalogs(MOCK_CATALOGS);
            setProjects(MOCK_PROJECTS);
            setDrafts(MOCK_DRAFTS);
            setExportChannels(MOCK_EXPORT_CHANNELS);
            setUsers(MOCK_USERS);
            setRoles(MOCK_ROLES);
            setNotifications(MOCK_NOTIFICATIONS);

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

    // --- Helper: Action Logger (Notification Generator) ---
    const logSystemAction = (type: AppNotification['type'], title: string, message: string) => {
        if (!currentUserId) return;
        const newNotif: AppNotification = {
            id: `notif-${Date.now()}`,
            type,
            title,
            message,
            actorId: currentUserId,
            timestamp: new Date().toLocaleString(),
            isRead: false
        };
        setNotifications(prev => [newNotif, ...prev]);
    };

    const handleMarkAllNotificationsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        addToast('success', 'すべて既読にしました');
    };

    const handleClearNotifications = () => {
        if(window.confirm('通知履歴をすべて削除しますか？')) {
            setNotifications([]);
            addToast('info', '通知履歴をクリアしました');
        }
    };

    // Auth Handlers
    const handleLogin = (userId: string) => {
        setCurrentUserId(userId);
        addToast('success', 'ログインしました');
    };

    const handleLogout = () => {
        setIsLoading(true);
        // Simulate slight delay
        setTimeout(() => {
            setCurrentUserId(null);
            setIsLoading(false);
            addToast('info', 'ログアウトしました');
        }, 500);
    };

    // Permission Guard Logic
    const hasAccess = (requiredPerm: string) => {
        if (!currentUserRole) return false;
        return currentUserRole.permissions.includes(requiredPerm as any);
    };

    // Extension Guard Logic
    const hasExtension = (ext: ExtensionType) => {
        return currentUser?.activeExtensions.includes(ext) || false;
    };

    // --- Extension Store Handler ---
    const handleToggleExtension = (extId: ExtensionType) => {
        if (!currentUser) return;
        const currentExts = currentUser.activeExtensions;
        let newExts: ExtensionType[];
        let message = '';

        if (currentExts.includes(extId)) {
            newExts = currentExts.filter(e => e !== extId);
            message = '拡張機能を無効化しました';
        } else {
            newExts = [...currentExts, extId];
            message = '拡張機能を購入しました！';
        }

        // Update local user state
        setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, activeExtensions: newExts } : u));
        addToast('success', message);
        logSystemAction('SYSTEM', '機能拡張更新', message);
    };

    // --- Master Data Handlers ---
    const handleAddSku = async (newSku: Omit<Sku, 'id'>) => {
        setIsMutating(true);
        try {
            if (APP_CONFIG.useMockData) {
                const sku: Sku = { ...newSku, id: `sku-${Date.now()}` };
                setSkus([...skus, sku]);
                addToast('success', 'SKUを作成しました');
                logSystemAction('SYSTEM', 'SKU作成', `新しいSKU「${newSku.name}」を作成しました。`);
            } else {
                const savedSku = await api.createSku(newSku);
                setSkus([...skus, savedSku]);
                addToast('success', 'SKUを保存しました');
                logSystemAction('SYSTEM', 'SKU作成', `新しいSKU「${newSku.name}」を作成しました。`);
            }
        } catch (err) {
            addToast('error', 'SKUの作成に失敗しました');
        } finally {
            setIsMutating(false);
        }
    };

    const handleUpdateSku = async (updatedSku: Sku) => {
        setIsMutating(true);
        try {
            if (APP_CONFIG.useMockData) {
                setSkus(prev => prev.map(s => s.id === updatedSku.id ? updatedSku : s));
                addToast('success', 'SKUを更新しました');
            } else {
                const saved = await api.updateSku(updatedSku);
                setSkus(prev => prev.map(s => s.id === saved.id ? saved : s));
                addToast('success', 'SKUを更新しました');
            }
            logSystemAction('SYSTEM', 'SKU更新', `SKU「${updatedSku.name}」を更新しました。`);
        } catch (err) {
            addToast('error', 'SKUの更新に失敗しました');
        } finally {
            setIsMutating(false);
        }
    };

    const handleImportSkus = (newSkus: Omit<Sku, 'id'>[]) => {
        setIsMutating(true);
        try {
            const addedSkus = newSkus.map((s, i) => ({ ...s, id: `imp-${Date.now()}-${i}` }));
            setSkus(prev => [...prev, ...addedSkus]);
            addToast('success', `${newSkus.length}件のSKUをインポートしました`);
            logSystemAction('SYSTEM', 'SKUインポート', `${newSkus.length}件のSKUを一括登録しました。`);
        } finally {
            setIsMutating(false);
        }
    };

    const handleDeleteSku = async (id: string) => {
        if (!window.confirm('本当に削除しますか？')) return;
        setIsMutating(true);
        try {
            if (APP_CONFIG.useMockData) {
                setSkus(skus.filter(s => s.id !== id));
                addToast('info', 'SKUを削除しました');
            } else {
                await api.deleteSku(id);
                setSkus(skus.filter(s => s.id !== id));
                addToast('info', 'SKUを削除しました');
            }
            logSystemAction('SYSTEM', 'SKU削除', `SKU ID: ${id} を削除しました。`);
        } catch (err) {
            addToast('error', '削除に失敗しました');
        } finally {
            setIsMutating(false);
        }
    };
    
    // --- Series Handlers ---
    const handleAddSeries = async (newSeries: Omit<Series, 'id' | 'childSkuIds'>) => {
        setIsMutating(true);
        try {
            if (APP_CONFIG.useMockData) {
                const s: Series = { ...newSeries, id: `ser-${Date.now()}`, childSkuIds: [] };
                setSeries([...series, s]);
                addToast('success', 'シリーズを作成しました');
                logSystemAction('SYSTEM', 'シリーズ作成', `シリーズ「${newSeries.name}」を作成しました。`);
            } else {
                const saved = await api.createSeries(newSeries);
                setSeries([...series, saved]);
                addToast('success', 'シリーズを作成しました');
                logSystemAction('SYSTEM', 'シリーズ作成', `シリーズ「${newSeries.name}」を作成しました。`);
            }
        } finally {
            setIsMutating(false);
        }
    };

    const handleUpdateSeries = async (updatedSeries: Series) => {
        setIsMutating(true);
        try {
            if (APP_CONFIG.useMockData) {
                setSeries(prev => prev.map(s => s.id === updatedSeries.id ? updatedSeries : s));
                addToast('success', 'シリーズを更新しました');
            } else {
                const saved = await api.updateSeries(updatedSeries);
                setSeries(prev => prev.map(s => s.id === saved.id ? saved : s));
                addToast('success', 'シリーズを更新しました');
            }
        } finally {
            setIsMutating(false);
        }
    };

    const handleDeleteSeries = async (id: string) => {
        if (!window.confirm('シリーズを削除しますか？紐付くSKUは削除されません。')) return;
        setIsMutating(true);
        try {
            if (APP_CONFIG.useMockData) {
                setSeries(series.filter(s => s.id !== id));
                addToast('info', 'シリーズを削除しました');
            } else {
                await api.deleteSeries(id);
                setSeries(series.filter(s => s.id !== id));
                addToast('info', 'シリーズを削除しました');
            }
        } finally {
            setIsMutating(false);
        }
    };

    // --- Category Handlers (Cascading Delete + Edit) ---
    const handleAddCategory = async (newCat: { name: string; parentId?: string }) => {
        setIsMutating(true);
        try {
            if (APP_CONFIG.useMockData) {
                const cat: Category = { ...newCat, id: `cat-${Date.now()}` };
                setCategories([...categories, cat]);
                addToast('success', 'カテゴリを追加しました');
                logSystemAction('SYSTEM', 'カテゴリ作成', `「${newCat.name}」を追加しました。`);
            } else {
                const saved = await api.createCategory(newCat);
                setCategories([...categories, saved]);
                addToast('success', 'カテゴリを追加しました');
                logSystemAction('SYSTEM', 'カテゴリ作成', `「${newCat.name}」を追加しました。`);
            }
        } finally {
            setIsMutating(false);
        }
    };

    const handleUpdateCategory = async (updatedCat: Category) => {
        setIsMutating(true);
        try {
            if(APP_CONFIG.useMockData) {
                setCategories(prev => prev.map(c => c.id === updatedCat.id ? updatedCat : c));
                addToast('success', 'カテゴリを更新しました');
            } else {
                setCategories(prev => prev.map(c => c.id === updatedCat.id ? updatedCat : c));
                addToast('success', 'カテゴリを更新しました');
            }
        } finally {
            setIsMutating(false);
        }
    };

    const handleDeleteCategory = async (id: string) => {
        if (!window.confirm('カテゴリを削除しますか？子カテゴリも全て削除されます。')) return;
        setIsMutating(true);
        try {
            const getAllChildIds = (parentId: string): string[] => {
                const children = categories.filter(c => c.parentId === parentId);
                let ids = children.map(c => c.id);
                children.forEach(child => {
                    ids = [...ids, ...getAllChildIds(child.id)];
                });
                return ids;
            };

            const idsToDelete = [id, ...getAllChildIds(id)];

            if (APP_CONFIG.useMockData) {
                setCategories(categories.filter(c => !idsToDelete.includes(c.id)));
                addToast('info', `${idsToDelete.length}件のカテゴリを削除しました`);
            } else {
                for (const catId of idsToDelete) {
                    await api.deleteCategory(catId);
                }
                setCategories(categories.filter(c => !idsToDelete.includes(c.id)));
                addToast('info', 'カテゴリを削除しました');
            }
        } catch (err) {
            addToast('error', '削除に失敗しました');
        } finally {
            setIsMutating(false);
        }
    };

    // --- Attributes Handlers ---
    const handleAddAttribute = async (data: { name: string, unit?: string }) => {
        if (APP_CONFIG.useMockData) {
            setAttributes([...attributes, { id: `attr-${Date.now()}`, name: data.name, unit: data.unit }]);
        } else {
            const saved = await api.createAttribute(data);
            setAttributes([...attributes, saved]);
        }
        addToast('success', '属性を追加しました');
    };

    const handleDeleteAttribute = async (id: string) => {
        if (APP_CONFIG.useMockData) {
            setAttributes(attributes.filter(a => a.id !== id));
        } else {
            await api.deleteAttribute(id);
            setAttributes(attributes.filter(a => a.id !== id));
        }
        addToast('info', '属性を削除しました');
    };

    const handleAddAttributeSet = async (data: { name: string, attributeIds: string[], sharedAttributeIds: string[] }) => {
        if (APP_CONFIG.useMockData) {
            setAttributeSets([...attributeSets, { id: `as-${Date.now()}`, name: data.name, attributeIds: data.attributeIds, sharedAttributeIds: data.sharedAttributeIds }]);
        } else {
            const saved = await api.createAttributeSet(data);
            setAttributeSets([...attributeSets, saved]);
        }
        addToast('success', '属性セットを作成しました');
    };

    const handleUpdateAttributeSet = async (setId: string, attributeIds: string[], sharedAttributeIds: string[]) => {
        if (APP_CONFIG.useMockData) {
            setAttributeSets(prev => prev.map(s => s.id === setId ? { ...s, attributeIds, sharedAttributeIds } : s));
        } else {
            await api.updateAttributeSet(setId, attributeIds); 
            setAttributeSets(prev => prev.map(s => s.id === setId ? { ...s, attributeIds, sharedAttributeIds } : s));
        }
        addToast('success', '属性セットを更新しました');
    };

    const handleDeleteAttributeSet = async (id: string) => {
        if (APP_CONFIG.useMockData) {
            setAttributeSets(attributeSets.filter(s => s.id !== id));
        } else {
            await api.deleteAttributeSet(id);
            setAttributeSets(attributeSets.filter(s => s.id !== id));
        }
        addToast('info', '属性セットを削除しました');
    };

    // --- Order Manager Handlers (Mock) ---
    const handleCreateOrder = (newOrder: Omit<Order, 'id' | 'status' | 'orderDate'>) => {
        const order: Order = {
            ...newOrder,
            id: `ord-${Date.now()}`,
            status: 'PENDING',
            orderDate: new Date().toISOString().split('T')[0]
        };
        setOrders([order, ...orders]);
        addToast('success', '発注依頼を作成しました');
        
        const branchName = branches.find(b => b.id === newOrder.branchId)?.name || newOrder.branchId;
        logSystemAction('ORDER', '新規発注', `${branchName}から発注が作成されました (数量: ${newOrder.quantity})`);
    };

    // --- EC Handlers (Mock) ---
    const handleEcOrder = (skuId: string, quantity: number) => {
        const sku = skus.find(s => s.id === skuId);
        if(!sku) return;
        
        setInventory(prev => prev.map(inv => {
            if (inv.branchId === 'br-ec' && inv.skuId === skuId) {
                return { ...inv, quantity: Math.max(0, inv.quantity - quantity) };
            }
            return inv;
        }));

        const newOrder: CustomerOrder = {
            id: `co-${Date.now()}`,
            customerName: 'ゲスト購入者',
            skuId,
            quantity,
            totalPrice: (sku.price || 0) * quantity,
            orderDate: new Date().toLocaleString(),
            status: 'PROCESSING'
        };
        setCustomerOrders([newOrder, ...customerOrders]);
        addToast('success', '注文が確定しました！');
        logSystemAction('ORDER', 'EC注文確定', `ECサイトで「${sku.name}」が購入されました。`);
    };

    // --- Creative Studio Handlers (Mock) ---
    const handleSaveAsset = (skuId: string, assetName: string, assetDataUrl: string) => {
        const newAsset: any = {
            id: `asset-${Date.now()}`,
            type: 'DESIGN',
            name: assetName,
            url: assetDataUrl,
            createdAt: new Date().toISOString(),
            branchId: currentBranchId
        };

        setSkus(prev => prev.map(sku => {
            if (sku.id === skuId) {
                return { ...sku, assets: [newAsset, ...(sku.assets || [])] };
            }
            return sku;
        }));
        
        addToast('success', 'POPデザインを保存しました');
        logSystemAction('PROJECT', 'デザイン保存', `POP「${assetName}」を保存しました。`);
    };

    // --- Web Catalog Handlers (Mock) ---
    const handleSaveCatalog = (catalog: WebCatalog) => {
        setCatalogs(prev => {
            const exists = prev.find(c => c.id === catalog.id);
            if (exists) {
                return prev.map(c => c.id === catalog.id ? catalog : c);
            }
            return [...prev, catalog];
        });
        addToast('success', 'カタログを保存しました');
        logSystemAction('PROJECT', 'カタログ更新', `Webカタログ「${catalog.name}」を保存しました。`);
    };

    const handleDeleteCatalog = (id: string) => {
        if (!window.confirm("カタログを削除しますか？")) return;
        setCatalogs(prev => prev.filter(c => c.id !== id));
        addToast('info', 'カタログを削除しました');
    };

    // --- Project Handlers (Mock) ---
    const handleCreateProject = (data: Omit<Project, 'id' | 'createdAt' | 'status'>) => {
        const newProject: Project = {
            ...data,
            id: `proj-${Date.now()}`,
            status: 'PLANNING',
            createdAt: new Date().toISOString().split('T')[0]
        };
        setProjects([newProject, ...projects]);
        addToast('success', 'プロジェクトを作成しました');
        logSystemAction('PROJECT', 'プロジェクト開始', `新規プロジェクト「${newProject.name}」が開始されました。`);
    };

    const handleAddProjectMember = (projectId: string, userId: string) => {
        setProjects(prev => prev.map(p => {
            if (p.id === projectId && !p.memberIds.includes(userId)) {
                return { ...p, memberIds: [...p.memberIds, userId] };
            }
            return p;
        }));
        addToast('success', 'メンバーを追加しました');
    };

    // --- Project Drafts Handlers ---
    const handleCreateDraft = (data: Omit<SkuDraft, 'id' | 'createdAt' | 'authorId'>) => {
        const newDraft: SkuDraft = {
            ...data,
            id: `draft-${Date.now()}`,
            createdAt: new Date().toISOString().split('T')[0],
            authorId: currentUserId!
        };
        setDrafts([newDraft, ...drafts]);
        addToast('success', 'SKUドラフトを起案しました');
        logSystemAction('PROJECT', 'SKU起案', `ドラフト「${newDraft.name}」が提出されました。`);
    };

    const handleUpdateDraftStatus = (draftId: string, status: DraftStatus) => {
        const draft = drafts.find(d => d.id === draftId);
        setDrafts(prev => prev.map(d => d.id === draftId ? { ...d, status } : d));
        addToast('success', `ステータスを更新しました: ${status}`);
        if (draft) {
            logSystemAction('PROJECT', 'ドラフト承認/却下', `「${draft.name}」のステータスが ${status} に変更されました。`);
        }
    };

    // --- OMS: Messages, Logistics, Transfer ---
    const handleReplyComplaint = (id: string, response: string) => {
        setComplaints(prev => prev.map(c => c.id === id ? { ...c, response, status: 'RESOLVED' } : c));
        addToast('success', '回答を送信しました');
    };

    const handleRegisterDriver = (driver: Omit<Driver, 'id'>) => {
        setDrivers([...drivers, { ...driver, id: `drv-${Date.now()}` }]);
        addToast('success', 'ドライバーを登録しました');
    };

    const handleAssignDriver = (orderId: string, driverId: string) => {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, driverId, status: 'SHIPPED' } : o));
        setDrivers(prev => prev.map(d => d.id === driverId ? { ...d, status: 'BUSY', currentLocation: '配送中' } : d));
        addToast('success', 'ドライバーを割り当てました');
    };

    const handleTransferStock = (data: Omit<StockTransfer, 'id' | 'status' | 'date'>) => {
        const transfer: StockTransfer = {
            ...data,
            id: `tr-${Date.now()}`,
            status: 'COMPLETED',
            date: new Date().toISOString().split('T')[0]
        };
        setTransfers([transfer, ...transfers]);

        setInventory(prev => {
            const next = [...prev];
            const fromIdx = next.findIndex(i => i.branchId === data.fromBranchId && i.skuId === data.skuId);
            if (fromIdx >= 0) {
                next[fromIdx] = { ...next[fromIdx], quantity: Math.max(0, next[fromIdx].quantity - data.quantity) };
            }
            const toIdx = next.findIndex(i => i.branchId === data.toBranchId && i.skuId === data.skuId);
            if (toIdx >= 0) {
                next[toIdx] = { ...next[toIdx], quantity: next[toIdx].quantity + data.quantity };
            } else {
                next.push({ skuId: data.skuId, branchId: data.toBranchId, quantity: data.quantity, lastUpdated: new Date().toISOString().split('T')[0] });
            }
            return next;
        });

        addToast('success', '在庫移動処理が完了しました');
        logSystemAction('ORDER', '在庫移動', `SKU移動: ${data.quantity}個 (from ${data.fromBranchId} to ${data.toBranchId})`);
    };

    // --- Channel Export Handlers ---
    const handleAddChannel = (channel: ExportChannel) => {
        setExportChannels([...exportChannels, channel]);
        addToast('success', 'エクスポートチャネルを追加しました');
    };

    const handleUpdateChannel = (channel: ExportChannel) => {
        setExportChannels(prev => prev.map(c => c.id === channel.id ? channel : c));
        addToast('success', 'チャネル設定を更新しました');
    };

    const handleDeleteChannel = (id: string) => {
        if(window.confirm('このチャネル設定を削除しますか？')) {
            setExportChannels(prev => prev.filter(c => c.id !== id));
            addToast('info', 'チャネル設定を削除しました');
        }
    };


    // --- Admin: User & Role Management ---
    const handleUpdateUserRole = (userId: string, roleId: string) => {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, roleId } : u));
        addToast('success', 'ユーザー権限を更新しました');
        logSystemAction('SYSTEM', '権限変更', `ユーザーID:${userId} のロールを変更しました。`);
    };

    const handleCreateRole = (roleData: Omit<Role, 'id'>) => {
        const newRole: Role = { ...roleData, id: `role_${Date.now()}` };
        setRoles([...roles, newRole]);
        addToast('success', 'ロールを作成しました');
    };

    const handleUpdateRole = (role: Role) => {
        setRoles(prev => prev.map(r => r.id === role.id ? role : r));
        addToast('success', 'ロール情報を更新しました');
    };

    const handleDeleteRole = (roleId: string) => {
        if (users.some(u => u.roleId === roleId)) {
            addToast('error', 'このロールを使用中のユーザーがいるため削除できません');
            return;
        }
        setRoles(prev => prev.filter(r => r.id !== roleId));
        addToast('info', 'ロールを削除しました');
    };


    const renderContent = () => {
        // --- System Views ---
        if (activeView === 'EXTENSION_STORE') {
            return (
                <ExtensionStore 
                    activeExtensions={currentUser?.activeExtensions || []}
                    onToggleExtension={handleToggleExtension}
                />
            );
        }

        if (activeView === 'NOTIFICATIONS') {
            return (
                <NotificationCenter 
                    notifications={notifications} 
                    users={users}
                    onMarkAllRead={handleMarkAllNotificationsRead}
                    onClearAll={handleClearNotifications}
                />
            );
        }

        if (activeView === 'ADMIN') {
            if (!hasAccess('ADMIN_VIEW')) return <div className="p-10 text-center text-slate-500">アクセス権限がありません</div>;
            return <AdminPanel 
                users={users} 
                roles={roles} 
                onUpdateUserRole={handleUpdateUserRole} 
                onUpdateRole={handleUpdateRole}
                onCreateRole={handleCreateRole}
                onDeleteRole={handleDeleteRole}
            />;
        }

        // --- Extension Views (Checked against Permissions AND Active Extensions) ---

        if (activeView === 'PROJECTS') {
            if (!hasAccess('PROJECT_VIEW') || !hasExtension('PROJECT')) return <div className="p-10 text-center text-slate-500">機能が無効化されているか、権限がありません</div>;
            return <ProjectManager 
                projects={projects} 
                onCreateProject={handleCreateProject}
                onAddMember={handleAddProjectMember}
                currentUserId={currentUserId!}
                userRole={currentUserRole}
                users={users}
                drafts={drafts}
                onCreateDraft={handleCreateDraft}
                onUpdateDraftStatus={handleUpdateDraftStatus}
            />;
        }

        if (activeView === 'CATALOG') {
            if (!hasAccess('CATALOG_VIEW') || !hasExtension('CATALOG')) return <div className="p-10 text-center text-slate-500">機能が無効化されているか、権限がありません</div>;
            return <WebCatalogManager catalogs={catalogs} skus={skus} categories={categories} series={series} onSaveCatalog={handleSaveCatalog} onDeleteCatalog={handleDeleteCatalog} />;
        }

        if (activeView === 'CHANNEL_EXPORT') {
             if (!hasAccess('MASTER_EXPORT') || !hasExtension('EXPORT')) return <div className="p-10 text-center text-slate-500">機能が無効化されているか、権限がありません</div>;
             return (
                <ChannelExportManager 
                    skus={skus}
                    series={series}
                    categories={categories}
                    attributes={attributes}
                    attributeSets={attributeSets}
                    channels={exportChannels}
                    onAddChannel={handleAddChannel}
                    onUpdateChannel={handleUpdateChannel}
                    onDeleteChannel={handleDeleteChannel}
                />
             );
        }

        if (activeView === 'CREATIVE') {
            if (!hasAccess('CREATIVE_VIEW') || !hasExtension('CREATIVE')) return <div className="p-10 text-center text-slate-500">機能が無効化されているか、権限がありません</div>;
            return <CreativeStudio skus={skus} branches={branches} onSaveAsset={handleSaveAsset} />;
        }

        if (activeView === 'EC') {
            if (!hasAccess('EC_VIEW') || !hasExtension('EC')) return <div className="p-10 text-center text-slate-500">機能が無効化されているか、権限がありません</div>;
            return <EcService skus={skus} series={series} inventory={inventory} ecBranch={branches.find(b => b.type === 'EC')} customerOrders={customerOrders} onPlaceOrder={handleEcOrder} />;
        }

        if (activeView === 'Orders') {
             if (!hasAccess('OMS_VIEW') || !hasExtension('OMS')) return <div className="p-10 text-center text-slate-500">機能が無効化されているか、権限がありません</div>;
             return (
                <OrderManager 
                    skus={skus} 
                    series={series}
                    branches={branches} 
                    inventory={inventory} 
                    orders={orders} 
                    complaints={complaints}
                    drivers={drivers}
                    transfers={transfers}
                    onCreateOrder={handleCreateOrder} 
                    onReplyComplaint={handleReplyComplaint}
                    onRegisterDriver={handleRegisterDriver}
                    onAssignDriver={handleAssignDriver}
                    onTransferStock={handleTransferStock}
                    currentBranchId={currentBranchId}
                    setCurrentBranchId={setCurrentBranchId}
                />
            );
        }

        // --- Core Views (Master Data) ---

        if (activeView === 'SKU_DETAIL' && selectedSkuId) {
            const sku = skus.find(s => s.id === selectedSkuId);
            if (sku) {
                return (
                    <SkuDetailView 
                        sku={sku} 
                        dataMap={{ series, categories, attributes, attributeSets }} 
                        onBack={() => { setSelectedSkuId(null); setActiveView('SKUs'); }} 
                        onEdit={hasAccess('MASTER_EDIT') ? handleUpdateSku : undefined}
                    />
                );
            }
        }

        if (activeView === 'SERIES_DETAIL' && selectedSeriesId) {
            const ser = series.find(s => s.id === selectedSeriesId);
            if (ser) {
                return (
                    <SeriesDetailView
                        series={ser}
                        childSkus={skus.filter(s => s.seriesId === ser.id)}
                        dataMap={{ categories, attributes, attributeSets }}
                        onBack={() => { setSelectedSeriesId(null); setActiveView('Series'); }}
                        onEdit={hasAccess('MASTER_EDIT') ? handleUpdateSeries : undefined}
                        onViewSku={(id) => { setSelectedSkuId(id); setActiveView('SKU_DETAIL'); }}
                        onAddSku={hasAccess('MASTER_CREATE') ? handleAddSku : undefined}
                    />
                )
            }
        }
        
        if (activeView === 'SKUs') {
             if (!hasAccess('MASTER_VIEW')) return <div className="p-10 text-center text-slate-500">アクセス権限がありません</div>;
             return (
                <SkuView 
                    skus={skus} 
                    dataMap={{ series, categories, attributes, attributeSets }} 
                    addSku={handleAddSku} 
                    updateSku={handleUpdateSku}
                    deleteSku={handleDeleteSku}
                    onViewSku={(id) => { setSelectedSkuId(id); setActiveView('SKU_DETAIL'); }}
                    onImportSkus={handleImportSkus}
                    userPermissions={currentUserRole?.permissions || []}
                />
            );
        }

        if (!hasAccess('MASTER_VIEW')) return <div className="p-10 text-center text-slate-500">アクセス権限がありません</div>;

        return (
            <GenericManager
                title={
                    activeView === 'Series' ? 'シリーズ' :
                    activeView === 'Categories' ? 'カテゴリ' :
                    activeView === 'Attributes' ? '属性' : '属性セット'
                }
                items={
                    activeView === 'Series' ? series :
                    activeView === 'Categories' ? categories :
                    activeView === 'Attributes' ? attributes : attributeSets
                }
                dataMap={{ categories, attributes, attributeSets, series }}
                onAdd={
                    activeView === 'Series' ? handleAddSeries :
                    activeView === 'Categories' ? handleAddCategory :
                    activeView === 'Attributes' ? handleAddAttribute : handleAddAttributeSet
                }
                onUpdateAttributeSet={activeView === 'Attribute Sets' ? handleUpdateAttributeSet : undefined}
                onUpdateSeries={activeView === 'Series' ? handleUpdateSeries : undefined}
                onUpdateCategory={activeView === 'Categories' ? handleUpdateCategory : undefined}
                onDelete={
                    activeView === 'Series' ? handleDeleteSeries :
                    activeView === 'Categories' ? handleDeleteCategory :
                    activeView === 'Attributes' ? handleDeleteAttribute : handleDeleteAttributeSet
                }
                onViewSeries={(id) => { setSelectedSeriesId(id); setActiveView('SERIES_DETAIL'); }}
                userPermissions={currentUserRole?.permissions || []}
            />
        );
    };

    // --- Authentication Guard ---
    if (!currentUserId) {
        return <LoginScreen users={users} onLogin={handleLogin} />;
    }

    return (
        <div className="flex h-screen bg-zinc-50 dark:bg-black text-zinc-900 font-sans overflow-hidden">
            <ToastContainer toasts={toasts} removeToast={removeToast} />
            
            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-zinc-900 text-white z-30 flex items-center px-4 justify-between shadow-md">
                <div className="flex items-center gap-2">
                     <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                    </div>
                    <span className="font-bold text-lg tracking-tight">PIM Pro</span>
                </div>
                <button 
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="p-2 text-zinc-400 hover:text-white rounded-md hover:bg-zinc-800 transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                </button>
            </div>

            <Sidebar 
                activeView={activeView} 
                setActiveView={setActiveView}
                currentUser={currentUser}
                userRole={currentUserRole}
                availableUsers={users}
                onSwitchUser={(id) => setCurrentUserId(id)}
                isOpenMobile={isMobileMenuOpen}
                onCloseMobile={() => setIsMobileMenuOpen(false)}
                onLogout={handleLogout}
                unreadNotificationCount={notifications.filter(n => !n.isRead).length}
            />
            
            <main className="flex-1 overflow-auto pt-16 md:pt-0 relative w-full" id="main-content">
                <div className="max-w-7xl mx-auto p-4 md:p-8 pb-24">
                    {isLoading ? (
                         <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                         </div>
                    ) : error ? (
                        <div className="text-red-500 p-8 text-center bg-red-50 rounded-lg">{error}</div>
                    ) : (
                        renderContent()
                    )}
                </div>
                
                {isMutating && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/50 dark:bg-black/50 backdrop-blur-sm pointer-events-none">
                        <div className="bg-white dark:bg-zinc-900 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-zinc-900 dark:border-white"></div>
                            <span className="font-medium">処理中...</span>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
