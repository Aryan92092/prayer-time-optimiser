import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RefreshCw, AlertCircle, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { analyzePrayerBehavior, getRateLimitRemaining } from '../services/aiAnalyzerService';
import { seedSampleLogs } from '../services/prayerLogService';

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
        <Shimmer className="h-5 w-3/4" />
        <Shimmer className="h-5 w-full" />
        <div className="space-y-3 pt-2">
            <Shimmer className="h-4 w-full" />
            <Shimmer className="h-4 w-5/6" />
            <Shimmer className="h-4 w-4/6" />
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
        <span className="mt-1 shrink-0 w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center">
            <ChevronRight size={11} className="text-primary group-hover:translate-x-0.5 transition-transform" />
        </span>
        <span className="text-slate-600 dark:text-slate-300 text-sm font-medium leading-relaxed">{text}</span>
    </motion.li>
);

const AIGuidanceCard = () => { console.log("AIGuidanceCard mounting!"); 
    const { user } = useAuth();
    const [state, setState] = useState('idle');
    const [result, setResult] = useState(null);
    const [cooldown, setCooldown] = useState(0);

    const handleSeedData = async () => {
        if (!user) return;
        setState('loading');
        try {
            await seedSampleLogs(user.id);
            await runAnalysis();
        } catch (err) {
            console.error('Failed to seed data:', err);
            setState('error');
        }
    };

    const runAnalysis = useCallback(async () => {
        if (!user) return;
        const remaining = getRateLimitRemaining();
        if (remaining > 0) { setCooldown(Math.ceil(remaining / 1000)); setState('rate_limited'); return; }
        setState('loading');
        try {
            const data = await analyzePrayerBehavior(user.id);
            if (!data) { setState('empty'); } else { setResult(data); setState('success'); }
        } catch (err) {
            if (err.message === 'RATE_LIMITED') { setCooldown(Math.ceil(getRateLimitRemaining() / 1000)); setState('rate_limited'); }
            else { console.error('AI analysis error:', err); setState('error'); }
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
            transition={{ type: 'spring', stiffness: 220, damping: 24 }}
            className="glass-card p-10 relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 w-40 h-40 bg-primary/8 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-teal-aurora/8 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none" />

            <div className="relative flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-[1.25rem] bg-gradient-to-br from-primary/20 to-purple-divine/20 flex items-center justify-center shadow-inner">
                        <Sparkles size={20} className="text-primary" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black dark:text-white tracking-tight leading-none">AI Spiritual Guidance</h3>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-0.5">Prayer Behavior Analysis</p>
                    </div>
                </div>
                {(state === 'success' || state === 'error' || state === 'idle') && (
                    <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.93 }} onClick={runAnalysis}
                        className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-primary/10 hover:text-primary transition-all" title="Refresh analysis">
                        <RefreshCw size={15} />
                    </motion.button>
                )}
            </div>

            <AnimatePresence mode="wait">
                {state === 'loading' && (
                    <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <LoadingState />
                        <p className="text-xs text-slate-400 font-medium mt-5 text-center">Analyzing your prayer habits...</p>
                    </motion.div>
                )}
                {state === 'success' && result && (
                    <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-7">
                        <div className="p-6 bg-gradient-to-br from-primary/10 to-purple-divine/10 rounded-[1.75rem] border border-primary/20 relative">
                            <span className="absolute -top-3 left-5 px-3 py-1 bg-primary text-white rounded-full text-[9px] font-black uppercase tracking-widest shadow-md">Insight</span>
                            <p className="text-slate-700 dark:text-slate-200 font-black italic leading-relaxed mt-1 text-base">"{result.insight}"</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Personalised Suggestions</p>
                            <ul className="space-y-3">
                                {result.suggestions.map((s, i) => <SuggestionItem key={i} text={s} index={i} />)}
                            </ul>
                        </div>
                    </motion.div>
                )}
                {(state === 'empty' || state === 'idle') && (
                    <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-8 space-y-4">
                        <div className="w-16 h-16 mx-auto rounded-[1.5rem] bg-primary/8 flex items-center justify-center">
                            <Sparkles size={28} className="text-primary/50" />
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 font-medium text-sm leading-relaxed max-w-xs mx-auto">
                            Not enough data yet. Continue logging prayers to receive AI insights.
                        </p>
                        <div className="flex justify-center gap-4 mt-2">
                            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={runAnalysis}
                                className="text-xs font-black uppercase tracking-widest text-primary hover:text-primary/80 transition-colors">
                                Try again
                            </motion.button>
                            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={handleSeedData}
                                className="text-xs font-black uppercase tracking-widest text-saffron hover:text-saffron/80 transition-colors">
                                Add Test Data
                            </motion.button>
                        </div>
                    </motion.div>
                )}
                {state === 'error' && (
                    <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-4 py-6 text-center">
                        <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center">
                            <AlertCircle size={22} className="text-red-500" />
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Could not reach AI service. Please check your API key or try again later.</p>
                        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={runAnalysis}
                            className="text-xs font-black uppercase tracking-widest text-primary">Retry</motion.button>
                    </motion.div>
                )}
                {state === 'rate_limited' && (
                    <motion.div key="rate" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-6 space-y-3">
                        <div className="w-12 h-12 mx-auto rounded-2xl bg-saffron/10 flex items-center justify-center">
                            <RefreshCw size={20} className="text-saffron" />
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Analysis available again in</p>
                        <p className="text-3xl font-black text-saffron tabular-nums">{formatCooldown(cooldown)}</p>
                        {result && (
                            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-5 bg-primary/5 rounded-2xl border border-primary/10 text-left">
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

export default AIGuidanceCard;

