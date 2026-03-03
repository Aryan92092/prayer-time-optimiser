import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, History, Calendar, BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { createJournal, subscribeJournals } from '../services/journalService';
import { getActiveProgram } from '../services/programService';

const JournalPage = () => {
    const [text, setText] = useState('');
    const [journals, setJournals] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeProgramId, setActiveProgramId] = useState(null);
    const { user } = useAuth();

    useEffect(() => {
        if (!user) return;

        // Get active program id for journal linking
        getActiveProgram(user.id).then(prog => {
            if (prog) setActiveProgramId(prog.id);
        });

        // Real-time subscription — updates automatically when journal added
        const unsub = subscribeJournals(user.id, setJournals);
        return unsub;
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!text.trim()) return;
        setLoading(true);
        try {
            await createJournal(user.id, activeProgramId, text);
            setText(''); // real-time subscription handles the list update
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-12 pt-20 pb-32">
            {/* Entry Form */}
            <div className="lg:col-span-2 space-y-8">
                <div className="flex items-center gap-4 mb-2">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                        <BookOpen className="text-primary" size={24} />
                    </div>
                    <h2 className="text-4xl font-black tracking-tight dark:text-white">Daily Reflection</h2>
                </div>

                <form onSubmit={handleSubmit} className="divine-glow glass-card p-10 space-y-8 relative overflow-hidden bg-gradient-to-br from-white/40 to-white/10 dark:from-white/5 dark:to-transparent">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-purple-divine to-saffron" />

                    <div>
                        <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-4">How was your day? What's on your heart?</label>
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            className="w-full h-72 p-8 rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-800 focus:ring-4 focus:ring-primary/20 focus:border-primary bg-white/50 dark:bg-slate-900/50 text-xl resize-none dark:text-white transition-all font-medium leading-relaxed placeholder:text-slate-300 dark:placeholder:text-slate-700"
                            placeholder="Begin your soulful transcript..."
                        />
                    </div>

                    <button
                        disabled={loading}
                        className="group w-full bg-gradient-to-r from-primary to-purple-divine text-white py-5 rounded-2xl font-black flex items-center justify-center gap-3 hover:shadow-2xl hover:shadow-primary/30 transition-all disabled:opacity-50 text-lg hover:-translate-y-1 active:scale-95"
                    >
                        <Send size={22} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        <span>{loading ? 'Committing...' : 'Commit to Journal'}</span>
                    </button>
                </form>
            </div>

            {/* History Sidebar */}
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center">
                            <History className="text-slate-500 dark:text-slate-400" size={18} />
                        </div>
                        <h3 className="text-2xl font-black dark:text-white tracking-tight">Timeline</h3>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary px-3 py-1 rounded-full">
                        {journals.length} Entries
                    </span>
                </div>

                <div className="space-y-6 max-h-[700px] overflow-y-auto pr-2 p-1">
                    {journals.map((j, idx) => (
                        <motion.div
                            key={j.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="glass-card p-6 border-slate-100 dark:border-slate-800 hover:border-primary/30 dark:hover:border-primary/20 transition-all group cursor-default"
                        >
                            <div className="flex items-center gap-3 text-[10px] text-primary font-black uppercase tracking-widest mb-3">
                                <Calendar size={14} className="group-hover:scale-110 transition-transform" />
                                {new Date(j.created_at).toLocaleDateString('en-US', {
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric'
                                })}
                            </div>
                            <p className="text-slate-600 dark:text-slate-400 text-sm font-medium leading-relaxed group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                                {j.entry_text}
                            </p>
                        </motion.div>
                    ))}
                    {journals.length === 0 && (
                        <div className="text-center py-20 px-8 bg-slate-50 dark:bg-white/5 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                            <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Your timeline is empty</p>
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-2">The first step to clarity is expression.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default JournalPage;
