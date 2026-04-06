import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

const TodayFocusCard = ({ task, onToggle, onFocusNow }) => {
    if (!task) return null;

    const isMotivational = task.allCompleted || task.message;

    return (
        <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="divine-glow relative overflow-hidden bg-gradient-to-br from-primary via-purple-divine to-saffron p-10 rounded-[3rem] text-white shadow-2xl border border-white/20"
        >
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                <div className="flex-1">
                    <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6">
                        <span className="w-1.5 h-1.5 bg-gold-divine rounded-full animate-pulse" />
                        {isMotivational ? 'Daily Reflection' : 'Sacred Focus'}
                    </div>

                    <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tight leading-tight">
                        {isMotivational ? task.message : task.activity_title}
                    </h2>

                    {!isMotivational && (
                        <p className="text-white/80 line-clamp-2 text-lg font-medium max-w-xl">
                            {task.activity_description}
                        </p>
                    )}
                </div>

                {!isMotivational && !task.isLocked && (
                    <div className="flex flex-col sm:flex-row shadow-xl rounded-2xl overflow-hidden shrink-0 mt-6 md:mt-0">
                        <button
                            onClick={() => onFocusNow && onFocusNow(task)}
                            className="group bg-white text-primary px-8 py-5 font-black flex items-center justify-center gap-2 hover:bg-slate-50 transition-all text-lg border-b sm:border-b-0 sm:border-r border-slate-100"
                        >
                            Focus Now
                        </button>
                        <button
                            onClick={() => onToggle(task.id, false)}
                            className="group bg-white/95 text-slate-900 px-8 py-5 font-black flex items-center justify-center gap-3 hover:bg-white transition-all text-lg flex-1"
                        >
                            Mark Done
                            <CheckCircle2 size={24} className="text-emerald-500 group-hover:scale-110 transition-transform" />
                        </button>
                    </div>
                )}

                {task.isLocked && (
                    <div className="bg-amber-500/20 text-white px-6 py-4 rounded-xl font-bold flex items-center gap-2 mt-6 md:mt-0 shadow-inner backdrop-blur-sm border border-amber-400/30">
                        Complete previous tasks to unlock
                    </div>
                )}
            </div>

            {/* Decorative glows */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gold-divine/20 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none" />
        </motion.div>
    );
};

export default TodayFocusCard;
