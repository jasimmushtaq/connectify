import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, 
  Search, 
  User as UserIcon, 
  Clock, 
  Send, 
  MoreVertical, 
  RefreshCw,
  LogOut,
  Users,
  Image as ImageIcon,
  Video as VideoIcon,
  Smile,
  Paperclip,
  X
} from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { api } from './services/api';
import { Conversation, Message, User } from './types';

const EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🔥'];

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [showAuth, setShowAuth] = useState(true);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authForm, setAuthForm] = useState({ email: '', password: '', name: '' });
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState<'text' | 'image' | 'video'>('text');
  const [isSending, setIsSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);
  
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auth Check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { user } = await api.getMe();
        setCurrentUser(user);
        setShowAuth(false);
      } catch (err) {
        setShowAuth(true);
      } finally {
        setIsAuthReady(true);
      }
    };
    checkAuth();
  }, []);

  // Socket Connection
  useEffect(() => {
    if (currentUser) {
      socketRef.current = io();
      socketRef.current.emit('user:online', currentUser.id);

      socketRef.current.on('user:status', ({ userId, status }) => {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, status } : u));
      });

      socketRef.current.on('message:receive', (msg: Message) => {
        if (msg.conversationId === selectedId) {
          setMessages(prev => [...prev, msg]);
        }
        fetchAllConversations();
      });

      socketRef.current.on('reaction:receive', (msg: Message) => {
        if (msg.conversationId === selectedId) {
          setMessages(prev => prev.map(m => m.id === msg.id ? msg : m));
        }
      });

      return () => {
        socketRef.current?.disconnect();
      };
    }
  }, [currentUser, selectedId]);

  const fetchAllConversations = async () => {
    if (!currentUser) return;
    try {
      const convs = await api.fetchConversations();
      setConversations(convs);
    } catch (err) {
      console.error('Failed to load conversations');
    }
  };

  const fetchUsers = async () => {
    if (!currentUser) return;
    try {
      const allUsers = await api.getUsers();
      setUsers(allUsers.filter(u => u.id !== currentUser.id));
    } catch (err) {
      console.error('Failed to load users');
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchAllConversations();
      fetchUsers();
    }
  }, [currentUser]);

  useEffect(() => {
    if (selectedId) {
      const fetchMessages = async () => {
        setLoading(true);
        try {
          const msgs = await api.fetchMessages(selectedId);
          setMessages(msgs);
        } catch (err) {
          console.error('Failed to load messages');
        } finally {
          setLoading(false);
        }
      };
      fetchMessages();
    } else {
      setMessages([]);
    }
  }, [selectedId]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { user } = authMode === 'login' 
        ? await api.login({ email: authForm.email, password: authForm.password })
        : await api.register(authForm);
      setCurrentUser(user);
      setShowAuth(false);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleLogout = async () => {
    await api.logout();
    setCurrentUser(null);
    setShowAuth(true);
    socketRef.current?.disconnect();
  };

  const startChat = async (user: User) => {
    if (!currentUser) return;
    
    const existing = conversations.find(c => 
      c.participants.includes(user.name) && c.participants.includes(currentUser.name)
    );
    
    if (existing) {
      setSelectedId(existing.id);
      return;
    }

    try {
      const newConv = await api.createConversation({
        participants: [currentUser.name, user.name]
      });
      setConversations(prev => [newConv, ...prev]);
      setSelectedId(newConv.id);
    } catch (err) {
      alert('Failed to start chat');
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId || (!newMessage.trim() && !mediaUrl) || isSending || !currentUser) return;

    setIsSending(true);
    try {
      const msg = await api.sendMessage(selectedId, {
        content: newMessage,
        type: mediaType,
        mediaUrl: mediaUrl || undefined
      });
      
      socketRef.current?.emit('message:send', msg);
      setMessages(prev => [...prev, msg]);
      setNewMessage('');
      setMediaUrl('');
      setMediaType('text');
      fetchAllConversations();
    } catch (err) {
      alert('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedId || !currentUser) return;

    setIsSending(true);
    try {
      const type = file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'text';
      if (type === 'text') {
        alert('Unsupported file type');
        return;
      }

      const { url } = await api.uploadFile(file);
      
      const msg = await api.sendMessage(selectedId, {
        content: '',
        type: type,
        mediaUrl: url
      });
      
      socketRef.current?.emit('message:send', msg);
      setMessages(prev => [...prev, msg]);
      fetchAllConversations();
    } catch (err) {
      alert('Failed to upload file');
    } finally {
      setIsSending(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleReact = async (messageId: string, emoji: string) => {
    try {
      const updatedMsg = await api.reactToMessage(messageId, emoji);
      setMessages(prev => prev.map(m => m.id === messageId ? updatedMsg : m));
      socketRef.current?.emit('reaction:send', updatedMsg);
      setShowEmojiPicker(null);
    } catch (err) {
      console.error('Failed to react');
    }
  };

  const selectedConversation = conversations.find(c => c.id === selectedId);

  if (!isAuthReady) return null;

  if (showAuth) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center p-4 font-sans">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md"
        >
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <MessageSquare className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-center mb-2">
            {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-gray-500 text-center mb-8 text-sm">
            {authMode === 'login' ? 'Sign in to continue chatting' : 'Join our community today'}
          </p>
          
          <form onSubmit={handleAuth} className="space-y-4">
            {authMode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Full Name</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  value={authForm.name}
                  onChange={e => setAuthForm({...authForm, name: e.target.value})}
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Email Address</label>
              <input 
                type="email" 
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                value={authForm.email}
                onChange={e => setAuthForm({...authForm, email: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Password</label>
              <input 
                type="password" 
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                value={authForm.password}
                onChange={e => setAuthForm({...authForm, password: e.target.value})}
              />
            </div>
            <button 
              type="submit"
              className="w-full py-4 bg-blue-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-[0.98]"
            >
              {authMode === 'login' ? 'Sign In' : 'Sign Up'}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <button 
              onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
              className="text-sm text-blue-600 font-medium hover:underline"
            >
              {authMode === 'login' ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F5F5F5] font-sans text-[#1A1A1A]">
      {/* Sidebar */}
      <div className="w-80 border-r border-gray-200 bg-white flex flex-col">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={currentUser?.avatar || undefined} className="w-8 h-8 rounded-full bg-blue-100" alt="" />
            <h1 className="text-lg font-semibold tracking-tight">Chats</h1>
          </div>
          <div className="flex items-center gap-1">
            <button 
              onClick={fetchAllConversations}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button 
              onClick={handleLogout}
              className="p-2 hover:bg-red-50 rounded-full transition-colors text-red-500"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 bg-gray-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="px-4 py-2">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Online Users</h3>
            <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
              {users.map(user => (
                <button 
                  key={user.id} 
                  onClick={() => startChat(user)}
                  className="flex-shrink-0 text-center w-14 hover:scale-105 transition-transform"
                >
                  <div className="relative inline-block">
                    <img src={user.avatar || undefined} className="w-12 h-12 rounded-full bg-gray-100 border-2 border-white shadow-sm" alt="" />
                    {user.status === 'online' && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                    )}
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1 truncate">{user.name.split(' ')[0]}</p>
                </button>
              ))}
            </div>
          </div>

          <h3 className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Recent Chats</h3>
          {conversations.map((conv) => {
            const lastMsg = conv.messages?.[0];
            return (
              <button
                key={conv.id}
                onClick={() => setSelectedId(conv.id)}
                className={`w-full p-4 flex gap-3 hover:bg-gray-50 transition-colors border-b border-gray-50 text-left ${selectedId === conv.id ? 'bg-blue-50/50' : ''}`}
              >
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <UserIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-medium text-sm truncate">{conv.participants}</h3>
                    <span className="text-[10px] text-gray-400">
                      {lastMsg ? new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">
                    {lastMsg ? (lastMsg.senderId === currentUser?.id ? 'You: ' : `${lastMsg.senderName}: `) + (lastMsg.type === 'text' ? lastMsg.content : `Sent a ${lastMsg.type}`) : 'No messages yet'}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedConversation ? (
          <>
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-sm">{selectedConversation.participants}</h2>
                  <div className="flex items-center gap-1 text-[10px] text-green-500 font-medium">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    Active
                  </div>
                </div>
              </div>
              <button className="p-2 hover:bg-gray-100 rounded-full text-gray-400">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#F8F9FB]">
              {messages.map((msg) => {
                const reactions = msg.reactions ? JSON.parse(msg.reactions) : {};
                return (
                  <motion.div 
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.senderId === currentUser?.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className="relative group">
                      <div className={`max-w-[400px] rounded-2xl p-4 shadow-sm ${
                        msg.senderId === currentUser?.id 
                          ? 'bg-blue-600 text-white rounded-tr-none' 
                          : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
                      }`}>
                        {msg.type === 'image' && msg.mediaUrl && (
                          <img src={msg.mediaUrl} alt="Sent" className="rounded-lg mb-2 max-h-60 w-full object-cover" referrerPolicy="no-referrer" />
                        )}
                        {msg.type === 'video' && msg.mediaUrl && (
                          <video src={msg.mediaUrl} controls className="rounded-lg mb-2 max-h-60 w-full" />
                        )}
                        {msg.content && <p className="text-sm leading-relaxed">{msg.content}</p>}
                        
                        <div className={`flex items-center gap-1 mt-1 text-[10px] ${
                          msg.senderId === currentUser?.id ? 'text-blue-100' : 'text-gray-400'
                        }`}>
                          <Clock className="w-3 h-3" />
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>

                        {/* Reactions Display */}
                        {Object.keys(reactions).length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {Object.entries(reactions).map(([emoji, users]: [string, any]) => (
                              <button
                                key={emoji}
                                onClick={() => handleReact(msg.id, emoji)}
                                className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] border transition-all ${
                                  users.includes(currentUser?.id)
                                    ? 'bg-blue-50 border-blue-200 text-blue-600'
                                    : 'bg-gray-50 border-gray-100 text-gray-500'
                                }`}
                              >
                                <span>{emoji}</span>
                                <span>{users.length}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Reaction Picker Trigger */}
                      <div className={`absolute top-0 ${msg.senderId === currentUser?.id ? '-left-10' : '-right-10'} opacity-0 group-hover:opacity-100 transition-opacity`}>
                        <button 
                          onClick={() => setShowEmojiPicker(showEmojiPicker === msg.id ? null : msg.id)}
                          className="p-1.5 bg-white border border-gray-100 rounded-full shadow-sm hover:bg-gray-50 text-gray-400"
                        >
                          <Smile className="w-4 h-4" />
                        </button>
                      </div>

                      {showEmojiPicker === msg.id && (
                        <div className={`absolute z-20 top-0 ${msg.senderId === currentUser?.id ? '-left-40' : '-right-40'} bg-white border border-gray-100 rounded-2xl shadow-xl p-2 flex gap-1 animate-in fade-in zoom-in duration-200`}>
                          {EMOJIS.map(emoji => (
                            <button
                              key={emoji}
                              onClick={() => handleReact(msg.id, emoji)}
                              className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors text-lg"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-gray-100 bg-white">
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*,video/*"
                onChange={handleFileUpload}
              />
              <form onSubmit={handleSendMessage} className="flex items-center gap-3 max-w-4xl mx-auto">
                <div className="flex items-center gap-1">
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 rounded-xl transition-colors hover:bg-gray-100 text-gray-400"
                    disabled={isSending}
                  >
                    <ImageIcon className="w-5 h-5" />
                  </button>
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 rounded-xl transition-colors hover:bg-gray-100 text-gray-400"
                    disabled={isSending}
                  >
                    <VideoIcon className="w-5 h-5" />
                  </button>
                </div>
                <input 
                  type="text"
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  disabled={isSending}
                />
                <button 
                  type="submit"
                  disabled={(!newMessage.trim() && !mediaUrl) || isSending}
                  className="p-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-500/20"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-10 text-center">
            <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mb-6">
              <Users className="w-10 h-10 text-gray-200" />
            </div>
            <h2 className="text-xl font-semibold text-gray-600 mb-2">Real-time Chat</h2>
            <p className="text-sm max-w-xs leading-relaxed">
              Select a conversation or see who's online to start chatting in real-time.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
