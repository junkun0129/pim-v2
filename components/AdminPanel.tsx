
import React, { useState } from 'react';
import type { User, Role, Permission } from '../types';
import Card from './ui/Card';
import Button from './ui/Button';
import Badge from './ui/Badge';
import Input from './ui/Input';
import Modal from './ui/Modal';
import { ICONS } from '../constants';

interface AdminPanelProps {
    users: User[];
    roles: Role[];
    onUpdateUserRole: (userId: string, roleId: string) => void;
    onUpdateRole: (role: Role) => void;
    onCreateRole: (role: Omit<Role, 'id'>) => void;
    onDeleteRole: (roleId: string) => void;
}

const PERMISSION_GROUPS = [
    {
        label: 'Master Data System',
        permissions: [
            { key: 'MASTER_VIEW', label: '閲覧 (View)' },
            { key: 'MASTER_CREATE', label: '作成 (Create)' },
            { key: 'MASTER_EDIT', label: '編集 (Edit)' },
            { key: 'MASTER_DELETE', label: '削除 (Delete)' },
            { key: 'MASTER_IMPORT', label: 'インポート (Import)' },
            { key: 'MASTER_EXPORT', label: 'エクスポート (Channel Export)' },
        ]
    },
    {
        label: 'Order Management System (OMS)',
        permissions: [
            { key: 'OMS_VIEW', label: '閲覧 (View)' },
            { key: 'OMS_ORDER_CREATE', label: '発注作成 (Create Order)' },
        ]
    },
    {
        label: 'EC System',
        permissions: [
            { key: 'EC_VIEW', label: '閲覧 (View)' },
            { key: 'EC_MANAGE', label: '管理 (Manage)' },
        ]
    },
    {
        label: 'Creative System (POP)',
        permissions: [
            { key: 'CREATIVE_VIEW', label: '閲覧 (View)' },
            { key: 'CREATIVE_EDIT', label: '編集 (Edit)' },
        ]
    },
    {
        label: 'Web Catalog System',
        permissions: [
            { key: 'CATALOG_VIEW', label: '閲覧 (View)' },
            { key: 'CATALOG_EDIT', label: '編集 (Edit)' },
        ]
    },
    {
        label: 'Project System',
        permissions: [
            { key: 'PROJECT_VIEW', label: '閲覧 (View)' },
            { key: 'PROJECT_CREATE', label: '作成 (Create)' },
            { key: 'PROJECT_EDIT', label: '編集/メンバー追加 (Edit)' },
        ]
    },
    {
        label: 'Administration',
        permissions: [
            { key: 'ADMIN_VIEW', label: '管理画面アクセス (Access)' },
            { key: 'ADMIN_MANAGE', label: '全権限管理 (Full Manage)' },
        ]
    }
];

export default function AdminPanel({ users, roles, onUpdateUserRole, onUpdateRole, onCreateRole, onDeleteRole }: AdminPanelProps) {
    const [activeTab, setActiveTab] = useState<'USERS' | 'ROLES'>('USERS');
    
    // Role Modal State
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [tempRoleData, setTempRoleData] = useState<{
        name: string;
        description: string;
        permissions: Permission[];
    }>({ name: '', description: '', permissions: [] });

    const handleOpenCreateRole = () => {
        setEditingRole(null);
        setTempRoleData({ name: '', description: '', permissions: [] });
        setIsRoleModalOpen(true);
    };

    const handleOpenEditRole = (role: Role) => {
        setEditingRole(role);
        setTempRoleData({
            name: role.name,
            description: role.description || '',
            permissions: [...role.permissions]
        });
        setIsRoleModalOpen(true);
    };

    const handleSaveRole = () => {
        if (!tempRoleData.name) return;

        if (editingRole) {
            // Update
            onUpdateRole({
                ...editingRole,
                name: tempRoleData.name,
                description: tempRoleData.description,
                permissions: tempRoleData.permissions
            });
        } else {
            // Create
            onCreateRole({
                name: tempRoleData.name,
                description: tempRoleData.description,
                permissions: tempRoleData.permissions
            });
        }
        setIsRoleModalOpen(false);
    };

    const handleDeleteRoleConfirm = (roleId: string) => {
        if (window.confirm('本当にこのロールを削除しますか？\n(このロールが割り当てられているユーザーがいる場合、エラーになります)')) {
            onDeleteRole(roleId);
        }
    };

    const toggleTempPermission = (perm: Permission) => {
        setTempRoleData(prev => {
            const has = prev.permissions.includes(perm);
            return {
                ...prev,
                permissions: has 
                    ? prev.permissions.filter(p => p !== perm)
                    : [...prev.permissions, perm]
            };
        });
    };

    const renderUserManagement = () => (
        <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">ユーザー管理</h2>
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
                <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-400">
                        <tr>
                            <th className="px-6 py-3">ユーザー</th>
                            <th className="px-6 py-3">現在のロール (権限)</th>
                            <th className="px-6 py-3">操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => {
                            const userRole = roles.find(r => r.id === user.roleId);
                            return (
                                <tr key={user.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700">
                                    <td className="px-6 py-4 flex items-center gap-3">
                                        <img src={user.avatarUrl} alt="" className="w-8 h-8 rounded-full" />
                                        <span className="font-medium text-slate-900 dark:text-white">{user.name}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {userRole ? (
                                            <Badge color="blue">{userRole.name}</Badge>
                                        ) : (
                                            <Badge color="red">未設定</Badge>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <select 
                                            value={user.roleId}
                                            onChange={(e) => onUpdateUserRole(user.id, e.target.value)}
                                            className="bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 dark:bg-slate-700 dark:border-slate-600 dark:placeholder-slate-400 dark:text-white"
                                        >
                                            {roles.map(role => (
                                                <option key={role.id} value={role.id}>{role.name}</option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderRoleManagement = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-slate-800 dark:text-white">ロールと権限設定</h2>
                <Button onClick={handleOpenCreateRole}>
                    {ICONS.plus} 新規ロール作成
                </Button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {roles.map(role => (
                    <Card key={role.id} className="flex flex-col h-full">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{role.name}</h3>
                                <p className="text-sm text-slate-500">{role.description}</p>
                            </div>
                            {role.id === 'role_admin' && <Badge color="purple">System</Badge>}
                        </div>
                        
                        <div className="space-y-2 mb-6 flex-1">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">アクセス権限</h4>
                            <div className="flex flex-wrap gap-2">
                                <span className="text-xs text-slate-500 bg-slate-100 dark:bg-zinc-800 px-2 py-1 rounded">
                                    {role.permissions.length} 権限付与済み
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-2 pt-4 border-t border-slate-100 dark:border-zinc-800 mt-auto">
                            <Button size="sm" variant="secondary" onClick={() => handleOpenEditRole(role)} className="flex-1">
                                編集
                            </Button>
                            {role.id !== 'role_admin' && (
                                <Button size="sm" variant="ghost" onClick={() => handleDeleteRoleConfirm(role.id)} className="text-red-500 hover:bg-red-50 hover:text-red-600">
                                    削除
                                </Button>
                            )}
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        {ICONS.settings} システム管理
                    </h1>
                    <p className="text-slate-500">ユーザーの役割とアクセス権限を管理します</p>
                </div>
            </div>

            <div className="flex border-b border-zinc-200 dark:border-zinc-700">
                <button
                    onClick={() => setActiveTab('USERS')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'USERS' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    ユーザー一覧
                </button>
                <button
                    onClick={() => setActiveTab('ROLES')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'ROLES' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    ロール設定
                </button>
            </div>

            {activeTab === 'USERS' ? renderUserManagement() : renderRoleManagement()}

            {/* Role Editor Modal */}
            <Modal 
                isOpen={isRoleModalOpen} 
                onClose={() => setIsRoleModalOpen(false)} 
                title={editingRole ? 'ロール編集' : '新規ロール作成'}
                maxWidth="max-w-4xl"
            >
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input 
                            label="ロール名" 
                            value={tempRoleData.name} 
                            onChange={(e) => setTempRoleData(prev => ({...prev, name: e.target.value}))} 
                            placeholder="例: 商品マネージャー"
                        />
                        <Input 
                            label="説明" 
                            value={tempRoleData.description} 
                            onChange={(e) => setTempRoleData(prev => ({...prev, description: e.target.value}))} 
                            placeholder="例: 全ての商品データへのアクセス権限"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">権限の割り当て</label>
                        <div className="space-y-4">
                            {PERMISSION_GROUPS.map(group => (
                                <div key={group.label} className="bg-slate-50 dark:bg-zinc-800/50 rounded-lg border border-slate-100 dark:border-zinc-800 overflow-hidden">
                                    <div className="px-4 py-2 bg-slate-100 dark:bg-zinc-800 border-b border-slate-200 dark:border-zinc-700">
                                        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">{group.label}</h4>
                                    </div>
                                    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {group.permissions.map(perm => {
                                            const isEnabled = tempRoleData.permissions.includes(perm.key as Permission);
                                            // Prevent disabling Admin access for the Admin role to avoid lockout
                                            const isLocked = editingRole?.id === 'role_admin' && perm.key === 'ADMIN_MANAGE';
                                            
                                            return (
                                                <label key={perm.key} className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-all ${isEnabled ? 'bg-white dark:bg-zinc-700 shadow-sm ring-1 ring-blue-500/20' : 'hover:bg-white dark:hover:bg-zinc-700'}`}>
                                                    <div className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${isEnabled ? 'bg-blue-500 border-blue-500' : 'bg-white border-slate-300 dark:bg-zinc-900 dark:border-zinc-600'}`}>
                                                        {isEnabled && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                                                    </div>
                                                    <input 
                                                        type="checkbox" 
                                                        className="hidden"
                                                        checked={isEnabled}
                                                        disabled={isLocked}
                                                        onChange={() => !isLocked && toggleTempPermission(perm.key as Permission)}
                                                    />
                                                    <span className={`text-xs font-medium ${isEnabled ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>
                                                        {perm.label}
                                                    </span>
                                                </label>
                                            )
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t dark:border-zinc-800">
                        <Button variant="secondary" onClick={() => setIsRoleModalOpen(false)}>キャンセル</Button>
                        <Button onClick={handleSaveRole} disabled={!tempRoleData.name}>保存</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
