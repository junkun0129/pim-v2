import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { DataProvider, useData } from './contexts/DataContext';
import MainLayout from './layouts/MainLayout';
import LoginScreen from './components/LoginScreen';

import SkuView from './components/master/SkuView';
import SkuDetailView from './components/master/SkuDetailView';
import GenericManager from './components/master/GenericManager';
import SeriesDetailView from './components/master/SeriesDetailView';
import OrderManager from './components/oms/OrderManager';
import EcService from './components/extensions/EcService';
import CreativeStudio from './components/extensions/CreativeStudio';
import WebCatalogManager from './components/extensions/WebCatalogManager';
import ProjectManager from './components/extensions/ProjectManager';
import ChannelExportManager from './components/extensions/ChannelExportManager';
import AdminPanel from './components/system/AdminPanel';
import ExtensionStore from './components/system/ExtensionStore';
import NotificationCenter from './components/system/NotificationCenter';

export default function App() {
    return (
        <DataProvider>
            <AppRoutes />
        </DataProvider>
    );
}

const AppRoutes = () => {
    const { currentUserId, users, handleLogin, isLoading } = useData();

    if (isLoading) return <div className="flex h-screen items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;

    if (!currentUserId) {
        return <LoginScreen users={users} onLogin={handleLogin} />;
    }

    return (
        <Routes>
            <Route path="/" element={<MainLayout />}>
                <Route index element={<Navigate to="/skus" replace />} />
                
                {/* Master Data */}
                <Route path="skus" element={<SkuRoute />} />
                <Route path="skus/:id" element={<SkuDetailRoute />} />
                <Route path="series" element={<SeriesRoute />} />
                <Route path="series/:id" element={<SeriesDetailRoute />} />
                <Route path="categories" element={<CategoryRoute />} />
                <Route path="attributes" element={<AttributeRoute />} />
                <Route path="sets" element={<AttributeSetRoute />} />

                {/* Operations & Extensions */}
                <Route path="orders" element={<OrderRoute />} />
                <Route path="ec" element={<EcRoute />} />
                <Route path="creative" element={<CreativeRoute />} />
                <Route path="catalog" element={<CatalogRoute />} />
                <Route path="projects" element={<ProjectRoute />} />
                <Route path="export" element={<ExportRoute />} />

                {/* System */}
                <Route path="admin" element={<AdminRoute />} />
                <Route path="store" element={<StoreRoute />} />
                <Route path="notifications" element={<NotificationRoute />} />
            </Route>
        </Routes>
    );
};

const SkuRoute = () => {
    const data = useData();
    return <SkuView {...data} dataMap={{ series: data.series, categories: data.categories, attributes: data.attributes, attributeSets: data.attributeSets }} 
        addSku={(s) => { data.setSkus([...data.skus, {...s, id: `sku-${Date.now()}`}]); data.addToast('success', 'Created'); }}
        updateSku={(s) => { data.setSkus(data.skus.map(old => old.id === s.id ? s : old)); data.addToast('success', 'Updated'); }}
        deleteSku={(id) => { data.setSkus(data.skus.filter(s => s.id !== id)); data.addToast('info', 'Deleted'); }}
        onViewSku={(id) => {}} 
        userPermissions={data.currentUserRole?.permissions || []}
    />
};

const SkuDetailRoute = () => { 
    const data = useData(); 
    return <SkuDetailView {...data} dataMap={data} onBack={() => window.history.back()} skus={data.skus} />; 
}

const SeriesRoute = () => { const data = useData(); return <GenericManager title="シリーズ" items={data.series} onAdd={(item) => data.setSeries([...data.series, {...item, id: `ser-${Date.now()}`}])} onDelete={(id) => data.setSeries(data.series.filter(s => s.id !== id))} dataMap={data} userPermissions={data.currentUserRole?.permissions || []} onViewSeries={(id) => window.location.href=`/series/${id}`} />; }
const SeriesDetailRoute = () => { const data = useData(); return <SeriesDetailView {...data} series={data.series[0]} childSkus={[]} dataMap={data} onBack={() => window.history.back()} onViewSku={() => {}} />; }
const CategoryRoute = () => { const data = useData(); return <GenericManager title="カテゴリ" items={data.categories} onAdd={(item) => data.setCategories([...data.categories, {...item, id: `cat-${Date.now()}`}])} onDelete={(id) => data.setCategories(data.categories.filter(c => c.id !== id))} dataMap={data} userPermissions={data.currentUserRole?.permissions || []} />; }
const AttributeRoute = () => { const data = useData(); return <GenericManager title="属性" items={data.attributes} onAdd={(item) => data.setAttributes([...data.attributes, {...item, id: `attr-${Date.now()}`}])} onDelete={(id) => data.setAttributes(data.attributes.filter(a => a.id !== id))} dataMap={data} userPermissions={data.currentUserRole?.permissions || []} />; }
const AttributeSetRoute = () => { const data = useData(); return <GenericManager title="属性セット" items={data.attributeSets} onAdd={(item) => data.setAttributeSets([...data.attributeSets, {...item, id: `set-${Date.now()}`}])} onDelete={(id) => data.setAttributeSets(data.attributeSets.filter(s => s.id !== id))} dataMap={data} userPermissions={data.currentUserRole?.permissions || []} />; }

const OrderRoute = () => { 
    const data = useData(); 
    const [currentBranchId, setCurrentBranchId] = React.useState('br1');
    return <OrderManager {...data} currentBranchId={currentBranchId} setCurrentBranchId={setCurrentBranchId} onCreateOrder={() => {}} onReplyComplaint={() => {}} onRegisterDriver={() => {}} onAssignDriver={() => {}} onTransferStock={() => {}} />; 
}
const EcRoute = () => { const data = useData(); return <EcService {...data} ecBranch={data.branches.find(b => b.type === 'EC')} onPlaceOrder={() => {}} />; }
const CreativeRoute = () => { const data = useData(); return <CreativeStudio skus={data.skus} branches={data.branches} onSaveAsset={() => {}} />; }
const CatalogRoute = () => { const data = useData(); return <WebCatalogManager {...data} onSaveCatalog={() => {}} onDeleteCatalog={() => {}} />; }
const ProjectRoute = () => { const data = useData(); return <ProjectManager {...data} onCreateProject={() => {}} onAddMember={() => {}} onCreateDraft={() => {}} onUpdateDraftStatus={() => {}} userRole={data.currentUserRole} />; }
const ExportRoute = () => { const data = useData(); return <ChannelExportManager {...data} channels={data.exportChannels} onAddChannel={() => {}} onUpdateChannel={() => {}} onDeleteChannel={() => {}} />; }
const AdminRoute = () => { const data = useData(); return <AdminPanel {...data} onUpdateUserRole={() => {}} onUpdateRole={() => {}} onCreateRole={() => {}} onDeleteRole={() => {}} />; }
const StoreRoute = () => { const data = useData(); return <ExtensionStore activeExtensions={data.currentUser?.activeExtensions || []} onToggleExtension={() => {}} />; }
const NotificationRoute = () => { const data = useData(); return <NotificationCenter notifications={data.notifications} users={data.users} onMarkAllRead={() => {}} onClearAll={() => {}} />; }