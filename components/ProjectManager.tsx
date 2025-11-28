import React, { useState, useRef, useEffect } from 'react';
import type { Project, ChatMessage, BrainstormIdea, User, SkuDraft, DraftStatus, FileAttachment, Role } from '../types';
import Card from './ui/Card';
import Button from './ui/Button';
import Input from './ui/Input';
import Badge from './ui/Badge';
import Modal from './ui/Modal';
import { ICONS } from '../constants';
import { MOCK_CHAT_MESSAGES, MOCK_IDEAS } from '../mockData';

interface ProjectManagerProps {
    projects: Project[];
    onCreateProject: (project: Omit<Project, 'id' | 'createdAt' | 'status'>) => void;
    onAddMember: (projectId: string, userId: string) => void;
    currentUserId: string;
    userRole: Role | null;
    users: User[];
    drafts: SkuDraft[];
    onCreateDraft: (draft: Omit<SkuDraft, 'id' | 'createdAt' | 'authorId'>) => void;
    onUpdateDraftStatus: (draftId: string, status: DraftStatus) => void;
}

export default function ProjectManager({ projects, onCreateProject, onAddMember, currentUserId, userRole, users, drafts, onCreateDraft, onUpdateDraftStatus }: ProjectManagerProps) {
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
    
    // Idea Attachments
    const [pendingAttachments, setPendingAttachments] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Chat Mentions
    const [isMentionModalOpen, setIsMentionModalOpen] = useState(false);
    const [mentionType, setMentionType] = useState<'ALL' | 'USER_ONLY'>('ALL'); // To distinguish @ vs #
    
    // Add Member Modal
    const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
    const [selectedNewMember, setSelectedNewMember] = useState('');

    // Draft Create Modal
    const [isDraftModalOpen, setIsDraftModalOpen] = useState(false);
    const [draftName, setDraftName] = useState('');
    const [draftSkuId, setDraftSkuId] = useState('');
    const [draftPrice, setDraftPrice] = useState<string>('');
    const [draftDesc, setDraftDesc] = useState('');
    const [linkedIdeaId, setLinkedIdeaId] = useState<string | undefined>(undefined);

    const chatContainerRef = useRef<HTMLDivElement>(null);

    const selectedProject = projects.find(p => p.id === selectedProjectId);
    const projectMessages = messages.filter(m => m.projectId === selectedProjectId);
    const projectIdeas = ideas.filter(i => i.projectId === selectedProjectId);
    const projectDrafts = drafts.filter(d => d.projectId === selectedProjectId);

    // Permissions
    const canCreateProject = userRole?.permissions.includes('PROJECT_CREATE');
    const canAddMember = userRole?.permissions.includes('PROJECT_EDIT');

    // Auto-scroll chat
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [projectMessages, activeTab]);

    const getUser = (id: string) => users.find(u => u.id === id) || { name: 'Unknown', avatarUrl: '' };

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

    const handleAddMember = () => {
        if (selectedProjectId && selectedNewMember) {
            onAddMember(selectedProjectId, selectedNewMember);
            setIsAddMemberModalOpen(false);
            setSelectedNewMember('');
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

    // Chat Input Change Handler for Mentions
    const handleChatInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setChatInput(value);
        
        // Check for triggers
        const lastChar = value.slice(-1);
        if (lastChar === '@') {
            setMentionType('USER_ONLY');
            setIsMentionModalOpen(true);
        } else if (lastChar === '#') {
            setMentionType('ALL');
            setIsMentionModalOpen(true);
        } else if (value === '' || value.slice(-1) === ' ') {
            setIsMentionModalOpen(false);
        }
    };

    const handleInsertMention = (type: 'IDEA' | 'DRAFT' | 'USER', item: any) => {
        // Remove the trigger char (@ or #) if it was just typed
        let cleanInput = chatInput;
        if (cleanInput.endsWith('@') || cleanInput.endsWith('#')) {
            cleanInput = cleanInput.slice(0, -1);
        }

        const tag = `[#${type}:${item.id}:${item.content || item.name}]`;
        setChatInput(cleanInput + tag + ' ');
        setIsMentionModalOpen(false);
    };

    // Render message content with clickable mentions
    const renderMessageContent = (content: string) => {
        // Regex to match [#TYPE:ID:NAME]
        const parts = content.split(/(\[#(?:IDEA|DRAFT|USER):[^\]]+\])/g);
        
        return parts.map((part, i) => {
            const match = part.match(/^\[#(IDEA|DRAFT|USER):([^:]+):(.+)\]$/);
            if (match) {
                const [_, type, id, name] = match;
                let color = '';
                if (type === 'IDEA') color = 'text-blue-500 bg-blue-50 dark:bg-blue-900/30';
                else if (type === 'DRAFT') color = 'text-purple-500 bg-purple-50 dark:bg-purple-900/30';
                else if (type === 'USER') color = 'text-green-500 bg-green-50 dark:bg-green-900/30';

                return (
                    <span 
                        key={i} 
                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-bold cursor-pointer hover:underline ${color}`}
                        onClick={() => {
                            if (type === 'IDEA') setActiveTab('BRAINSTORM');
                            if (type === 'DRAFT') setActiveTab('DRAFTS');
                            // User could open profile or filter chat
                        }}
                    >
                        {type === 'IDEA' ? ICONS.bulb : type === 'DRAFT' ? ICONS.list : '@'}
                        {name}
                    </span>
                );
            }
            return <span key={i}>{part}</span>;
        });
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setPendingAttachments(Array.from(e.target.files));
        }
    };

    const handleAddIdea = (color: BrainstormIdea['color'] = 'yellow') => {
        if (!ideaInput.trim() || !selectedProjectId) return;
        
        const attachments: FileAttachment[] = pendingAttachments.map((file, i) => ({
            id: `att-${Date.now()}-${i}`,
            name: file.name,
            type: file.type.startsWith('image/') ? 'IMAGE' : file.type.startsWith('video/') ? 'VIDEO' : 'FILE',
            url: URL.createObjectURL(file), 
            size: `${(file.size / 1024).toFixed(1)} KB`
        }));

        const newIdea: BrainstormIdea = {
            id: `idea-${Date.now()}`,
            projectId: selectedProjectId,
            userId: currentUserId,
            content: ideaInput,
            color,
            votes: 0,
            attachments
        };
        setIdeas(prev => [...prev, newIdea]);
        setIdeaInput('');
        setPendingAttachments([]);
    };

    const handleVoteIdea = (ideaId: string) => {
        setIdeas(prev => prev.map(idea => 
            idea.id === ideaId ? { ...idea, votes: idea.votes + 1 } : idea
        ));
    };

    const handleConvertIdeaToDraft = (idea: BrainstormIdea) => {
        setLinkedIdeaId(idea.id);
        setDraftName(idea.content.length > 20 ? idea.content.substring(0, 20) + '...' : idea.content);
        setDraftDesc(`From Idea: ${idea.content}`);
        setIsDraftModalOpen(true);
        setActiveTab('DRAFTS');
    };

    const handleCreateDraft = () => {
        if (selectedProjectId && draftName) {
            const draftData: any = {
                projectId: selectedProjectId,
                name: draftName,
                proposedSkuId: draftSkuId,
                price: parseInt(draftPrice) || undefined,
                description: draftDesc,
                status: 'PROPOSAL',
                linkedIdeaId
            };
            
            onCreateDraft(draftData);
            
            if (linkedIdeaId) {
                setIdeas(prev => prev.map(i => i.id === linkedIdeaId ? { ...i, linkedDraftId: 'pending' } : i));
            }

            setIsDraftModalOpen(false);
            setDraftName('');
            setDraftSkuId('');
            setDraftPrice('');
            setDraftDesc('');
            setLinkedIdeaId(undefined);
        }
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
                {canCreateProject && (
                    <Button onClick={() => setIsCreateModalOpen(true)}>
                        {ICONS.plus} 新規プロジェクト
                    </Button>
                )}
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

            {/* Create Modal */}
            {isCreateModalOpen && (
                <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="プロジェクト作成">
                    <div className="space-y-4">
                        <Input label="プロジェクト名" value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} />
                        <Input label="概要" value={newProjectDesc} onChange={(e) => setNewProjectDesc(e.target.value)} />
                        <div className="flex justify-end gap-2 pt-2">
                            <Button variant="secondary" onClick={() => setIsCreateModalOpen(false)}>キャンセル</Button>
                            <Button onClick={handleCreateProject}>作成</Button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );

    const renderChat = () => (
        <div className="flex flex-col h-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
            {/* Header */}
            <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 flex items-center gap-2 shrink-0">
                {ICONS.chat} <span className="font-bold text-slate-700 dark:text-slate-200">チームチャット</span>
            </div>
            
            {/* Messages (Scrollable) */}
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
                                        {renderMessageContent(msg.content)}
                                    </div>
                                    <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.timestamp}</span>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Input - Sticky Bottom */}
            <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shrink-0 relative z-20">
                <div className="flex gap-2 items-center">
                    <button 
                        onClick={() => {
                            setMentionType('ALL');
                            setIsMentionModalOpen(true);
                        }}
                        className="p-2 text-zinc-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-zinc-800 rounded-full transition-colors"
                        title="アイデアやドラフトを引用"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                    </button>
                    <input
                        type="text"
                        value={chatInput}
                        onChange={handleChatInputChange}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="@ユーザー, #アイデア, メッセージ..."
                        className="flex-1 bg-slate-100 dark:bg-zinc-800 border-0 rounded-full px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 dark:text-white"
                    />
                    <button 
                        onClick={handleSendMessage}
                        className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-md"
                    >
                        {ICONS.send}
                    </button>
                </div>

                {/* Mention Picker Modal (Popover) */}
                {isMentionModalOpen && (
                     <>
                        <div className="fixed inset-0 z-30" onClick={() => setIsMentionModalOpen(false)}></div>
                        <div className="absolute bottom-full left-4 mb-2 w-72 bg-white dark:bg-zinc-800 rounded-lg shadow-xl border border-zinc-200 dark:border-zinc-700 z-40 overflow-hidden flex flex-col max-h-64">
                            <div className="px-3 py-2 bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-100 dark:border-zinc-700 text-xs font-bold text-zinc-500 uppercase">
                                引用するアイテムを選択
                            </div>
                            <div className="overflow-y-auto p-1">
                                {(mentionType === 'ALL' || mentionType === 'USER_ONLY') && (
                                    <>
                                        <div className="text-[10px] text-zinc-400 px-2 py-1">ユーザー</div>
                                        {users.map(u => (
                                            <button
                                                key={u.id}
                                                onClick={() => handleInsertMention('USER', u)}
                                                className="w-full text-left px-2 py-1.5 text-xs hover:bg-green-50 dark:hover:bg-green-900/20 rounded flex items-center gap-2 truncate"
                                            >
                                                <img src={u.avatarUrl} className="w-4 h-4 rounded-full" alt="" /> {u.name}
                                            </button>
                                        ))}
                                    </>
                                )}
                                
                                {mentionType === 'ALL' && (
                                    <>
                                        <div className="text-[10px] text-zinc-400 px-2 py-1 mt-1 border-t border-zinc-100 dark:border-zinc-700">アイデア</div>
                                        {projectIdeas.map(idea => (
                                            <button 
                                                key={idea.id}
                                                onClick={() => handleInsertMention('IDEA', idea)}
                                                className="w-full text-left px-2 py-1.5 text-xs hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded flex items-center gap-2 truncate"
                                            >
                                                {ICONS.bulb} {idea.content}
                                            </button>
                                        ))}
                                        <div className="text-[10px] text-zinc-400 px-2 py-1 mt-1 border-t border-zinc-100 dark:border-zinc-700">SKUドラフト</div>
                                        {projectDrafts.map(draft => (
                                            <button 
                                                key={draft.id}
                                                onClick={() => handleInsertMention('DRAFT', draft)}
                                                className="w-full text-left px-2 py-1.5 text-xs hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded flex items-center gap-2 truncate"
                                            >
                                                {ICONS.list} {draft.name}
                                            </button>
                                        ))}
                                    </>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );

    const renderBrainstorming = () => (
        <div className="h-full flex flex-col gap-4">
            <div className="flex flex-col gap-2 bg-white dark:bg-zinc-900 p-4 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 shrink-0">
                <div className="flex gap-2">
                    <Input 
                        value={ideaInput} 
                        onChange={(e) => setIdeaInput(e.target.value)} 
                        placeholder="新しいアイデアを入力..." 
                        className="flex-1"
                    />
                    <div className="flex gap-1">
                        <button onClick={() => handleAddIdea('yellow')} className="w-8 h-10 bg-yellow-200 hover:bg-yellow-300 rounded border border-yellow-300 transition-transform hover:-translate-y-1" title="Add Yellow Note"></button>
                        <button onClick={() => handleAddIdea('blue')} className="w-8 h-10 bg-blue-200 hover:bg-blue-300 rounded border border-blue-300 transition-transform hover:-translate-y-1" title="Add Blue Note"></button>
                        <button onClick={() => handleAddIdea('pink')} className="w-8 h-10 bg-pink-200 hover:bg-pink-300 rounded border border-pink-300 transition-transform hover:-translate-y-1" title="Add Pink Note"></button>
                        <button onClick={() => handleAddIdea('green')} className="w-8 h-10 bg-green-200 hover:bg-green-300 rounded border border-green-300 transition-transform hover:-translate-y-1" title="Add Green Note"></button>
                    </div>
                </div>
                
                {/* File Attachment UI */}
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs flex items-center gap-1 text-slate-500 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 px-2 py-1 rounded border border-slate-200 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
                        ファイル添付 (画像/動画)
                    </button>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        onChange={handleFileSelect} 
                        multiple 
                    />
                    {pendingAttachments.length > 0 && (
                        <div className="flex gap-2 overflow-x-auto">
                            {pendingAttachments.map((f, i) => (
                                <span key={i} className="text-xs bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-slate-600 flex items-center gap-1">
                                    {f.name} <button onClick={() => setPendingAttachments(prev => prev.filter((_, idx) => idx !== i))} className="hover:text-red-500">×</button>
                                </span>
                            ))}
                        </div>
                    )}
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
                            <div key={idea.id} className={`${colors[idea.color]} p-4 rounded-lg shadow-sm border transform hover:-translate-y-1 transition-transform relative group flex flex-col`}>
                                <div className="flex items-center gap-2 mb-2 opacity-70">
                                    <img src={user.avatarUrl} className="w-5 h-5 rounded-full" alt="" />
                                    <span className="text-xs font-bold">{user.name}</span>
                                </div>
                                <p className="font-medium text-sm min-h-[40px] whitespace-pre-wrap">{idea.content}</p>
                                
                                {/* Attachments Display */}
                                {idea.attachments && idea.attachments.length > 0 && (
                                    <div className="mt-3 space-y-2">
                                        {idea.attachments.map(att => (
                                            <div key={att.id} className="rounded overflow-hidden border border-black/10 bg-white/50">
                                                {att.type === 'IMAGE' ? (
                                                    <img src={att.url} alt={att.name} className="w-full h-24 object-cover" />
                                                ) : att.type === 'VIDEO' ? (
                                                    <video src={att.url} controls className="w-full h-24 object-cover" />
                                                ) : (
                                                    <div className="p-2 text-xs flex items-center gap-2">
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                                                        <span className="truncate">{att.name}</span>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="mt-3 flex justify-between items-center border-t border-black/5 pt-2">
                                    <button 
                                        onClick={() => handleVoteIdea(idea.id)}
                                        className="text-xs font-bold flex items-center gap-1 hover:bg-black/5 px-2 py-1 rounded transition-colors"
                                    >
                                        👍 {idea.votes}
                                    </button>
                                    
                                    {!idea.linkedDraftId ? (
                                        <button 
                                            onClick={() => handleConvertIdeaToDraft(idea)}
                                            className="text-[10px] bg-white/50 hover:bg-white/80 border border-black/10 px-2 py-1 rounded transition-colors"
                                            title="このアイデアからドラフトを作成"
                                        >
                                            → ドラフト化
                                        </button>
                                    ) : (
                                        <span className="text-[10px] font-bold opacity-60">✓ ドラフト済</span>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    );
    
    const renderDrafts = () => (
        <div className="space-y-6 h-full flex flex-col">
            <div className="flex justify-between items-center bg-white dark:bg-zinc-900 p-4 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800 shrink-0">
                <h3 className="font-bold text-slate-800 dark:text-white">SKU起案・承認ワークフロー</h3>
                <Button onClick={() => setIsDraftModalOpen(true)}>{ICONS.plus} 新規SKU起案</Button>
            </div>
            
            <div className="flex-1 overflow-y-auto">
                {projectDrafts.length === 0 ? (
                     <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700">
                        <p className="text-slate-400">このプロジェクトに関連付けられたSKUドラフトはまだありません。</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {projectDrafts.map(draft => {
                            const author = getUser(draft.authorId);
                            const statusColors = {
                                'PROPOSAL': 'blue',
                                'REVIEW': 'yellow',
                                'APPROVED': 'green',
                                'REJECTED': 'red'
                            };
                            
                            return (
                                <div key={draft.id} className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row gap-6">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <Badge color={statusColors[draft.status] as any}>{draft.status}</Badge>
                                            <span className="text-xs text-slate-400">{draft.createdAt}</span>
                                            {draft.linkedIdeaId && (
                                                <span className="text-[10px] bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded border border-yellow-200 flex items-center gap-1">
                                                    {ICONS.bulb} アイデア発
                                                </span>
                                            )}
                                        </div>
                                        <h4 className="text-xl font-bold text-slate-800 dark:text-white mb-1">{draft.name}</h4>
                                        <div className="flex gap-4 text-sm text-slate-500 mb-4">
                                            <span>予定ID: <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{draft.proposedSkuId}</span></span>
                                            <span>予定価格: <span className="font-bold text-slate-700 dark:text-slate-300">¥{draft.price?.toLocaleString() || '-'}</span></span>
                                        </div>
                                        <p className="text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-zinc-800 p-3 rounded-lg text-sm">
                                            {draft.description}
                                        </p>
                                    </div>
                                    <div className="flex flex-col gap-3 justify-center min-w-[150px] border-t md:border-t-0 md:border-l border-zinc-100 dark:border-zinc-800 pt-4 md:pt-0 md:pl-6">
                                        <div className="flex items-center gap-2 mb-2">
                                            <img src={author.avatarUrl} className="w-6 h-6 rounded-full" alt="" />
                                            <span className="text-xs font-bold text-slate-500">{author.name}</span>
                                        </div>
                                        
                                        <div className="flex flex-col gap-2">
                                            {draft.status === 'PROPOSAL' && (
                                                <Button size="sm" onClick={() => onUpdateDraftStatus(draft.id, 'APPROVED')} className="w-full bg-emerald-600 hover:bg-emerald-700 border-emerald-600 text-white">
                                                    承認する
                                                </Button>
                                            )}
                                            {draft.status === 'PROPOSAL' && (
                                                <Button size="sm" variant="danger" onClick={() => onUpdateDraftStatus(draft.id, 'REJECTED')} className="w-full">
                                                    却下
                                                </Button>
                                            )}
                                            {draft.status === 'APPROVED' && (
                                                <div className="text-center text-xs font-bold text-emerald-600 border border-emerald-200 bg-emerald-50 py-2 rounded">
                                                    承認済み
                                                </div>
                                            )}
                                            {draft.status === 'REJECTED' && (
                                                <Button size="sm" variant="secondary" onClick={() => onUpdateDraftStatus(draft.id, 'PROPOSAL')} className="w-full">
                                                    再申請
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            
            <Modal isOpen={isDraftModalOpen} onClose={() => setIsDraftModalOpen(false)} title="新規SKU起案 (ドラフト)">
                <div className="space-y-4">
                    {linkedIdeaId && (
                         <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-3 py-2 rounded text-sm flex items-center gap-2">
                            {ICONS.bulb} 選択したアイデアからドラフトを作成中
                         </div>
                    )}
                    <Input label="商品名 (仮)" value={draftName} onChange={(e) => setDraftName(e.target.value)} />
                    <Input label="SKU ID (予定)" value={draftSkuId} onChange={(e) => setDraftSkuId(e.target.value)} />
                    <Input label="販売予定価格" type="number" value={draftPrice} onChange={(e) => setDraftPrice(e.target.value)} />
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">企画概要・特徴</label>
                        <textarea 
                            className="w-full px-3 py-2.5 bg-white border border-zinc-300 rounded-lg shadow-sm text-sm focus:outline-none focus:border-zinc-800 transition-colors h-24"
                            value={draftDesc}
                            onChange={(e) => setDraftDesc(e.target.value)}
                        />
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <Button variant="secondary" onClick={() => setIsDraftModalOpen(false)}>キャンセル</Button>
                        <Button onClick={handleCreateDraft}>起案する</Button>
                    </div>
                </div>
            </Modal>
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
            <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-6 py-4 flex items-center justify-between shrink-0 z-10">
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
                <div className="flex -space-x-2 items-center">
                     {selectedProject.memberIds.map(uid => (
                        <img 
                            key={uid} 
                            src={getUser(uid).avatarUrl} 
                            alt={getUser(uid).name}
                            className="w-8 h-8 rounded-full border-2 border-white dark:border-zinc-900"
                            title={getUser(uid).name}
                        />
                    ))}
                    {canAddMember && (
                        <button 
                            onClick={() => setIsAddMemberModalOpen(true)}
                            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 border-2 border-white dark:border-zinc-900 flex items-center justify-center text-xs text-slate-500 hover:bg-slate-200 transition-colors"
                            title="メンバー追加"
                        >
                            +
                        </button>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-zinc-200 dark:border-zinc-800 px-6 bg-white dark:bg-zinc-900 shrink-0 overflow-x-auto z-10">
                 <button
                    onClick={() => setActiveTab('CHAT')}
                    className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'CHAT' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                >
                    {ICONS.chat} チャット
                </button>
                <button
                    onClick={() => setActiveTab('BRAINSTORM')}
                    className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'BRAINSTORM' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                >
                    {ICONS.bulb} アイデアボード
                </button>
                 <button
                    onClick={() => setActiveTab('DRAFTS')}
                    className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'DRAFTS' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                >
                    {ICONS.list} SKUドラフト
                </button>
            </div>

            {/* Content Area - Ensure it fills height for sticky behavior */}
            <div className="flex-1 overflow-hidden p-6 bg-slate-50 dark:bg-black relative">
                <div className="max-w-6xl mx-auto h-full flex flex-col">
                    {activeTab === 'CHAT' && renderChat()}
                    {activeTab === 'BRAINSTORM' && renderBrainstorming()}
                    {activeTab === 'DRAFTS' && renderDrafts()}
                </div>
            </div>

            {/* Add Member Modal */}
            <Modal isOpen={isAddMemberModalOpen} onClose={() => setIsAddMemberModalOpen(false)} title="メンバー追加">
                <div className="space-y-4">
                    <p className="text-sm text-slate-500 mb-2">このプロジェクトに参加させるユーザーを選択してください。</p>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                        {users
                            .filter(u => !selectedProject.memberIds.includes(u.id))
                            .map(u => (
                                <button
                                    key={u.id}
                                    onClick={() => setSelectedNewMember(u.id)}
                                    className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-colors ${selectedNewMember === u.id ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500' : 'bg-white border-zinc-200 hover:bg-zinc-50'}`}
                                >
                                    <img src={u.avatarUrl} className="w-8 h-8 rounded-full" alt="" />
                                    <div>
                                        <p className="text-sm font-bold text-slate-800">{u.name}</p>
                                        <p className="text-xs text-slate-500">ID: {u.id}</p>
                                    </div>
                                </button>
                            ))}
                        {users.filter(u => !selectedProject.memberIds.includes(u.id)).length === 0 && (
                            <p className="text-center text-sm text-slate-400 py-4">追加可能なユーザーがいません</p>
                        )}
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <Button variant="secondary" onClick={() => setIsAddMemberModalOpen(false)}>キャンセル</Button>
                        <Button onClick={handleAddMember} disabled={!selectedNewMember}>追加</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}