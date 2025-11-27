
import React, { useState, useRef, useEffect } from 'react';
import type { Project, ChatMessage, BrainstormIdea, User } from '../types';
import Card from './ui/Card';
import Button from './ui/Button';
import Input from './ui/Input';
import Badge from './ui/Badge';
import { ICONS } from '../constants';
import { MOCK_USERS } from '../mockData';

interface ProjectManagerProps {
    projects: Project[];
    onCreateProject: (project: Omit<Project, 'id' | 'createdAt' | 'status'>) => void;
    currentUserId: string; // Mock user ID for simulation
    // Chat & Ideas would ideally be props if managed in App.tsx, but local state for this demo is fine
}

// Mock initial data passed from App or internal
import { MOCK_CHAT_MESSAGES, MOCK_IDEAS } from '../mockData';

export default function ProjectManager({ projects, onCreateProject, currentUserId }: ProjectManagerProps) {
    const [viewMode, setViewMode] = useState<'LIST' | 'DETAIL'>('LIST');
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'CHAT' | 'BRAINSTORM' | 'DRAFTS'>('CHAT');

    // Local State for Collaboration
    const [messages, setMessages] = useState<ChatMessage[]>(MOCK_CHAT_MESSAGES);
    const [ideas, setIdeas] = useState<BrainstormIdea[]>(MOCK_IDEAS);
    
    // Inputs
    const [chatInput, setChatInput] = useState('');
    const [ideaInput, setIdeaInput] = useState('');
    const [newProjectName, setNewProjectName] = useState('');
    const [newProjectDesc, setNewProjectDesc] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const chatContainerRef = useRef<HTMLDivElement>(null);

    const selectedProject = projects.find(p => p.id === selectedProjectId);
    const projectMessages = messages.filter(m => m.projectId === selectedProjectId);
    const projectIdeas = ideas.filter(i => i.projectId === selectedProjectId);

    // Auto-scroll chat
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [projectMessages, activeTab]);

    const getUser = (id: string) => MOCK_USERS.find(u => u.id === id) || { name: 'Unknown', avatarUrl: '' };

    const handleCreateProject = () => {
        if (newProjectName) {
            onCreateProject({
                name: newProjectName,
                description: newProjectDesc,
                memberIds: [currentUserId]
            });
            setIsCreateModalOpen(false);
            setNewProjectName('');
            setNewProjectDesc('');
        }
    };

    const handleSendMessage = () => {
        if (!chatInput.trim() || !selectedProjectId) return;
        const newMsg: ChatMessage = {
            id: `msg-${Date.now()}`,
            projectId: selectedProjectId,
            userId: currentUserId,
            content: chatInput,
            timestamp: new Date().toLocaleString()
        };
        setMessages(prev => [...prev, newMsg]);
        setChatInput('');
    };

    const handleAddIdea = (color: BrainstormIdea['color'] = 'yellow') => {
        if (!ideaInput.trim() || !selectedProjectId) return;
        const newIdea: BrainstormIdea = {
            id: `idea-${Date.now()}`,
            projectId: selectedProjectId,
            userId: currentUserId,
            content: ideaInput,
            color,
            votes: 0
        };
        setIdeas(prev => [...prev, newIdea]);
        setIdeaInput('');
    };

    const handleVoteIdea = (ideaId: string) => {
        setIdeas(prev => prev.map(idea => 
            idea.id === ideaId ? { ...idea, votes: idea.votes + 1 } : idea
        ));
    };

    // --- Renderers ---

    const renderProjectList = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        {ICONS.users} プロジェクト管理
                    </h1>
                    <p className="text-slate-500">チームで協力して新しいSKUやシリーズを企画・開発します</p>
                </div>
                <Button onClick={() => setIsCreateModalOpen(true)}>
                    {ICONS.plus} 新規プロジェクト
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map(project => (
                    <Card key={project.id} className="group hover:shadow-xl transition-all duration-300 border-l-4 border-l-blue-500 flex flex-col h-full">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">{project.name}</h3>
                            <Badge color={project.status === 'PLANNING' ? 'gray' : project.status === 'IN_PROGRESS' ? 'blue' : 'green'}>
                                {project.status}
                            </Badge>
                        </div>
                        <p className="text-sm text-slate-500 mb-6 flex-1">{project.description}</p>
                        
                        <div className="flex items-center justify-between mt-auto">
                            <div className="flex -space-x-2">
                                {project.memberIds.map(uid => (
                                    <img 
                                        key={uid} 
                                        src={getUser(uid).avatarUrl} 
                                        alt={getUser(uid).name}
                                        title={getUser(uid).name}
                                        className="w-8 h-8 rounded-full border-2 border-white dark:border-zinc-800"
                                    />
                                ))}
                            </div>
                            <Button size="sm" variant="secondary" onClick={() => { setSelectedProjectId(project.id); setViewMode('DETAIL'); }}>
                                プロジェクトを開く
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Create Modal (Simple inline for now) */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-zinc-900 w-full max-w-md p-6 rounded-xl shadow-2xl">
                        <h3 className="text-lg font-bold mb-4 text-slate-800 dark:text-white">プロジェクト作成</h3>
                        <div className="space-y-4">
                            <Input label="プロジェクト名" value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} />
                            <Input label="概要" value={newProjectDesc} onChange={(e) => setNewProjectDesc(e.target.value)} />
                            <div className="flex justify-end gap-2 pt-2">
                                <Button variant="secondary" onClick={() => setIsCreateModalOpen(false)}>キャンセル</Button>
                                <Button onClick={handleCreateProject}>作成</Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    const renderChat = () => (
        <div className="flex flex-col h-[600px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
            {/* Header */}
            <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 flex items-center gap-2 shrink-0">
                {ICONS.chat} <span className="font-bold text-slate-700 dark:text-slate-200">チームチャット</span>
            </div>
            
            {/* Messages */}
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-black/20">
                {projectMessages.length === 0 ? (
                    <div className="text-center text-slate-400 py-10">メッセージはまだありません。会話を始めましょう！</div>
                ) : (
                    projectMessages.map(msg => {
                        const isMe = msg.userId === currentUserId;
                        const user = getUser(msg.userId);
                        return (
                            <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                                <img src={user.avatarUrl} className="w-8 h-8 rounded-full mt-1" alt={user.name} title={user.name} />
                                <div className={`max-w-[70%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                                    <div className={`px-4 py-2 rounded-2xl text-sm ${isMe ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-slate-800 dark:text-slate-200 rounded-tl-none shadow-sm'}`}>
                                        {msg.content}
                                    </div>
                                    <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.timestamp}</span>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Input - Fixed at bottom */}
            <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shrink-0">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="メッセージを入力..."
                        className="flex-1 bg-slate-100 dark:bg-zinc-800 border-0 rounded-full px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 dark:text-white"
                    />
                    <button 
                        onClick={handleSendMessage}
                        className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-md"
                    >
                        {ICONS.send}
                    </button>
                </div>
            </div>
        </div>
    );

    const renderBrainstorming = () => (
        <div className="h-[600px] flex flex-col gap-4">
            <div className="flex gap-2 bg-white dark:bg-zinc-900 p-4 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 shrink-0">
                <Input 
                    value={ideaInput} 
                    onChange={(e) => setIdeaInput(e.target.value)} 
                    placeholder="新しいアイデアを入力..." 
                    className="flex-1"
                />
                <div className="flex gap-1">
                    <button onClick={() => handleAddIdea('yellow')} className="w-8 h-10 bg-yellow-200 hover:bg-yellow-300 rounded border border-yellow-300" title="Add Yellow Note"></button>
                    <button onClick={() => handleAddIdea('blue')} className="w-8 h-10 bg-blue-200 hover:bg-blue-300 rounded border border-blue-300" title="Add Blue Note"></button>
                    <button onClick={() => handleAddIdea('pink')} className="w-8 h-10 bg-pink-200 hover:bg-pink-300 rounded border border-pink-300" title="Add Pink Note"></button>
                    <button onClick={() => handleAddIdea('green')} className="w-8 h-10 bg-green-200 hover:bg-green-300 rounded border border-green-300" title="Add Green Note"></button>
                </div>
            </div>

            <div className="flex-1 bg-slate-100 dark:bg-zinc-900/50 rounded-xl border-2 border-dashed border-slate-300 dark:border-zinc-800 p-6 overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {projectIdeas.map(idea => {
                        const colors = {
                            yellow: 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800 text-yellow-900 dark:text-yellow-100',
                            blue: 'bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100',
                            pink: 'bg-pink-100 dark:bg-pink-900/30 border-pink-200 dark:border-pink-800 text-pink-900 dark:text-pink-100',
                            green: 'bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-900 dark:text-green-100',
                        };
                        const user = getUser(idea.userId);

                        return (
                            <div key={idea.id} className={`${colors[idea.color]} p-4 rounded-lg shadow-sm border transform hover:-translate-y-1 transition-transform relative group`}>
                                <div className="flex items-center gap-2 mb-2 opacity-70">
                                    <img src={user.avatarUrl} className="w-5 h-5 rounded-full" alt="" />
                                    <span className="text-xs font-bold">{user.name}</span>
                                </div>
                                <p className="font-medium text-sm min-h-[60px]">{idea.content}</p>
                                <div className="mt-3 flex justify-between items-center border-t border-black/5 pt-2">
                                    <button 
                                        onClick={() => handleVoteIdea(idea.id)}
                                        className="text-xs font-bold flex items-center gap-1 hover:bg-black/5 px-2 py-1 rounded transition-colors"
                                    >
                                        👍 {idea.votes}
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    );

    // --- View Controller ---

    if (viewMode === 'LIST') {
        return renderProjectList();
    }

    if (!selectedProject) return null;

    return (
        <div className="h-full flex flex-col -m-6 md:-m-10">
            {/* Project Header */}
            <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-6 py-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => setViewMode('LIST')}>&larr; プロジェクト一覧</Button>
                    <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-700"></div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white">{selectedProject.name}</h2>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                             <span className={`w-2 h-2 rounded-full ${selectedProject.status === 'IN_PROGRESS' ? 'bg-blue-500' : 'bg-gray-400'}`}></span>
                             {selectedProject.status}
                        </div>
                    </div>
                </div>
                <div className="flex -space-x-2">
                     {selectedProject.memberIds.map(uid => (
                        <img 
                            key={uid} 
                            src={getUser(uid).avatarUrl} 
                            alt={getUser(uid).name}
                            className="w-8 h-8 rounded-full border-2 border-white dark:border-zinc-900"
                            title={getUser(uid).name}
                        />
                    ))}
                    <button className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 border-2 border-white dark:border-zinc-900 flex items-center justify-center text-xs text-slate-500 hover:bg-slate-200">+</button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-zinc-200 dark:border-zinc-800 px-6 bg-white dark:bg-zinc-900 shrink-0">
                 <button
                    onClick={() => setActiveTab('CHAT')}
                    className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'CHAT' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                >
                    {ICONS.chat} チャット
                </button>
                <button
                    onClick={() => setActiveTab('BRAINSTORM')}
                    className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'BRAINSTORM' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                >
                    {ICONS.bulb} アイデアボード
                </button>
                 <button
                    onClick={() => setActiveTab('DRAFTS')}
                    className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'DRAFTS' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                >
                    {ICONS.list} SKUドラフト
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-auto p-6 bg-slate-50 dark:bg-black">
                <div className="max-w-6xl mx-auto h-full">
                    {activeTab === 'CHAT' && renderChat()}
                    {activeTab === 'BRAINSTORM' && renderBrainstorming()}
                    {activeTab === 'DRAFTS' && (
                        <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700">
                            <p className="text-slate-400">このプロジェクトに関連付けられたSKUドラフトはまだありません。</p>
                            <Button className="mt-4" variant="secondary">SKUドラフトを作成</Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
