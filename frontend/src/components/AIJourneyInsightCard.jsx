import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, RefreshCw, AlertCircle, Sparkles, Feather } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { analyzeJournalSentiment, getJournalRateLimitRemaining } from '../services/journalAnalyzerService';

const Shimmer = ({ className = '' }) => (
    <div className={`relative overflow-hidden bg-white/30 dark:bg-white/5 rounded-2xl ${className}`}>
        <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 dark:via-white/10 to-transparent"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }}
        />
    </div>
);

const LoadingState = () => (
    <div className="space-y-5 pt-2">
        <div className="flex justify-between items-center mb-4">
            <Shimmer className="h-6 w-24 rounded-full" />
        </div>
        <Shimmer className="h-5 w-3/4" />
        <Shimmer className="h-5 w-full" />
        <div className="space-y-3 pt-2">
            <Shimmer className="h-4 w-full" />
            <Shimmer className="h-4 w-5/6" />
        </div>
    </div>
);

const SuggestionItem = ({ text, index }) => (
    <motion.li
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.15 + index * 0.08, type: 'spring', stiffness: 260, damping: 22 }}
        className="flex items-start gap-3 group"
    >
        <span className="mt-1 shrink-0 w-5 h-5 rounded-full bg-saffron/15 flex items-center justify-center">
            <Sparkles size={11} className="text-saffron group-hover:rotate-12 transition-transform" />
        </span>
        <span className="text-slate-600 dark:text-slate-300 text-sm font-medium leading-relaxed">{text}</span>
    </motion.li>
);

const getMoodStyle = (mood) => {
    const m = mood?.toLowerCase() || '';
    if (m.includes('stress') || m.includes('anxi') || m.includes('overwhelm')) return 'bg-red-500/10 text-red-500 border-red-500/20';
    if (m.includes('sad') || m.includes('lonel') || m.includes('depress')) return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    if (m.includes('gratitude') || m.includes('thankful')) return 'bg-green-500/10 text-green-500 border-green-500/20';
    if (m.includes('peace') || m.includes('calm')) return 'bg-teal-aurora/10 text-teal-aurora border-teal-aurora/20';
    if (m.includes('hope') || m.includes('joy')) return 'bg-saffron/10 text-saffron border-saffron/20';
    return 'bg-primary/10 text-primary border-primary/20'; // Default
};

const AIJourneyInsightCard = () => {
    const { user } = useAuth();
    const [state, setState] = useState('idle');
    const [result, setResult] = useState(null);
    const [cooldown, setCooldown] = useState(0);

    const runAnalysis = useCallback(async () => {
        if (!user) return;
        const remaining = getJournalRateLimitRemaining();
        if (remaining > 0) { setCooldown(Math.ceil(remaining / 1000)); setState('rate_limited'); return; }
        
        setState('loading');
        try {
            const data = await analyzeJournalSentiment(user.id);
            if (!data) { setState('empty'); } else { setResult(data); setState('success'); }
        } catch (err) {
            if (err.message === 'RATE_LIMITED') { setCooldown(Math.ceil(getJournalRateLimitRemaining() / 1000)); setState('rate_limited'); }
            else { console.error('Journal AI error:', err); setState('error'); }
        }
    }, [user]);

    useEffect(() => {
        if (state !== 'rate_limited' || cooldown <= 0) return;
        const id = setInterval(() => {
            setCooldown((prev) => { if (prev <= 1) { clearInterval(id); setState('idle'); return 0; } return prev - 1; });
        }, 1000);
        return () => clearInterval(id);
    }, [state, cooldown]);

    useEffect(() => { runAnalysis(); }, [runAnalysis]);

    const formatCooldown = (secs) => { const m = Math.floor(secs / 60), s = secs % 60; return m > 0 ? `${m}m ${s}s` : `${s}s`; };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 24, delay: 0.1 }}
            className="glass-card p-10 relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 w-40 h-40 bg-saffron/8 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-divine/8 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none" />

            <div className="relative flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-[1.25rem] bg-gradient-to-br from-saffron/20 to-primary/20 flex items-center justify-center shadow-inner">
                        <BrainCircuit size={20} className="text-saffron" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black dark:text-white tracking-tight leading-none">Journal Sentiment</h3>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-0.5">AI Emotional Insight</p>
                    </div>
                </div>
                {(state === 'success' || state === 'error' || state === 'idle') && (
                    <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.93 }} onClick={runAnalysis}
                        className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-saffron/10 hover:text-saffron transition-all" title="Refresh analysis">
                        <RefreshCw size={15} />
                    </motion.button>
                )}
            </div>

            <AnimatePresence mode="wait">
                {state === 'loading' && (
                    <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <LoadingState />
                        <p className="text-xs text-slate-400 font-medium mt-5 text-center">Reading your inner thoughts...</p>
                    </motion.div>
                )}
                
                {state === 'success' && result && (
                    <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-7">
                        {/* Detected Emotion Badge */}
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-black uppercase tracking-widest text-slate-400">Detected Emotion:</span>
                            <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border ${getMoodStyle(result.mood)}`}>
                                {result.mood || 'Reflective'}
                            </span>
                        </div>

                        {/* Insight quote */}
                        <div className="p-6 bg-gradient-to-br from-saffron/10 to-purple-divine/10 rounded-[1.75rem] border border-saffron/20 relative">
                            <span className="absolute -top-3 left-5 px-3 py-1 bg-saffron text-white rounded-full text-[9px] font-black uppercase tracking-widest shadow-md">Insight</span>
                            <p className="text-slate-700 dark:text-slate-200 font-black italic leading-relaxed mt-1 text-base">"{result.insight}"</p>
                        </div>
                        
                        {/* Suggestions */}
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Spiritual Compass</p>
                            <ul className="space-y-3">
                                {result.suggestions?.map((s, i) => <SuggestionItem key={i} text={s} index={i} />)}
                            </ul>
                        </div>
                    </motion.div>
                )}

                {(state === 'empty' || state === 'idle') && (
                    <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-8 space-y-4">
                        <div className="w-16 h-16 mx-auto rounded-[1.5rem] bg-saffron/8 flex items-center justify-center">
                            <Feather size={28} className="text-saffron/50" />
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 font-medium text-sm leading-relaxed max-w-xs mx-auto">
                            Write a journal entry to receive AI emotional insights.
                        </p>
                        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={runAnalysis}
                            className="mt-2 text-xs font-black uppercase tracking-widest text-saffron hover:text-saffron/80 transition-colors">
                            Check Again
                        </motion.button>
                    </motion.div>
                )}

                {state === 'error' && (
                    <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-4 py-6 text-center">
                        <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center">
                            <AlertCircle size={22} className="text-red-500" />
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Could not reach the AI. Please verify your connection or API key.</p>
                        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={runAnalysis}
                            className="text-xs font-black uppercase tracking-widest text-saffron">Retry</motion.button>
                    </motion.div>
                )}

                {state === 'rate_limited' && (
                    <motion.div key="rate" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-6 space-y-3">
                        <div className="w-12 h-12 mx-auto rounded-2xl bg-saffron/10 flex items-center justify-center">
                            <RefreshCw size={20} className="text-saffron" />
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Deep reflections return in</p>
                        <p className="text-3xl font-black text-saffron tabular-nums">{formatCooldown(cooldown)}</p>
                        {result && (
                            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-5 bg-saffron/5 rounded-2xl border border-saffron/10 text-left">
                                <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Last Insight</p>
                                <p className="text-sm text-slate-600 dark:text-slate-300 font-medium italic">"{result.insight}"</p>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default AIJourneyInsightCard;
