import React, { useState, useEffect, useRef } from 'react';
import { X, Send, User, ShieldCheck, Loader2, MessageSquare } from 'lucide-react';
import { Order } from '../../types';

interface ChatModalProps {
    order: Order;
    onClose: () => void;
    isDarkMode: boolean;
}

interface Message {
    id: number;
    order_id: string;
    sender_type: 'ADMIN' | 'CUSTOMER';
    message: string;
    created_at: string;
}

const ChatModal: React.FC<ChatModalProps> = ({ order, onClose, isDarkMode }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const fetchMessages = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`https://branchapi.ristestate.com/api/chat/${order.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setMessages(data);
            }
        } catch (err) {
            console.error('Failed to fetch messages:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        setSending(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`https://branchapi.ristestate.com/api/chat/${order.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ message: newMessage })
            });

            if (response.ok) {
                const sentMsg = await response.json();
                setMessages(prev => [...prev, sentMsg]);
                setNewMessage('');
            }
        } catch (err) {
            console.error('Failed to send message:', err);
        } finally {
            setSending(false);
        }
    };

    useEffect(() => {
        fetchMessages();
        // Poll for new messages every 5 seconds
        const interval = setInterval(fetchMessages, 5000);
        return () => clearInterval(interval);
    }, [order.id]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className={`w-full max-w-sm h-[500px] flex flex-col rounded-2xl overflow-hidden shadow-2xl border animate-in zoom-in-95 duration-200 ${isDarkMode ? 'bg-[#121418] border-slate-800' : 'bg-white border-slate-100'}`}>

                {/* Header */}
                <div className={`px-4 py-3 flex items-center justify-between border-b ${isDarkMode ? 'border-slate-800 bg-[#0f1115]' : 'border-slate-100 bg-slate-50'}`}>
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-indigo-500/10' : 'bg-indigo-50'}`}>
                            <MessageSquare className="text-indigo-500" size={18} />
                        </div>
                        <div>
                            <h3 className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Order Chat</h3>
                            <p className="text-[10px] text-slate-500 font-medium">#{order.id.slice(0, 8)} • {order.customerName}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className={`p-1.5 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-200 text-slate-500'}`}>
                        <X size={18} />
                    </button>
                </div>

                {/* Messages Area */}
                <div className={`flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar ${isDarkMode ? 'bg-[#121418]' : 'bg-white'}`}>
                    {loading ? (
                        <div className="flex justify-center py-10">
                            <Loader2 className="animate-spin text-slate-400" />
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400 opacity-50">
                            <MessageSquare size={48} className="mb-2" />
                            <p className="text-xs font-bold uppercase tracking-widest">No messages yet</p>
                        </div>
                    ) : (
                        messages.map(msg => {
                            const isAdmin = msg.sender_type === 'ADMIN';
                            return (
                                <div key={msg.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`flex flex-col max-w-[80%] ${isAdmin ? 'items-end' : 'items-start'}`}>
                                        <div className={`flex items-center gap-1.5 mb-1 ${isAdmin ? 'flex-row-reverse' : 'flex-row'}`}>
                                            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${isAdmin ? 'bg-indigo-500' : 'bg-slate-500'}`}>
                                                {isAdmin ? <ShieldCheck size={10} className="text-white" /> : <User size={10} className="text-white" />}
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                                                {isAdmin ? 'You' : 'Customer'}
                                            </span>
                                        </div>
                                        <div className={`px-4 py-2.5 rounded-2xl text-sm font-medium ${isAdmin
                                            ? 'bg-indigo-600 text-white rounded-tr-none'
                                            : isDarkMode
                                                ? 'bg-slate-800 text-slate-200 rounded-tl-none'
                                                : 'bg-slate-100 text-slate-700 rounded-tl-none'
                                            }`}>
                                            {msg.message}
                                        </div>
                                        <span className="text-[9px] text-slate-500 mt-1 pl-1">
                                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className={`p-3 border-t ${isDarkMode ? 'border-slate-800 bg-[#0f1115]' : 'border-slate-100 bg-slate-50'}`}>
                    <form onSubmit={handleSend} className="relative flex items-center gap-2">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message..."
                            className={`flex-1 pl-3 pr-10 py-2.5 rounded-lg border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${isDarkMode
                                ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-600'
                                : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
                                }`}
                        />
                        <button
                            type="submit"
                            disabled={sending || !newMessage.trim()}
                            className="absolute right-1.5 p-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors"
                        >
                            {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ChatModal;
