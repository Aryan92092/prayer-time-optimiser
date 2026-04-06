import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Pause, CheckCircle2, Timer, SkipForward, BookOpen, Minimize2, Maximize2 } from 'lucide-react';
import { useTimer } from '../context/TimerContext';

const RADIUS = 100;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
};

const FocusTimerModal = () => {
    const {
        activeEntry: entry, phase, totalSeconds, remaining, running, isMinimized,
        startTimer, togglePause, closeTimer, completeTimer, minimizeTimer, restoreTimer
    } = useTimer();

    useEffect(() => {
        const handler = (e) => {
            if (e.key === 'Escape' && phase !== 'none' && !isMinimized) closeTimer();
            if (e.key === ' ' && phase === 'running' && !isMinimized) {
                e.preventDefault();
                togglePause();
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [phase, isMinimized, closeTimer, togglePause]);

    if (phase === 'none' || !entry) return null;

    const progress = totalSeconds > 0 ? remaining / totalSeconds : 1;
    const strokeDashoffset = CIRCUMFERENCE * (1 - progress);

    const ringColor = (() => {
        if (progress > 0.5) return '#7c3aed';
        if (progress > 0.25) return '#f59e0b';
        return '#ef4444';
    })();

    // ── MINIMIZED VIEW ──
    if (isMinimized) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white rounded-full shadow-2xl flex items-center gap-4 p-2 pr-6 border border-slate-700 cursor-pointer overflow-hidden group"
                onClick={restoreTimer}
            >
                <div className="absolute inset-0 bg-primary/20 group-hover:bg-primary/30 transition-colors" />
                <button
                    onClick={(e) => { e.stopPropagation(); togglePause(); }}
                    className="relative z-10 w-12 h-12 rounded-full bg-primary flex items-center justify-center hover:bg-primary-light transition-colors"
                >
                    {running ? <Pause size={20} /> : <Play size={20} />}
                </button>
                <div className="relative z-10 flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        {entry.activity_title.substring(0, 15)}...
                    </span>
                    <span className="text-xl font-black tabular-nums">{formatTime(remaining)}</span>
                </div>
                <Maximize2 size={16} className="relative z-10 text-slate-500 group-hover:text-white transition-colors ml-2" />
            </motion.div>
        );
    }

    // ── FULL VIEW ──
    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                onClick={(e) => e.target === e.currentTarget && closeTimer()}
            >
                <motion.div
                    initial={{ scale: 0.85, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.85, opacity: 0, y: 30 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                    className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden max-h-[95vh] overflow-y-auto"
                >
                    <div className="h-2 bg-gradient-to-r from-primary via-purple-divine to-saffron" />

                    <div className="absolute top-6 right-6 flex items-center gap-2 z-10">
                        {phase === 'running' && (
                            <button onClick={minimizeTimer} className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-primary hover:bg-primary/10 transition-all">
                                <Minimize2 size={18} />
                            </button>
                        )}
                        <button onClick={closeTimer} className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-primary hover:bg-primary/10 transition-all">
                            <X size={18} />
                        </button>
                    </div>

                    <div className="p-8 md:p-12">
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                                <Timer size={12} /> Focus Session
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">{entry.activity_title}</h2>
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">{entry.activity_description}</p>
                        </div>

                        {phase === 'pick' && (
                            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-center mt-12 pb-8">
                                <div className="grid grid-cols-2 gap-4">
                                    {[30, 60].map((min) => (
                                        <motion.button key={min} whileHover={{ scale: 1.03, y: -3 }} whileTap={{ scale: 0.97 }} onClick={() => startTimer(min)}
                                            className="p-6 md:p-8 rounded-3xl border-2 border-slate-100 dark:border-slate-800 hover:border-primary hover:bg-primary/5 transition-all group">
                                            <p className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white group-hover:text-primary transition-colors">{min}</p>
                                            <p className="text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-400 mt-2">Start {min} Min Session</p>
                                        </motion.button>
                                    ))}
                                </div>
                                <p className="text-xs text-slate-400 font-medium pt-2">
                                    Press <kbd className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-mono text-xs">Space</kbd> to pause ·{' '}
                                    <kbd className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-mono text-xs">Esc</kbd> to close
                                </p>
                            </motion.div>
                        )}

                        {phase === 'running' && (
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-10 text-center">
                                <div className="relative w-64 h-64 mx-auto">
                                    <svg className="w-full h-full -rotate-90" viewBox="0 0 240 240">
                                        <circle cx="120" cy="120" r={RADIUS} fill="none" stroke="currentColor" strokeWidth="12" className="text-slate-100 dark:text-slate-800" />
                                        <motion.circle cx="120" cy="120" r={RADIUS} fill="none" stroke={ringColor} strokeWidth="12" strokeLinecap="round" strokeDasharray={CIRCUMFERENCE} animate={{ strokeDashoffset }} transition={{ duration: 0.5, ease: 'linear' }} />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <motion.p key={remaining} initial={{ scale: 1.05 }} animate={{ scale: 1 }} className="text-6xl font-black text-slate-900 dark:text-white tabular-nums">
                                            {formatTime(remaining)}
                                        </motion.p>
                                        <p className="text-xs font-black uppercase tracking-widest text-slate-400 mt-2">{running ? 'Remaining' : 'Paused'}</p>
                                    </div>
                                    {running && <motion.div animate={{ scale: [1, 1.06, 1], opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 2, repeat: Infinity }} className="absolute inset-0 rounded-full" style={{ boxShadow: `0 0 40px 10px ${ringColor}30` }} />}
                                </div>

                                <div className="flex items-center justify-center gap-4">
                                    <motion.button whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }} onClick={togglePause}
                                        className="w-16 h-16 rounded-2xl bg-primary text-white flex items-center justify-center shadow-xl shadow-primary/30">
                                        {running ? <Pause size={28} /> : <Play size={28} />}
                                    </motion.button>
                                    <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={completeTimer}
                                        className="px-6 py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 flex items-center gap-2 font-black text-sm hover:border-emerald-400 hover:text-emerald-500 transition-all">
                                        <SkipForward size={18} /> Mark Done
                                    </motion.button>
                                </div>
                            </motion.div>
                        )}

                        {phase === 'done' && (
                            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15 }} className="space-y-6 text-center">
                                <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: 2, duration: 0.4 }} className="w-28 h-28 bg-emerald-400/10 rounded-full flex items-center justify-center mx-auto">
                                    <CheckCircle2 size={64} className="text-emerald-500" />
                                </motion.div>
                                <div>
                                    <h3 className="text-4xl font-black text-slate-900 dark:text-white mb-2">Session Complete! 🎉</h3>
                                    <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">You stayed focused. Your spirit grows stronger.</p>
                                </div>
                                <motion.button whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.96 }} onClick={completeTimer}
                                    className="w-full bg-gradient-to-r from-emerald-400 to-primary text-white py-6 rounded-2xl font-black text-xl shadow-xl mt-6">
                                    Finish Up
                                </motion.button>
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default FocusTimerModal;
