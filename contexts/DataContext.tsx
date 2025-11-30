import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Sku, Series, Category, Attribute, AttributeSet, Branch, Inventory, Order, CustomerOrder, Complaint, Driver, StockTransfer, WebCatalog, Project, SkuDraft, ExportChannel, User, Role, AppNotification, ToastMessage, ToastType } from '../types';
import { MOCK_SKUS, MOCK_SERIES, MOCK_CATEGORIES, MOCK_ATTRIBUTES, MOCK_ATTRIBUTE_SETS, MOCK_BRANCHES, MOCK_INVENTORY, MOCK_ORDERS, MOCK_CUSTOMER_ORDERS, MOCK_COMPLAINTS, MOCK_DRIVERS, MOCK_TRANSFERS, MOCK_USERS, MOCK_ROLES, MOCK_CATALOGS, MOCK_PROJECTS, MOCK_DRAFTS, MOCK_EXPORT_CHANNELS, MOCK_NOTIFICATIONS } from '../mockData';
import { APP_CONFIG } from '../config';
import { api } from '../api';

interface DataContextType {
    skus: Sku[]; setSkus: React.Dispatch<React.SetStateAction<Sku[]>>;
    series: Series[]; setSeries: React.Dispatch<React.SetStateAction<Series[]>>;
    categories: Category[]; setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
    attributes: Attribute[]; setAttributes: React.Dispatch<React.SetStateAction<Attribute[]>>;
    attributeSets: AttributeSet[]; setAttributeSets: React.Dispatch<React.SetStateAction<AttributeSet[]>>;
    branches: Branch[];
    inventory: Inventory[]; setInventory: React.Dispatch<React.SetStateAction<Inventory[]>>;
    orders: Order[]; setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
    customerOrders: CustomerOrder[]; setCustomerOrders: React.Dispatch<React.SetStateAction<CustomerOrder[]>>;
    complaints: Complaint[]; setComplaints: React.Dispatch<React.SetStateAction<Complaint[]>>;
    drivers: Driver[]; setDrivers: React.Dispatch<React.SetStateAction<Driver[]>>;
    transfers: StockTransfer[]; setTransfers: React.Dispatch<React.SetStateAction<StockTransfer[]>>;
    catalogs: WebCatalog[]; setCatalogs: React.Dispatch<React.SetStateAction<WebCatalog[]>>;
    projects: Project[]; setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
    drafts: SkuDraft[]; setDrafts: React.Dispatch<React.SetStateAction<SkuDraft[]>>;
    exportChannels: ExportChannel[]; setExportChannels: React.Dispatch<React.SetStateAction<ExportChannel[]>>;
    
    users: User[]; setUsers: React.Dispatch<React.SetStateAction<User[]>>;
    roles: Role[]; setRoles: React.Dispatch<React.SetStateAction<Role[]>>;
    currentUserId: string | null; setCurrentUserId: React.Dispatch<React.SetStateAction<string | null>>;
    currentUser: User | null;
    currentUserRole: Role | null;
    handleLogin: (id: string) => void;
    handleLogout: () => void;

    notifications: AppNotification[]; setNotifications: React.Dispatch<React.SetStateAction<AppNotification[]>>;
    logSystemAction: (type: AppNotification['type'], title: string, message: string) => void;

    isLoading: boolean;
    isMutating: boolean; setIsMutating: React.Dispatch<React.SetStateAction<boolean>>;
    toasts: ToastMessage[];
    addToast: (type: ToastType, message: string) => void;
    removeToast: (id: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const navigate = useNavigate();
    
    const [skus, setSkus] = useState<Sku[]>([]);
    const [series, setSeries] = useState<Series[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [attributes, setAttributes] = useState<Attribute[]>([]);
    const [attributeSets, setAttributeSets] = useState<AttributeSet[]>([]);
    
    const [branches, setBranches] = useState<Branch[]>([]);
    const [inventory, setInventory] = useState<Inventory[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [customerOrders, setCustomerOrders] = useState<CustomerOrder[]>([]);
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [transfers, setTransfers] = useState<StockTransfer[]>([]);
    
    const [catalogs, setCatalogs] = useState<WebCatalog[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [drafts, setDrafts] = useState<SkuDraft[]>([]);
    const [exportChannels, setExportChannels] = useState<ExportChannel[]>([]);
    
    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    
    const [isLoading, setIsLoading] = useState(false);
    const [isMutating, setIsMutating] = useState(false);
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const currentUser = useMemo(() => users.find(u => u.id === currentUserId) || null, [users, currentUserId]);
    const currentUserRole = useMemo(() => roles.find(r => r.id === currentUser?.roleId) || null, [roles, currentUser]);

    useEffect(() => {
        const loadData = async () => {
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
                    addToast('error', "データの読み込みに失敗しました");
                } finally {
                    setIsLoading(false);
                }
            }
        };
        loadData();
    }, []);

    const addToast = (type: ToastType, message: string) => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts(prev => [...prev, { id, type, message }]);
    };

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

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

    const handleLogin = (userId: string) => {
        setCurrentUserId(userId);
        addToast('success', 'ログインしました');
        navigate('/skus');
    };

    const handleLogout = () => {
        setIsLoading(true);
        setTimeout(() => {
            setCurrentUserId(null);
            setIsLoading(false);
            addToast('info', 'ログアウトしました');
            navigate('/');
        }, 500);
    };

    const value = {
        skus, setSkus, series, setSeries, categories, setCategories, attributes, setAttributes, attributeSets, setAttributeSets,
        branches, inventory, setInventory, orders, setOrders, customerOrders, setCustomerOrders, complaints, setComplaints,
        drivers, setDrivers, transfers, setTransfers, catalogs, setCatalogs, projects, setProjects, drafts, setDrafts,
        exportChannels, setExportChannels, users, setUsers, roles, setRoles,
        currentUserId, setCurrentUserId, currentUser, currentUserRole,
        handleLogin, handleLogout, notifications, setNotifications, logSystemAction,
        isLoading, isMutating, setIsMutating, toasts, addToast, removeToast
    };

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};