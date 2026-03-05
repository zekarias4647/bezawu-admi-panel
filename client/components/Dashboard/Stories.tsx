import React, { useState, useEffect } from 'react';
import { Plus, Search, Trash2, Power, MessageCircle, Heart, Film, Loader2, X, Eye, Link as LinkIcon, Calendar } from 'lucide-react';
import { Story, StoryComment } from '../../types';

interface StoriesProps {
    isDarkMode: boolean;
    onAddStory: () => void;
}

const Stories: React.FC<StoriesProps> = ({ isDarkMode, onAddStory }) => {
    const [stories, setStories] = useState<Story[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStory, setSelectedStory] = useState<Story | null>(null);
    const [comments, setComments] = useState<StoryComment[]>([]);
    const [loadingComments, setLoadingComments] = useState(false);

    const fetchStories = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch('https://branchapi.bezawcurbside.com/api/stories/stories-get', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setStories(data);
            }
        } catch (err) {
            console.error('Failed to fetch stories:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStories();
    }, []);

    useEffect(() => {
        if (selectedStory) {
            const fetchStoryDetails = async () => {
                try {
                    const token = localStorage.getItem('token');
                    const response = await fetch(`https://branchapi.bezawcurbside.com/api/stories/${selectedStory.id}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (response.ok) {
                        const data = await response.json();
                        // Update the stories list and selected story with fresh counts
                        setStories(prev => prev.map(s => s.id === data.id ? data : s));
                        setSelectedStory(data);
                    }
                } catch (err) {
                    console.error('Failed to refresh story details:', err);
                }
            };

            const fetchComments = async () => {
                setLoadingComments(true);
                try {
                    const token = localStorage.getItem('token');
                    const response = await fetch(`https://branchapi.bezawcurbside.com/api/stories/${selectedStory.id}/comments`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (response.ok) {
                        const data = await response.json();
                        setComments(data);
                    }
                } catch (err) {
                    console.error('Failed to fetch comments:', err);
                } finally {
                    setLoadingComments(false);
                }
            };
            fetchStoryDetails();
            fetchComments();
        } else {
            setComments([]);
        }
    }, [selectedStory?.id]); // Only re-fetch when a DIFFERENT story is selected

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (!window.confirm('Are you sure you want to delete this story?')) return;
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`https://branchapi.bezawcurbside.com/api/stories/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                setStories(prev => prev.filter(s => s.id !== id));
                if (selectedStory?.id === id) setSelectedStory(null);
            }
        } catch (err) {
            console.error('Failed to delete story:', err);
        }
    };

    const handleToggleStatus = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`https://branchapi.bezawcurbside.com/api/stories/${id}/toggle`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                setStories(prev => prev.map(s => s.id === id ? { ...s, is_active: !s.is_active } : s));
                if (selectedStory?.id === id) {
                    setSelectedStory(prev => prev ? { ...prev, is_active: !prev.is_active } : null);
                }
            }
        } catch (err) {
            console.error('Failed to toggle story:', err);
        }
    };

    const getMediaUrl = (url?: string) => {
        if (!url) return '';
        if (url.includes('/uploads/')) {
            const filename = url.split('/uploads/')[1];
            return `https://branchapi.bezawcurbside.com/uploads/${filename}`;
        }
        if (url.startsWith('http')) return url;
        return `https://branchapi.bezawcurbside.com${url}`;
    };

    const filteredStories = stories.filter(s =>
        s.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 min-h-[400px]">
                <Loader2 className="animate-spin text-emerald-500 mb-4" size={48} />
                <p className="text-sm font-black text-slate-500 uppercase tracking-widest animate-pulse font-mono">
                    Loading Feed...
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg shadow-emerald-500/30">
                        <Film className="text-white" size={24} />
                    </div>
                    <div>
                        <h1 className={`text-3xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                            App Stories
                        </h1>
                        <p className={`${isDarkMode ? 'text-slate-500' : 'text-slate-400'} text-sm font-medium`}>
                            Manage video stories for the mobile app
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className={`relative ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <input
                            type="text"
                            placeholder="Search stories..."
                            className={`w-64 pl-10 pr-4 py-2.5 rounded-xl border transition-all text-sm font-bold ${isDarkMode
                                ? 'bg-slate-800/50 border-slate-700 focus:border-emerald-500'
                                : 'bg-white border-slate-200 focus:border-emerald-500'
                                }`}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={onAddStory}
                        className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all gap-2 items-center flex shadow-lg shadow-emerald-500/20 active:scale-95"
                    >
                        <Plus size={16} />
                        New Story
                    </button>
                </div>
            </div>

            {/* List View */}
            <div className={`rounded-2xl border overflow-hidden ${isDarkMode ? 'border-slate-800 bg-[#121418]' : 'border-slate-200 bg-white'}`}>
                <div className={`grid grid-cols-12 gap-4 p-4 border-b text-[10px] uppercase font-black tracking-widest ${isDarkMode ? 'border-slate-800 text-slate-500' : 'border-slate-100 text-slate-400'}`}>
                    <div className="col-span-1">Preview</div>
                    <div className="col-span-4">Story Details</div>
                    <div className="col-span-2">Stats</div>
                    <div className="col-span-3">Status</div>
                    <div className="col-span-2 text-right">Actions</div>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredStories.map(story => (
                        <div
                            key={story.id}
                            onClick={() => setSelectedStory(story)}
                            className={`grid grid-cols-12 gap-4 p-4 items-center transition-colors cursor-pointer ${isDarkMode ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}`}
                        >
                            <div className="col-span-1">
                                <div className="h-16 w-12 rounded-lg bg-black overflow-hidden relative">
                                    <video src={getMediaUrl(story.video_url)} className="h-full w-full object-cover opacity-80" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="p-1 rounded-full bg-white/20 backdrop-blur-sm">
                                            <Eye size={10} className="text-white" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-span-4 min-w-0">
                                <h3 className={`font-bold text-sm truncate mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                    {story.title}
                                </h3>
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                    <Calendar size={12} />
                                    <span>{new Date(story.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                            <div className="col-span-2 flex items-center gap-4">
                                <div className="flex items-center gap-1.5" title="Likes">
                                    <Heart size={14} className="text-rose-500" />
                                    <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{story.likes_count}</span>
                                </div>
                                <div className="flex items-center gap-1.5" title="Comments">
                                    <MessageCircle size={14} className="text-blue-500" />
                                    <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{story.comments_count} Comments</span>
                                </div>
                            </div>
                            <div className="col-span-3">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide ${story.is_active
                                    ? 'bg-emerald-500/10 text-emerald-500'
                                    : 'bg-slate-500/10 text-slate-500'
                                    }`}>
                                    {story.is_active ? 'Active' : 'Hidden'}
                                </span>
                            </div>
                            <div className="col-span-2 flex items-center justify-end gap-2">
                                <button
                                    onClick={(e) => handleToggleStatus(e, story.id)}
                                    className={`p-2 rounded-lg transition-colors ${story.is_active
                                        ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'
                                        : 'bg-slate-500/10 text-slate-500 hover:bg-slate-500/20'
                                        }`}
                                >
                                    <Power size={16} />
                                </button>
                                <button
                                    onClick={(e) => handleDelete(e, story.id)}
                                    className="p-2 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                {
                    filteredStories.length === 0 && (
                        <div className="text-center py-20">
                            <Film className="mx-auto text-slate-500 mb-4" size={48} />
                            <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>No stories found</p>
                        </div>
                    )
                }
            </div>

            {/* Detail Modal */}
            {selectedStory && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className={`w-full max-w-6xl h-[85vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col lg:flex-row relative animate-in zoom-in-95 duration-300 ${isDarkMode ? 'bg-[#121418]' : 'bg-white'}`}>

                        <button
                            onClick={() => setSelectedStory(null)}
                            className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 backdrop-blur-md transition-colors"
                        >
                            <X size={20} />
                        </button>

                        {/* Left Side: Details */}
                        <div className={`flex-1 p-8 lg:p-10 flex flex-col overflow-y-auto custom-scrollbar border-r ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                            <div className="flex items-center gap-3 mb-6">
                                <div className={`p-2.5 rounded-xl ${isDarkMode ? 'bg-emerald-500/10' : 'bg-emerald-50'}`}>
                                    <Film className="text-emerald-500" size={20} />
                                </div>
                                <span className="text-xs font-black uppercase tracking-widest text-emerald-500">Story Insights</span>
                            </div>

                            <h2 className={`text-3xl font-black tracking-tight mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                {selectedStory.title}
                            </h2>

                            <div className="flex gap-4 mb-8">
                                <div className={`flex-1 p-4 rounded-2xl ${isDarkMode ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                                    <div className="flex items-center gap-2 mb-1 text-rose-500">
                                        <Heart className="fill-current" size={18} />
                                        <span className="text-xs font-bold uppercase tracking-wider">Total Likes</span>
                                    </div>
                                    <div className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                        {selectedStory.likes_count.toLocaleString()}
                                    </div>
                                </div>
                                <div className={`flex-1 p-4 rounded-2xl ${isDarkMode ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                                    <div className="flex items-center gap-2 mb-1 text-blue-500">
                                        <MessageCircle className="fill-current" size={18} />
                                        <span className="text-xs font-bold uppercase tracking-wider">Comments</span>
                                    </div>
                                    <div className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                        {selectedStory.comments_count.toLocaleString()}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Description</h3>
                                    <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                                        {selectedStory.description || 'No description provided.'}
                                    </p>
                                </div>

                                {selectedStory.link && (
                                    <div>
                                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Attached Link</h3>
                                        <a
                                            href={selectedStory.link}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex items-center gap-2 text-sm font-bold text-emerald-500 hover:underline truncate"
                                        >
                                            <LinkIcon size={14} />
                                            {selectedStory.link}
                                        </a>
                                    </div>
                                )}

                                <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center justify-between">
                                        <div className="text-xs text-slate-500 font-medium">
                                            Posted on {new Date(selectedStory.created_at).toLocaleDateString()} at {new Date(selectedStory.created_at).toLocaleTimeString()}
                                        </div>
                                        <div className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide ${selectedStory.is_active
                                            ? 'bg-emerald-500/10 text-emerald-500'
                                            : 'bg-slate-500/10 text-slate-500'
                                            }`}>
                                            {selectedStory.is_active ? 'Active' : 'Hidden'}
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4">Latest Comments</h3>
                                    {loadingComments ? (
                                        <div className="flex justify-center py-4">
                                            <Loader2 className="animate-spin text-emerald-500" size={20} />
                                        </div>
                                    ) : comments.length > 0 ? (
                                        <div className="space-y-4 max-h-[200px] overflow-y-auto custom-scrollbar pr-2">
                                            {comments.map(comment => (
                                                <div key={comment.id} className={`p-3 rounded-xl ${isDarkMode ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{comment.user_name}</span>
                                                        <span className="text-[10px] text-slate-500">{new Date(comment.created_at).toLocaleDateString()}</span>
                                                    </div>
                                                    <p className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>{comment.content}</p>
                                                    <div className="flex items-center justify-end mt-2 gap-1 text-rose-500">
                                                        <Heart size={12} className="fill-current" />
                                                        <span className="text-[10px] font-bold">{comment.likes_count}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-4 text-slate-500 text-sm">
                                            No comments yet.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Side: Video */}
                        <div className="flex-1 lg:flex-[1.2] bg-black flex items-center justify-center relative group">
                            <video
                                src={getMediaUrl(selectedStory.video_url)}
                                className="w-full h-full object-contain"
                                controls
                                autoPlay
                                loop
                            />
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
};

export default Stories;
